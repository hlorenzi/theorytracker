import { ListOfRanges } from "../util/listOfRanges.js"
import { Rational } from "../util/rational.js"
import { Range } from "../util/range.js"
import { Key, scales, Chord, getChordKindFromId } from "../util/theory.js"


export class Song
{
	constructor()
	{
		this.nextId = 1
		this.baseBpm = 120
		this.notes = new ListOfRanges(n => n.range)
		this.chords = new ListOfRanges(n => n.range)
		this.meterChanges = new ListOfRanges(n => n.getTimeAsRange())
		this.keyChanges = new ListOfRanges(n => n.getTimeAsRange())
	}
	
	
	withChanges(obj)
	{
		let song = new Song()
		song.nextId = this.nextId
		song.baseBpm = this.baseBpm
		song.notes = this.notes
		song.chords = this.chords
		song.meterChanges = this.meterChanges
		song.keyChanges = this.keyChanges
		
		return Object.assign(song, obj)
	}
	
	
	_upsertElement(listField, elem, remove = false)
	{
		let nextId = this.nextId
		
		if (elem.id < 0)
		{
			elem = elem.withChanges({ id: nextId })
			nextId++
		}
		
		let list = this[listField].removeById(elem.id)
		if (!remove)
			list = list.add(elem)
		
		return this.withChanges({ nextId, [listField]: list })
	}
	
	
	upsertNote(note, remove = false)
	{
		return this._upsertElement("notes", note, remove)
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
			for (const note of this.notes.enumerate())
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
		for (const chord of this.chords.enumerate())
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
			str += meterChange.numerator + ","
			str += meterChange.denominator
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
				meterChange[1],
				meterChange[2]))
		
		return song
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
	constructor(time, numerator, denominator)
	{
		this.id = -1
		this.time = time
		this.numerator = numerator
		this.denominator = denominator
	}
	
	
	withChanges(obj)
	{
		return Object.assign(new MeterChange(this.time, this.numerator, this.denominator), { id: this.id }, obj)
	}
	
	
	getTimeAsRange()
	{
		return Range.fromPoint(this.time)
	}
	
	
	getMeasureDuration()
	{
		return new Rational(this.numerator, this.denominator)
	}
	
	
	getSubmeasureDuration()
	{
		return new Rational(1, this.denominator)
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