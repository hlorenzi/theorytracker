import { ListOfRanges } from "../util/listOfRanges.js"


export class Song
{
	constructor()
	{
		this.nextId = 1
		this.notes = new ListOfRanges(n => n.range)
		this.chords = new ListOfRanges(n => n.range)
	}
	
	
	withChanges(obj)
	{
		let song = new Song()
		song.nextId = this.nextId
		song.notes = this.notes
		song.chords = this.chords
		
		return Object.assign(song, obj)
	}
	
	
	upsertNote(note, remove = false)
	{
		let nextId = this.nextId
		
		if (note.id < 0)
		{
			note = note.withChanges({ id: nextId })
			nextId++
		}
		
		let notes = this.notes.removeById(note.id)
		if (!remove)
			notes = notes.add(note)
		
		return this.withChanges({ nextId, notes })
	}
	
	
	upsertChord(chord, remove = false)
	{
		let nextId = this.nextId
		
		if (chord.id < 0)
		{
			chord = chord.withChanges({ id: nextId })
			nextId++
		}
		
		let chords = this.chords.removeById(chord.id)
		if (!remove)
			chords = chords.add(chord)
		
		return this.withChanges({ nextId, chords })
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