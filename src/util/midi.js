import { BinaryReader } from "./binaryReader.js"


export class MidiFile
{
	static fromBytes(bytes)
	{
		let midi = new MidiFile()
		
		let r = new BinaryReader(bytes)
		midi.readHeader(r)
		midi.readTracks(r)
		
		return midi
	}
	
	
	readHeader(r)
	{
		if (r.readAsciiLength(4) != "MThd")
			throw "invalid midi header magic"
		
		this.headerLength = r.readUInt32BE()
		
		this.format = r.readUInt16BE()
		this.trackNum = r.readUInt16BE()
		this.timeDivisionRaw = r.readUInt16BE()
		
		this.timeDivisionFormat = (this.timeDivisionRaw & 0x8000) != 0
		
		if (this.timeDivisionFormat)
			throw "unsupported time division format"
		
		this.ticksPerQuarterNote = (this.timeDivisionRaw & 0x7fff)
		
		r.seek(8 + this.headerLength)
	}
	
	
	readTracks(r)
	{
		this.tracks = []
		
		for (let i = 0; i < this.trackNum; i++)
			this.tracks.push(this.readTrack(r))
	}
	
	
	readTrack(r)
	{
		if (r.readAsciiLength(4) != "MTrk")
			throw "invalid midi track magic"
		
		let track = { }
		
		track.length = r.readUInt32BE()
		track.events = []
		
		let runningModePreviousCode = -1
		let currentTime = 0
		
		let eventStartPos = r.getPosition()
		while (r.getPosition() < eventStartPos + track.length)
		{
			const event = this.readTrackEvent(r, currentTime, runningModePreviousCode)
			runningModePreviousCode = event.code
			currentTime = event.time
			track.events.push(event)
		}
		
		r.seek(eventStartPos + track.length)
		
		return track
	}
	
	
	readTrackEvent(r, currentTime, runningModePreviousCode)
	{
		let event = { }
		
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
	
	
	decodeChannelVoiceEvent(event)
	{
		const isNoteOff = (event.code & 0xf0) == 0x80
		const isNoteOn = (event.code & 0xf0) == 0x90
		
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
	}
	
	
	decodeMetaEvent(event)
	{
		let r = new BinaryReader(event.rawData)
		
		if (event.metaType == 0x03)
		{
			event.kind = "trackName"
			event.description = "[FF 03] Track Name"
			event.name = r.readAsciiLength(event.rawData.length)
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
				"ticks: " + event.scale + ", " +
				"quarter note ticks: " + event.scale
		}
		
		else if (event.metaType == 0x59)
		{
			event.kind = "setKeySignature"
			event.accidentals = r.readByte()
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
	
	
	readVarLengthUInt(r)
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