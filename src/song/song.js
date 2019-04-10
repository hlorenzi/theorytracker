import { ListOfRanges } from "../util/listOfRanges.js"
import { Rational } from "../util/rational.js"
import { Range } from "../util/range.js"


export class Song
{
	constructor()
	{
		this.nextId = 1
		this.notes = new ListOfRanges(n => n.range)
		this.chords = new ListOfRanges(n => n.range)
		this.meterChanges = new ListOfRanges(n => n.getTimeAsRange())
		this.keyChanges = new ListOfRanges(n => n.getTimeAsRange())
	}
	
	
	withChanges(obj)
	{
		let song = new Song()
		song.nextId = this.nextId
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


export class Chord
{
	constructor(range, pitch)
	{
		this.id = -1
		this.range = range
		this.pitch = pitch
	}
	
	
	withChanges(obj)
	{
		return Object.assign(new Chord(this.range, this.pitch), { id: this.id }, obj)
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
	constructor(time, tonicPitch, scale)
	{
		this.id = -1
		this.time = time
		this.tonicPitch = tonicPitch
		this.scale = scale
	}
	
	
	withChanges(obj)
	{
		return Object.assign(new KeyChange(this.time, this.tonicPitch, this.scale), { id: this.id }, obj)
	}
	
	
	getTimeAsRange()
	{
		return Range.fromPoint(this.time)
	}
}