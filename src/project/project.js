import ListOfPoints from "../util/listOfPoints.js"
import ListOfRanges from "../util/listOfRanges.js"
import Rational from "../util/rational.js"
import Range from "../util/range.js"
import Theory from "../theory.js"
import IOJson from "./ioJson.js"
import IOMidi from "./ioMidi.js"
import IOCompressedStr from "./ioCompressedStr.js"


export default class Project
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
	
	
	static getDefault()
	{
		return new Project()
			.upsertKeyChange(new Project.KeyChange(new Rational(0, 4), Theory.Key.parse("C Major")))
			.upsertMeterChange(new Project.MeterChange(new Rational(0, 4), new Theory.Meter(4, 4)))
			.withRefreshedRange()
	}
	
	
	withChanges(obj)
	{
		let song = new Project()
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
		let range = null
		range = Range.merge(range, this.notes.getTotalRange())
		range = Range.merge(range, this.chords.getTotalRange())
		range = Range.merge(range, this.meterChanges.getTotalRange())
		range = Range.merge(range, this.keyChanges.getTotalRange())

		if (range === null)
			range = new Range(new Rational(0), new Rational(1))

		if (range.duration.asFloat() < 1)
			range = Range.fromStartDuration(range.start, new Rational(1))
		
		if (this.range.start.compare(range.start) == 0 &&
			this.range.end.compare(range.end) == 0)
			return this
		
		return this.withChanges({ range })
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
	
	
	findById(id)
	{
		return (
			this.notes.findById(id) ||
			this.chords.findById(id) ||
			this.keyChanges.findById(id) ||
			this.meterChanges.findById(id)
		)
	}
	
	
	update(elem)
	{
		let song = this.withChanges({})
		song.notes = song.notes.update(elem)
		song.chords = song.chords.update(elem)
		song.keyChanges = song.keyChanges.update(elem)
		song.meterChanges = song.meterChanges.update(elem)
		return song
	}
	
	
	removeById(id)
	{
		let song = this.withChanges({})
		song.notes = song.notes.removeById(id)
		song.chords = song.chords.removeById(id)
		song.keyChanges = song.keyChanges.removeById(id)
		song.meterChanges = song.meterChanges.removeById(id)
		return song
	}


	toJson()
	{
		return IOJson.write(this)
	}


	static fromJson(json)
	{
		return IOJson.read(json)
	}


	static fromMidi(bytes)
	{
		return IOMidi.read(bytes)
	}


	toCompressedStr()
	{
		return IOCompressedStr.write(this)
	}


	static fromCompressedStr(str)
	{
		return IOCompressedStr.read(str)
	}
	

	static Note = class ProjectNote
	{
		constructor(range, pitch)
		{
			this.id = -1
			this.range = range
			this.pitch = pitch
		}
		
		
		withChanges(obj)
		{
			return Object.assign(new ProjectNote(this.range, this.pitch), { id: this.id }, obj)
		}
	}


	static Chord = class ProjectChord
	{
		constructor(range, chord)
		{
			this.id = -1
			this.range = range
			this.chord = chord
		}
		
		
		withChanges(obj)
		{
			return Object.assign(new ProjectChord(this.range, this.chord), { id: this.id }, obj)
		}
	}


	static MeterChange = class ProjectMeterChange
	{
		constructor(time, meter)
		{
			this.id = -1
			this.time = time
			this.meter = meter
		}
		
		
		withChanges(obj)
		{
			return Object.assign(new ProjectMeterChange(this.time, this.meter), { id: this.id }, obj)
		}
	}


	static KeyChange = class ProjectKeyChange
	{
		constructor(time, key)
		{
			this.id = -1
			this.time = time
			this.key = key
		}
		
		
		withChanges(obj)
		{
			return Object.assign(new ProjectKeyChange(this.time, this.key), { id: this.id }, obj)
		}
	}
}