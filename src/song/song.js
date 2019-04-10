import { ListOfRanges } from "../util/listOfRanges.js"


export class Song
{
	constructor()
	{
		this.nextId = 1
		this.notes = new ListOfRanges(n => n.range)
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
		
		return Object.assign(new Song(), { nextId, notes })
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