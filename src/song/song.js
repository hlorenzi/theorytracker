import ListOfPoints from "../util/listOfPoints.js"
import ListOfRanges from "../util/listOfRanges.js"
import { Rational } from "../util/rational.js"
import { Range } from "../util/range.js"
import { Key, scales, Meter, Chord, getChordKindFromId } from "../util/theory.js"
import { MidiFile } from "../util/midi.js"
import { URLBinaryEncoder, URLBinaryDecoder } from "../util/urlBinaryEncoder.js"


export class Song
{
	constructor()
	{
		this.nextId = 1
		this.baseBpm = 120
		this.range = new Range(new Rational(0), new Rational(4))
		this.notes = new ListOfRanges()
		this.chords = new ListOfRanges()
		this.meterChanges = new ListOfPoints()
		this.keyChanges = new ListOfPoints()
	}
	
	
	withChanges(obj)
	{
		let song = new Song()
		song.nextId = this.nextId
		song.baseBpm = this.baseBpm
		song.range = this.range
		song.notes = this.notes
		song.chords = this.chords
		song.meterChanges = this.meterChanges
		song.keyChanges = this.keyChanges
		
		return Object.assign(song, obj)
	}
	
	
	withRefreshedRange()
	{
		let song = this.withChanges({})
		
		song.range = new Range(new Rational(0), new Rational(4))
		song.range = song.range.merge(this.notes.getTotalRange())
		song.range = song.range.merge(this.chords.getTotalRange())
		song.range = song.range.merge(this.meterChanges.getTotalRange())
		song.range = song.range.merge(this.keyChanges.getTotalRange())
		
		return song
	}
	
	
	_upsertElement(listField, elem, remove = false)
	{
		let nextId = this.nextId
		let list = this[listField]
		
		if (elem.id < 0)
		{
			elem = elem.withChanges({ id: nextId })
			nextId++
		}
		else
		{
			list = list.removeById(elem.id)
		}
		
		if (!remove)
			list = list.add(elem)
		
		return this.withChanges({ nextId, [listField]: list })
	}
	
	
	_upsertElements(listField, elems, remove = false)
	{
		let nextId = this.nextId
		let list = this[listField]
		
		let newElems = []
		for (let i = 0; i < elems.length; i++)
		{
			const elem = elems[i]
			if (elem.id < 0)
			{
				newElems.push(elem.withChanges({ id: nextId }))
				nextId++
			}
			else
			{
				newElems.push(elem)
				list = list.removeById(elem.id)
			}
		}
		
		if (!remove)
			list = list.addMany(newElems)
		
		return this.withChanges({ nextId, [listField]: list })
	}
	
	
	upsertNote(note, remove = false)
	{
		return this._upsertElement("notes", note, remove)
	}
	
	
	upsertNotes(notes, remove = false)
	{
		return this._upsertElements("notes", notes, remove)
	}
	
	
	upsertChord(chord, remove = false)
	{
		return this._upsertElement("chords", chord, remove)
	}
	
	
	upsertMeterChange(meterChange, remove = false)
	{
		return this._upsertElement("meterChanges", meterChange, remove)
	}
	
	
	upsertKeyChange(keyChange, remove = false)
	{
		return this._upsertElement("keyChanges", keyChange, remove)
	}
	
	
	getJSON()
	{
		let str = "{\n"
		
		str += "\"version\": " + 3 + ",\n"
		str += "\"bpm\": " + this.baseBpm + ",\n"
		str += "\n"
		
		str += "\"tracks\":\n"
		str += "[\n"
		for (let track = 0; track < 1; track++)
		{
			str += "{\n"
			str += "\"notes\":\n"
			str += "[\n"
			let firstNote = true
			for (const note of this.notes.iterAll())
			{
				if (!firstNote)
					str += ",\n"
				
				firstNote = false
				
				str += "["
				str += note.range.start   .toJSONString() + ","
				str += note.range.duration.toJSONString() + ","
				str += note.pitch
				str += "]"
			}
			str += "\n"
			str += "]\n"
			str += "}\n"
		}
		str += "],\n"
		str += "\n"
		
		str += "\"chords\":\n"
		str += "[\n"
		let firstChord = true
		for (const chord of this.chords.iterAll())
		{
			if (!firstChord)
				str += ",\n"
			
			firstChord = false
			
			str += "["
			str += chord.range.start   .toJSONString() + ","
			str += chord.range.duration.toJSONString() + ","
			str += chord.chord.rootPitch + ","
			str += chord.chord.rootAccidental + ","
			str += "\"" + chord.chord.getKindId() + "\","
			str += JSON.stringify(chord.chord.getModifierArray()) + ","
			str += "0"
			str += "]"
		}
		str += "\n"
		str += "],\n"
		str += "\n"
		
		str += "\"keyChanges\":\n"
		str += "[\n"
		let firstKeyChange = true
		for (const keyChange of this.keyChanges.enumerate())
		{
			if (!firstKeyChange)
				str += ",\n"
			
			firstKeyChange = false
			
			str += "["
			str += keyChange.time.toJSONString() + ","
			str += keyChange.key.tonicPitch + ","
			str += keyChange.key.tonicAccidental + ","
			str += "[" + keyChange.key.scalePitches.join(",") + "]"
			str += "]"
		}
		str += "\n"
		str += "],\n"
		str += "\n"
		
		str += "\"meterChanges\":\n"
		str += "[\n"
		let firstMeterChange = true
		for (const meterChange of this.meterChanges.enumerate())
		{
			if (!firstMeterChange)
				str += ",\n"
			
			firstMeterChange = false
			
			str += "["
			str += meterChange.time.toJSONString() + ","
			str += meterChange.meter.numerator + ","
			str += meterChange.meter.denominator
			str += "]"
		}
		str += "\n"
		str += "]\n"
		
		str += "}"
		return str
	}
	
	
	static fromJSON(json)
	{
		let song = new Song()
		song.baseBpm = json.bpm
		
		for (const note of json.tracks[0].notes)
			song = song.upsertNote(new Note(
				Range.fromStartDuration(Rational.fromArray(note[0]), Rational.fromArray(note[1])),
				note[2]))
		
		if (json.version >= 3)
		{
			for (const chord of json.chords)
			{
				let modifiers = {}
				for (const mod of chord[5])
					modifiers[mod] = true
				
				song = song.upsertChord(new SongChord(
					Range.fromStartDuration(Rational.fromArray(chord[0]), Rational.fromArray(chord[1])),
					new Chord(chord[2], chord[3], getChordKindFromId(chord[4]), modifiers)))
			}
			
			for (const keyChange of json.keyChanges)
				song = song.upsertKeyChange(new KeyChange(
					Rational.fromArray(keyChange[0]),
					new Key(keyChange[1], keyChange[2], keyChange[3])))
		}
		else
		{
			const oldChordKinds =
				["M","m","+","o","5","6","m6","7","maj7","m7","mmaj7","+7","+maj7","o7","%7","9","maj9","m9","mmaj9","9?","+9","+maj9","o9","ob9","%9","%b9"]
			
			for (const chord of json.chords)
				song = song.upsertChord(new SongChord(
					Range.fromStartDuration(Rational.fromArray(chord[0]), Rational.fromArray(chord[1])),
					new Chord(chord[3], chord[4], getChordKindFromId(oldChordKinds[chord[2]]))))
					
			for (const keyChange of json.keyChanges)
				song = song.upsertKeyChange(new KeyChange(
					Rational.fromArray(keyChange[0]),
					new Key(keyChange[2], keyChange[3], scales[keyChange[1]].pitches)))
		}
		
		for (const meterChange of json.meterChanges)
			song = song.upsertMeterChange(new MeterChange(
				Rational.fromArray(meterChange[0]),
				new Meter(meterChange[1], meterChange[2])))
		
		return song.withRefreshedRange()
	}
	
	
	toCompressedURLSafe()
	{
		const song = this.withRefreshedRange()
		
		const w = new URLBinaryEncoder()

		// Write header.
		w.writeInteger(3) // Version
		w.writeInteger(this.baseBpm)
		
		// Write note tracks.
		const trackNum = 1
		w.writeInteger(trackNum)
		for (var j = 0; j < trackNum; j++)
		{
			// Write note data as a structure-of-arrays.
			w.writeInteger(this.notes.size)
			
			let prevNoteRangeStartInteger = 0
			for (const note of this.notes.iterAll())
			{
				w.writeInteger(note.range.start.integer - prevNoteRangeStartInteger)
				prevNoteRangeStartInteger = note.range.start.integer
			}
			
			for (const note of this.notes.iterAll())
				w.writeInteger(note.range.start.numeratorWithoutInteger)

			for (const note of this.notes.iterAll())
				w.writeInteger(note.range.start.denominator)

			for (const note of this.notes.iterAll())
				w.writeInteger(note.range.duration.numerator)

			for (const note of this.notes.iterAll())
				w.writeInteger(note.range.duration.denominator)

			for (const note of this.notes.iterAll())
				w.writeInteger(note.pitch - 60)
		}

		// Write chord data as a structure-of-arrays.
		w.writeInteger(this.chords.size)

		let prevChordRangeStartInteger = 0
		for (const chord of this.chords.iterAll())
		{
			w.writeInteger(chord.range.start.integer - prevChordRangeStartInteger)
			prevChordRangeStartInteger = chord.range.start.integer
		}
		
		for (const chord of this.chords.iterAll())
			w.writeInteger(chord.range.start.numeratorWithoutInteger)

		for (const chord of this.chords.iterAll())
			w.writeInteger(chord.range.start.denominator)

		for (const chord of this.chords.iterAll())
			w.writeInteger(chord.range.duration.numerator)

		for (const chord of this.chords.iterAll())
			w.writeInteger(chord.range.duration.denominator)

		for (const chord of this.chords.iterAll())
			w.writeInteger(chord.chord.rootPitch)

		for (const chord of this.chords.iterAll())
			w.writeInteger(chord.chord.rootAccidental)

		for (const chord of this.chords.iterAll())
			w.writeString(chord.chord.getKindId())

		for (const chord of this.chords.iterAll())
			w.writeInteger(chord.chord.getModifierArray().length)

		for (const chord of this.chords.iterAll())
			for (const mod of chord.chord.getModifierArray())
				w.writeString(mod)
		
		// Write key change data as a structure-of-arrays.
		w.writeInteger(this.keyChanges.items.length)

		for (const keyChange of this.keyChanges.enumerate())
			w.writeInteger(keyChange.time.numerator)

		for (const keyChange of this.keyChanges.enumerate())
			w.writeInteger(keyChange.time.denominator)

		for (const keyChange of this.keyChanges.enumerate())
			w.writeInteger(keyChange.key.tonicPitch)

		for (const keyChange of this.keyChanges.enumerate())
			w.writeInteger(keyChange.key.tonicAccidental)

		for (const keyChange of this.keyChanges.enumerate())
			w.writeInteger(keyChange.key.scalePitches.length)

		for (const keyChange of this.keyChanges.enumerate())
			for (const p of keyChange.key.scalePitches)
				w.writeInteger(p)
		
		// Write meter change data as a structure-of-arrays.
		w.writeInteger(this.meterChanges.items.length)

		for (const meterChange of this.meterChanges.enumerate())
			w.writeInteger(meterChange.time.numerator)

		for (const meterChange of this.meterChanges.enumerate())
			w.writeInteger(meterChange.time.denominator)

		for (const meterChange of this.meterChanges.enumerate())
			w.writeInteger(meterChange.meter.numerator)

		for (const meterChange of this.meterChanges.enumerate())
			w.writeInteger(meterChange.meter.denominator)
		
		
		console.log(w.getCompressedURLSafe().length)
		return "3_" + w.getCompressedURLSafe()
	}
	
	
	static fromCompressedURLSafe(str)
	{
		let song = new Song()
		
		if (!str.startsWith("3_"))
			throw "unsupported version"
		
		const r = new URLBinaryDecoder(str.substr(2))
		
		// Read header.
		const version = r.readInteger()
		song.baseBpm = r.readInteger()
		
		if (version != 3)
			throw "unsupported version"

		// Read note tracks.
		const trackNum = r.readInteger()
		for (let j = 0; j < trackNum; j++)
		{
			// Read note data as structure-of-arrays.
			const noteNum = r.readInteger()
			
			let noteData = []
			
			let prevNoteRangeStartInteger = 0
			for (let i = 0; i < noteNum; i++)
			{
				prevNoteRangeStartInteger += r.readInteger() // range.start.integer
				noteData[i] = [ prevNoteRangeStartInteger ]
			}
			
			for (let i = 0; i < noteNum; i++)
				noteData[i][1] = r.readInteger() // range.start.numeratorWithoutInteger
				
			for (let i = 0; i < noteNum; i++)
				noteData[i][2] = r.readInteger() // range.start.denominator
			
			for (let i = 0; i < noteNum; i++)
				noteData[i][3] = r.readInteger() // range.duration.numerator
			
			for (let i = 0; i < noteNum; i++)
				noteData[i][4] = r.readInteger() // range.duration.denominator
				
			for (let i = 0; i < noteNum; i++)
			{
				const start = Rational.fromIntegerPlusRational(noteData[i][0], noteData[i][1], noteData[i][2])
				const duration = new Rational(noteData[i][3], noteData[i][4])
					
				song = song.upsertNote(new Note(
					Range.fromStartDuration(start, duration),
					r.readInteger() + 60))
			}
		}
	
		// Read chord data as structure-of-arrays.
		const chordNum = r.readInteger()
		
		let chordData = []
		
		let prevChordRangeStartInteger = 0
		for (let i = 0; i < chordNum; i++)
		{
			prevChordRangeStartInteger += r.readInteger() // range.start.integer
			chordData[i] = [ prevChordRangeStartInteger ]
		}
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][1] = r.readInteger() // range.start.numeratorWithoutInteger
			
		for (let i = 0; i < chordNum; i++)
			chordData[i][2] = r.readInteger() // range.start.denominator
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][3] = r.readInteger() // range.duration.numerator
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][4] = r.readInteger() // range.duration.denominator
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][5] = r.readInteger() // chord.tonicPitch
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][6] = r.readInteger() // chord.tonicAccidental
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][7] = r.readString() // chord.getKindId()
		
		for (let i = 0; i < chordNum; i++)
			chordData[i][8] = r.readInteger() // chord.getModifierArray().length
		
		for (let i = 0; i < chordNum; i++)
		{
			chordData[i][9] = {}
			for (let mod = 0; mod < chordData[i][8]; mod++)
				chordData[i][9][r.readString()] = true // chord.getModifierArray()[mod]
		}
		
		for (let i = 0; i < chordNum; i++)
		{
			const start = Rational.fromIntegerPlusRational(chordData[i][0], chordData[i][1], chordData[i][2])
			const duration = new Rational(chordData[i][3], chordData[i][4])
				
			song = song.upsertChord(new SongChord(
				Range.fromStartDuration(start, duration),
				new Chord(chordData[i][5], chordData[i][6], getChordKindFromId(chordData[i][7]), chordData[i][9])))
		}
		
		// Read key change data as structure-of-arrays.
		const keyChangeNum = r.readInteger()
		
		let keyChangeData = []
		
		for (let i = 0; i < keyChangeNum; i++)
			keyChangeData[i] = [ r.readInteger() ] // time.numerator
			
		for (let i = 0; i < keyChangeNum; i++)
			keyChangeData[i][1] = r.readInteger() // time.denominator
		
		for (let i = 0; i < keyChangeNum; i++)
			keyChangeData[i][2] = r.readInteger() // key.tonicPitch
		
		for (let i = 0; i < keyChangeNum; i++)
			keyChangeData[i][3] = r.readInteger() // key.tonicAccidental
		
		for (let i = 0; i < keyChangeNum; i++)
			keyChangeData[i][4] = r.readInteger() // key.scalePitches.length
		
		for (let i = 0; i < keyChangeNum; i++)
		{
			keyChangeData[i][5] = []
			for (let p = 0; p < keyChangeData[i][4]; p++)
				keyChangeData[i][5][p] = r.readInteger() // key.scalePitches[p]
		}
		
		for (let i = 0; i < keyChangeNum; i++)
		{
			const time = new Rational(keyChangeData[i][0], keyChangeData[i][1])
				
			song = song.upsertKeyChange(new KeyChange(
				time,
				new Key(keyChangeData[i][2], keyChangeData[i][3], keyChangeData[i][5])))
		}
		
		// Read meter change data as structure-of-arrays.
		const meterChangeNum = r.readInteger()
		
		let meterChangeData = []
		
		for (let i = 0; i < meterChangeNum; i++)
			meterChangeData[i] = [ r.readInteger() ] // time.numerator
			
		for (let i = 0; i < meterChangeNum; i++)
			meterChangeData[i][1] = r.readInteger() // time.denominator
		
		for (let i = 0; i < meterChangeNum; i++)
			meterChangeData[i][2] = r.readInteger() // numerator
		
		for (let i = 0; i < meterChangeNum; i++)
			meterChangeData[i][3] = r.readInteger() // denominator
		
		for (let i = 0; i < meterChangeNum; i++)
		{
			const time = new Rational(meterChangeData[i][0], meterChangeData[i][1])
				
			song = song.upsertMeterChange(new MeterChange(
				time,
				new Meter(meterChangeData[i][2], meterChangeData[i][3])))
		}
		
		return song.withRefreshedRange()
	}
	
	
	static fromMIDI(bytes)
	{
		const midi = MidiFile.fromBytes(bytes)
		console.log(midi)
		
		const findFirstEvent = (kind) =>
		{
			for (const track of midi.tracks)
				for (const ev of track.events)
					if (ev.kind == kind)
						return ev
					
			return null
		}
		
		let song = new Song()
		
		const tempoEv = findFirstEvent("setTempo")
		const msPerQuarterNote = (tempoEv ? tempoEv.msPerQuarterNote : 500000)
		song.baseBpm = Math.round(60 * 1000 * 1000 / msPerQuarterNote)
		
		let notesToAdd = []
		for (const track of midi.tracks)
		{
			for (const noteOn of track.events)
			{
				if (noteOn.kind != "noteOn" || noteOn.channel == 9)
					continue
				
				let noteOff = null
				for (const ev of track.events)
				{
					if (ev.kind != "noteOn" && ev.kind != "noteOff")
						continue
					
					if (ev.time <= noteOn.time || ev.channel != noteOn.channel || ev.key != noteOn.key)
						continue
					
					if (noteOff == null || ev.time < noteOff.time)
					{
						noteOff = ev
						break
					}
				}
				
				if (!noteOff)
					continue
				
				const onTick  = Rational.fromFloat(noteOn.time  / midi.ticksPerQuarterNote / 4, 27720)
				const offTick = Rational.fromFloat(noteOff.time / midi.ticksPerQuarterNote / 4, 27720)
				
				notesToAdd.push(new Note(new Range(onTick, offTick), noteOn.key))
			}
		}
		
		song = song.upsertNotes(notesToAdd)
		
		for (const track of midi.tracks)
		{
			for (const ev of track.events)
			{
				if (ev.kind != "setKeySignature")
					continue
				
				const tonicPitches     = [ 0,  7,  2,  9,  4, 11, 5, 0, 7, 2, 9, 4, 11, 5, 0, 7, 2, 9, 4, 11]
				const tonicAccidentals = [-1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0,  0, 1, 1, 1, 1, 1, 1,  1]
				const index = ev.accidentals + 7 + (ev.scale == 0 ? 0 : 2)
				
				if (index < 0 || index >= tonicPitches.length)
					continue
				
				const time = Rational.fromFloat(ev.time / midi.ticksPerQuarterNote / 4, 27720)
				song = song.upsertKeyChange(new KeyChange(time, new Key(tonicPitches[index], tonicAccidentals[index], scales[ev.scale == 0 ? 0 : 5].pitches)))
			}
		}
		
		for (const track of midi.tracks)
		{
			for (const ev of track.events)
			{
				if (ev.kind != "setTimeSignature")
					continue
				
				const time = Rational.fromFloat(ev.time / midi.ticksPerQuarterNote / 4, 27720)
				song = song.upsertMeterChange(new MeterChange(time, new Meter(ev.numerator, ev.denominator)))
			}
		}
		
		if (!song.keyChanges.findActiveAt(new Rational(0)))
			song = song.upsertKeyChange(new KeyChange(new Rational(0), new Key(0, 0, scales[0].pitches)))
		
		if (!song.meterChanges.findActiveAt(new Rational(0)))
			song = song.upsertMeterChange(new MeterChange(new Rational(0), new Meter(4, 4)))
		
		console.log(song)
		return song.withRefreshedRange()
	}
}


export class Note
{
	constructor(range, pitch)
	{
		this.id = -1
		this.range = range
		this.pitch = pitch
	}
	
	
	withChanges(obj)
	{
		return Object.assign(new Note(this.range, this.pitch), { id: this.id }, obj)
	}
}


export class SongChord
{
	constructor(range, chord)
	{
		this.id = -1
		this.range = range
		this.chord = chord
	}
	
	
	withChanges(obj)
	{
		return Object.assign(new SongChord(this.range, this.chord), { id: this.id }, obj)
	}
}


export class MeterChange
{
	constructor(time, meter)
	{
		this.id = -1
		this.time = time
		this.meter = meter
	}
	
	
	withChanges(obj)
	{
		return Object.assign(new MeterChange(this.time, this.meter), { id: this.id }, obj)
	}
	
	
	getTimeAsRange()
	{
		return Range.fromPoint(this.time)
	}
	
	
	getMeasureDuration()
	{
		return new Rational(this.meter.numerator, this.meter.denominator)
	}
	
	
	getSubmeasureDuration()
	{
		return new Rational(1, this.meter.denominator)
	}
}


export class KeyChange
{
	constructor(time, key)
	{
		this.id = -1
		this.time = time
		this.key = key
	}
	
	
	withChanges(obj)
	{
		return Object.assign(new KeyChange(this.time, this.key), { id: this.id }, obj)
	}
	
	
	getTimeAsRange()
	{
		return Range.fromPoint(this.time)
	}
}