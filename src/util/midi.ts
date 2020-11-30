import { BinaryReader } from "./binaryReader"


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
	events: any[]
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
	
	
	static readTrack(r: BinaryReader, midi: Root)
	{
		if (r.readAsciiLength(4) != "MTrk")
			throw "invalid midi track magic"
		
		let track: Track =
		{
			length: r.readUInt32BE(),
			events: [],
		}
		
		let runningModePreviousCode = -1
		let currentTime = 0
		
		let eventStartPos = r.getPosition()
		while (r.getPosition() < eventStartPos + track.length)
		{
			const event = Decoder.readTrackEvent(r, currentTime, runningModePreviousCode)
			runningModePreviousCode = event.code
			currentTime = event.time
			track.events.push(event)
		}
		
		r.seek(eventStartPos + track.length)
		
		return track
	}
	
	
	static readTrackEvent(r: BinaryReader, currentTime: number, runningModePreviousCode: number)
	{
		let event: any = {}
		
		event.deltaTime = this.readVarLengthUInt(r)
		event.time = currentTime + event.deltaTime
		
		if ((r.peekByte() & 0x80) == 0)
			event.code = runningModePreviousCode
		else
			event.code = r.readByte()
		
		if (event.code >= 0x80 && event.code <= 0xef)
		{
			if (event.code >= 0xc0 && event.code <= 0xdf)
				event.rawData = r.readBytes(1)
			else
				event.rawData = r.readBytes(2)
			
			this.decodeChannelVoiceEvent(event)
		}
		else if (event.code >= 0xf0 && event.code <= 0xfe)
		{
			event.length = this.readVarLengthUInt(r)
			event.rawData = r.readBytes(event.length)
		}
		else if (event.code == 0xff)
		{
			event.metaType = r.readByte()
			event.length = this.readVarLengthUInt(r)
			event.rawData = r.readBytes(event.length)
			this.decodeMetaEvent(event)
		}
		else
			throw "invalid track event code 0x" + event.code.toString(16)
		
		return event
	}
	
	
	static decodeChannelVoiceEvent(event: any)
	{
		const isNoteOff = (event.code & 0xf0) == 0x80
		const isNoteOn = (event.code & 0xf0) == 0x90
		const isController = (event.code & 0xf0) == 0xb0
		const isProgramChange = (event.code & 0xf0) == 0xc0
		
		if (isNoteOff || isNoteOn)
		{
			event.kind = (isNoteOn ? "noteOn" : "noteOff")
			event.channel = (event.code & 0x0f)
			event.key = event.rawData[0]
			event.velocity = event.rawData[1]
			
			const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
			const noteName = noteNames[event.key % 12]
			const noteOctave = Math.floor(event.key / 12)
			
			event.description =
				(isNoteOff ? "[8*] Note Off: " : "[9*] Note On: ") +
				noteName + noteOctave + ", Velocity: " + event.velocity
		}
		else if (isController)
		{
			event.kind = "controller"
			event.channel = (event.code & 0x0f)
			event.controllerNumber = event.rawData[0]
			event.controllerValue = event.rawData[1]

			const controllerNames: any =
			{
				7: "channelVolumeCoarse",
				39: "channelVolumeFine",
			}

			event.controllerName = controllerNames[event.controllerNumber]
			event.description =
				"Controller: " +
				"[" + event.controllerNumber + "] " + event.controllerName +
				": " + event.controllerValue
		}
		else if (isProgramChange)
		{
			event.kind = "programChange"
			event.channel = (event.code & 0x0f)
			event.program = event.rawData[0]
			event.description = "Program Change: " + event.program
		}
	}
	
	
	static decodeMetaEvent(event: any)
	{
		let r = new BinaryReader(event.rawData)
		
		if (event.metaType == 0x03)
		{
			event.kind = "trackName"
			event.text = r.readAsciiLength(event.length)
			event.description =
				"[FF 03] Track Name: " + event.text
		}

		else if (event.metaType == 0x2f)
		{
			event.kind = "endOfTrack"
			event.description = "[FF 2F] End of Track"
		}
		
		else if (event.metaType == 0x51)
		{
			event.kind = "setTempo"
			event.msPerQuarterNote = r.readUInt24BE()
			event.description =
				"[FF 51] Set Tempo: " +
				event.msPerQuarterNote + " µs/quarter note"
		}
		
		else if (event.metaType == 0x58)
		{
			event.kind = "setTimeSignature"
			event.numerator = r.readByte()
			event.denominator = Math.pow(2, r.readByte())
			event.ticks = r.readByte()
			event.quarterNoteTicks = r.readByte()
			event.description =
				"[FF 51] Set Time Signature: " +
				event.numerator + " / "+ event.denominator + ", " +
				"ticks: " + event.ticks + ", " +
				"quarter note ticks: " + event.quarterNoteTicks
		}
		
		else if (event.metaType == 0x59)
		{
			event.kind = "setKeySignature"
			event.accidentals = r.readSByte()
			event.scale = r.readByte()
			event.description =
				"[FF 51] Set Key Signature: " +
				event.accidentals + " accidentals, " +
				"scale: " + event.scale
		}
		
		else if (event.metaType == 0x7f)
		{
			event.kind = "sequencerSpecific"
			event.text = r.readAsciiLength(event.length)
			event.description =
				"[FF 7F] Sequencer-Specific: " +
				event.text
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