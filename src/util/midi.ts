import { BinaryReader } from "./binaryReader"
import { BinaryWriter } from "./binaryWriter"
import Rational from "./rational"


export interface Root
{
    tracks: Track[]
    headerLength: any
    format: any
    trackNum: number
    timeDivisionRaw: number
    timeDivisionFormat: boolean
    ticksPerQuarterNote: number
}


export interface Track
{
	length: number
	events: Event[]
}


export type Event =
	EventUnknown |
	EventNoteOn |
	EventNoteOff |
	EventController |
	EventProgramChange |
	EventEndOfTrack |
	EventTrackName |
	EventSetTempo |
	EventSetTimeSignature |
	EventSetKeySignature |
	EventSequencerSpecific


export interface EventCommon
{
	tick: Rational
}


export interface EventUnknown extends EventCommon
{
	kind: "unknown"
	code: number
	metaCode: number | null
	rawData: number[]
}


export interface EventNoteOn extends EventCommon
{
	kind: "noteOn"
	channel: number
	key: number
	velocity: number
}


export interface EventNoteOff extends EventCommon
{
	kind: "noteOff"
	channel: number
	key: number
	velocity: number
}


export interface EventController extends EventCommon
{
	kind: "controller"
	channel: number
	controllerNumber: number
	controllerValue: number
	controllerName:
		"channelVolumeCoarse" |
		"channelVolumeFine"
}


export interface EventProgramChange extends EventCommon
{
	kind: "programChange"
	channel: number
	program: number
}


export interface EventEndOfTrack extends EventCommon
{
	kind: "endOfTrack"
}


export interface EventTrackName extends EventCommon
{
	kind: "trackName"
	name: string
}


export interface EventSetTempo extends EventCommon
{
	kind: "setTempo"
	bpm: number
}


export interface EventSetTimeSignature extends EventCommon
{
	kind: "setTimeSignature"
	numerator: number
	denominator: number
	ticks: number
	quarterNoteTicks: number
}


export interface EventSetKeySignature extends EventCommon
{
	kind: "setKeySignature"
	accidentals: number
	scale: number
}


export interface EventSequencerSpecific extends EventCommon
{
	kind: "sequencerSpecific"
	text: string
}


interface TrackEvent
{
	event: Event,
	code: number,
	midiTime: number,
}


export class Decoder
{
	static fromBytes(bytes: number[] | Buffer | Uint8Array): Root
	{
		let midi: any = {}
		
		let r = new BinaryReader(bytes)
		Decoder.readHeader(r, midi)
		Decoder.readTracks(r, midi)
		
		return midi as Root
	}
	
	
	static readHeader(r: BinaryReader, midi: Root)
	{
		if (r.readAsciiLength(4) != "MThd")
			throw "invalid midi header magic"
		
		midi.headerLength = r.readUInt32BE()
		
		midi.format = r.readUInt16BE()
		midi.trackNum = r.readUInt16BE()
		midi.timeDivisionRaw = r.readUInt16BE()
		
		midi.timeDivisionFormat = (midi.timeDivisionRaw & 0x8000) != 0
		
		if (midi.timeDivisionFormat)
			throw "unsupported time division format"
		
        midi.ticksPerQuarterNote = (midi.timeDivisionRaw & 0x7fff)
		
		r.seek(8 + midi.headerLength)
	}
	
	
	static readTracks(r: BinaryReader, midi: Root)
	{
		midi.tracks = []
		
		for (let i = 0; i < midi.trackNum; i++)
            midi.tracks.push(Decoder.readTrack(r, midi))
	}
	
	
	static readTrack(r: BinaryReader, root: Root): Track
	{
		if (r.readAsciiLength(4) != "MTrk")
			throw "invalid midi track magic"
		
		let track: Track =
		{
			length: r.readUInt32BE(),
			events: [],
		}
		
		let runningModePreviousCode = -1
		let currentMidiTime = 0
		
		let eventStartPos = r.getPosition()
		while (r.getPosition() < eventStartPos + track.length)
		{
			const { event, code, midiTime } = Decoder.readTrackEvent(
				r, root, currentMidiTime, runningModePreviousCode)

			runningModePreviousCode = code
			currentMidiTime = midiTime
			track.events.push(event)
		}
		
		r.seek(eventStartPos + track.length)
		
		return track
	}
	
	
	static readTrackEvent(
		r: BinaryReader,
		root: Root,
		currentMidiTime: number,
		runningModePreviousCode: number)
		: TrackEvent
	{
		const midiDeltaTime = this.readVarLengthUInt(r)
		const midiTime = currentMidiTime + midiDeltaTime

		let code = 0
		
		if ((r.peekByte() & 0x80) == 0)
			code = runningModePreviousCode
		else
			code = r.readByte()
			
		const event: EventCommon =
		{
			tick: Rational.fromFloat(midiTime / root.ticksPerQuarterNote / 4, 27720),
		}

		let finalEvent: Event
		
		if (code >= 0x80 && code <= 0xef)
		{
			let rawData: number[] = []

			if (code >= 0xc0 && code <= 0xdf)
				rawData = r.readBytes(1)
			else
				rawData = r.readBytes(2)
			
			finalEvent = this.decodeChannelVoiceEvent(event, code, rawData)
		}
		else if (code >= 0xf0 && code <= 0xfe)
		{
			const length = this.readVarLengthUInt(r)
			const eventUnknown: EventUnknown =
			{
				...event,
				kind: "unknown",
				code,
				metaCode: null,
				rawData: r.readBytes(length),
			}

			finalEvent = eventUnknown
		}
		else if (code == 0xff)
		{
			const metaCode = r.readByte()
			const length = this.readVarLengthUInt(r)
			const rawData = r.readBytes(length)
			finalEvent = this.decodeMetaEvent(event, metaCode, rawData)
		}
		else
			throw "invalid track event code 0x" + code.toString(16)

		return {
			event: finalEvent,
			code,
			midiTime,
		}
	}
	
	
	static decodeChannelVoiceEvent(event: EventCommon, code: number, rawData: number[]): Event
	{
		const isNoteOff = (code & 0xf0) == 0x80
		const isNoteOn = (code & 0xf0) == 0x90
		const isController = (code & 0xf0) == 0xb0
		const isProgramChange = (code & 0xf0) == 0xc0
		
		if (isNoteOff || isNoteOn)
		{
			const channel = (code & 0x0f)
			const key = rawData[0]
			const velocity = rawData[1]

			const isReallyNoteOff = isNoteOff || rawData[1] == 0

			if (isReallyNoteOff)
			{
				const eventNoteOff: EventNoteOff =
				{
					...event,
					kind: "noteOff",
					channel, key, velocity,
				}

				return eventNoteOff
			}
			else
			{
				const eventNoteOn: EventNoteOn =
				{
					...event,
					kind: "noteOn",
					channel, key, velocity,
				}

				return eventNoteOn
			}
		}
		else if (isController)
		{
			const controllerNames: { [id: number]: EventController["controllerName"] } =
			{
				7: "channelVolumeCoarse",
				39: "channelVolumeFine",
			}

			const eventController: EventController =
			{
				...event,
				kind: "controller",
				channel: (code & 0x0f),
				controllerNumber: rawData[0],
				controllerValue: rawData[1],
				controllerName: controllerNames[rawData[0]] || "unknown",
			}

			return eventController
		}
		else if (isProgramChange)
		{
			const eventProgramChange: EventProgramChange =
			{
				...event,
				kind: "programChange",
				channel: (code & 0x0f),
				program: rawData[0],
			}

			return eventProgramChange
		}
		else
		{
			const eventUnknown: EventUnknown =
			{
				...event,
				kind: "unknown",
				code,
				metaCode: null,
				rawData,
			}

			return eventUnknown
		}
	}
	
	
	static decodeMetaEvent(event: EventCommon, metaCode: number, rawData: number[]): Event
	{
		let r = new BinaryReader(rawData)
		
		if (metaCode == 0x03)
		{
			const name = r.readAsciiLength(r.getLength())

			const eventTrackName: EventTrackName =
			{
				...event,
				kind: "trackName",
				name,
			}

			return eventTrackName
		}

		else if (metaCode == 0x2f)
		{
			const eventEndOfTrack: EventEndOfTrack =
			{
				...event,
				kind: "endOfTrack",
			}

			return eventEndOfTrack
		}
		
		else if (metaCode == 0x51)
		{
			const msPerQuarterNote = r.readUInt24BE()
			
			const eventSetTempo: EventSetTempo =
			{
				...event,
				kind: "setTempo",
				bpm: 60 * 1000 * 1000 / msPerQuarterNote,
			}

			return eventSetTempo
		}
		
		else if (metaCode == 0x58)
		{
			const numerator = r.readByte()
			const denominator = Math.pow(2, r.readByte())
			const ticks = r.readByte()
			const quarterNoteTicks = r.readByte()
			
			const eventSetTimeSignature: EventSetTimeSignature =
			{
				...event,
				kind: "setTimeSignature",
				numerator, denominator,
				ticks, quarterNoteTicks,
			}

			return eventSetTimeSignature
		}
		
		else if (metaCode == 0x59)
		{
			const accidentals = r.readSByte()
			const scale = r.readByte()

			const eventSetKeySignature: EventSetKeySignature =
			{
				...event,
				kind: "setKeySignature",
				accidentals, scale,
			}

			return eventSetKeySignature
		}
		
		else if (metaCode == 0x7f)
		{
			const text = r.readAsciiLength(r.getLength())

			const eventSequencerSpecific: EventSequencerSpecific =
			{
				...event,
				kind: "sequencerSpecific",
				text,
			}

			return eventSequencerSpecific
		}
		else
		{
			const eventUnknown: EventUnknown =
			{
				...event,
				kind: "unknown",
				code: 0xff,
				metaCode,
				rawData
			}

			return eventUnknown
		}
	}
	
	
	static readVarLengthUInt(r: BinaryReader): number
	{
		let value = 0
		
		while (true)
		{
			let byte = r.readByte()
			value = (value << 7) + (byte & 0x7f)
			
			if ((byte & 0x80) == 0)
				break
		}
		
		return value
	}
}


export class Encoder
{
	static encode(root: Root): Uint8Array
	{
		var writer = new BinaryWriter()

		Encoder.encodeHeader(writer, root)

		for (const track of root.tracks)
			Encoder.encodeTrack(writer, root, track)

		return new Uint8Array(writer.bytes)
	}


	static encodeHeader(writer: BinaryWriter, root: Root)
	{
		writer.writeAscii("MThd")
		writer.writeUInt32BE(6)
		writer.writeUInt16BE(1)
		writer.writeUInt16BE(root.tracks.length)
		writer.writeUInt16BE(root.ticksPerQuarterNote & 0x7fff)
	}


	static encodeTrack(writer: BinaryWriter, root: Root, track: Track)
	{
		writer.writeAscii("MTrk")

		const trackByteLengthPos = writer.head
		writer.writeUInt32BE(0)

		let prevMidiTime = 0

		track.events.sort((a, b) => a.tick.compare(b.tick))

		for (const ev of track.events)
		{
			const midiTime = Math.floor(
				ev.tick.asFloat() * 4 * root.ticksPerQuarterNote)

			const deltaMidiTime = Math.max(0, midiTime - prevMidiTime)
			prevMidiTime = midiTime

			Encoder.writeVarLengthUInt(writer, deltaMidiTime)

			switch (ev.kind)
			{
				case "noteOff":
				{
					writer.writeByte(0x80 | (ev.channel & 0x0f))
					writer.writeByte(ev.key & 0x7f)
					writer.writeByte(ev.velocity & 0x7f)
					break
				}
				case "noteOn":
				{
					writer.writeByte(0x90 | (ev.channel & 0x0f))
					writer.writeByte(ev.key & 0x7f)
					writer.writeByte(ev.velocity & 0x7f)
					break
				}
				case "programChange":
				{
					writer.writeByte(0xc0 | (ev.channel & 0x0f))
					writer.writeByte(ev.program & 0x7f)
					break
				}
				case "controller":
				{
					writer.writeByte(0xb0 | (ev.channel & 0x0f))
					writer.writeByte(ev.controllerNumber)
					writer.writeByte(ev.controllerValue)
					break
				}
				case "setTempo":
				{
					writer.writeByte(0xff)
					writer.writeByte(0x51)
					writer.writeByte(0x03)
					writer.writeUInt24BE((60 * 1000 * 1000) / ev.bpm)
					break
				}
				case "endOfTrack":
				{
					writer.writeByte(0xff)
					writer.writeByte(0x2f)
					writer.writeByte(0x00)
					break
				}
			}
		}

		const endPos = writer.head
		writer.seek(trackByteLengthPos)
		writer.writeUInt32BE(endPos - trackByteLengthPos - 4)
		writer.seek(endPos)
	}
	
	
	static writeVarLengthUInt(writer: BinaryWriter, value: number)
	{
		let toWrite: number[] = []

		while (true)
		{
			const byte = (value & 0x7f)
			value >>= 7

			toWrite.push(byte)

			if (value == 0)
				break
		}

		for (let i = toWrite.length - 1; i >= 0; i--)
			writer.writeByte((i !== 0 ? 0x80 : 0) | toWrite[i])
	}
}