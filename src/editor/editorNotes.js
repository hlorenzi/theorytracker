import { Editor } from "./editor.js"
import { Rect } from "../util/rect.js"


export class EditorNotes
{
	constructor(owner)
	{
		this.owner = owner
		this.area = new Rect(0, 0, 0, 0)
		
		this.rowScale = 15
		this.rowScroll = 0
		
		this.hoverId = -1
		
		this.mouseDownRow = -1
		this.mouseDownRowScroll = 0
		this.mouseRow = -1
		
		this.dragData = new Map()
	}
	
	
	getRowAt(pos)
	{
		return Math.floor((this.area.h - pos.y) / this.rowScale)
	}
	
	
	onMouseDown(ev, mouseDown, mousePos)
	{
		this.mouseRow = this.mouseDownRow = this.getRowAt(mousePos)
		this.mouseDownRowScroll = this.rowScroll
		
		if (this.hoverId >= 0)
		{
			this.owner.selection.add(this.hoverId)
			this.owner.mouseDownAction = this.owner.mouseHoverAction
		}
	}
	
	
	onMouseMove(ev, mouseDown, mousePos)
	{
		this.hoverId = -1
		for (const note of this.owner.song.notes.enumerate())
		{
			const rect = this.getNoteRect(note)
			if (rect.contains(mousePos))
			{
				this.hoverId = note.id
				
				if (mousePos.x < rect.x + 8)
					this.owner.mouseHoverAction = Editor.ACTION_STRETCH_TIME_START
				else if (mousePos.x > rect.x + rect.w - 8)
					this.owner.mouseHoverAction = Editor.ACTION_STRETCH_TIME_END
				else
					this.owner.mouseHoverAction = Editor.ACTION_DRAG_TIME | Editor.ACTION_DRAG_PITCH
			}
		}
	}
	
	
	onMouseUp(ev, mouseDown, mousePos)
	{
	}
	
	
	onMouseLeave()
	{
		this.hoverId = -1
	}
	
	
	onPan()
	{
		this.rowScroll = this.mouseDownRowScroll - (this.owner.mouseDownData.pos.y - this.owner.mousePos.y) / this.rowScale
	}
	
	
	getSelectedRange()
	{
		let range = null
		
		for (const note of this.owner.song.notes.enumerate())
		{
			if (!this.owner.selection.has(note.id))
				continue
			
			range = note.range.merge(range)
		}
		
		return range
	}
	
	
	onSelectRange(range)
	{
		for (const note of this.owner.song.notes.enumerate())
		{
			if (range.overlapsRange(note.range))
				this.owner.selection.add(note.id)
		}
	}
	
	
	hasSelectedAt(mousePos)
	{
		return this.hoverId >= 0 && this.owner.selection.has(this.hoverId)
	}
	
	
	onDragStart(mousePos)
	{
		this.mouseRow = this.mouseDownRow = this.getRowAt(mousePos)
		this.dragData = new Map()
		
		for (const note of this.owner.song.notes.enumerate())
		{
			if (!this.owner.selection.has(note.id))
				continue
			
			this.dragData.set(note.id, note)
		}
	}
	
	
	onDrag(mousePos)
	{
		this.mouseRow = this.getRowAt(mousePos)
		
		for (const note of this.owner.song.notes.enumerate())
		{
			if (!this.owner.selection.has(note.id))
				continue
			
			const timeOffset = this.owner.mouseTime.subtract(this.owner.mouseDownData.time)
			const rowOffset = this.mouseRow - this.mouseDownRow
			
			const noteOrigData = this.dragData.get(note.id)
			
			let changes = { }
			
			if (this.owner.mouseDownAction & Editor.ACTION_DRAG_TIME)
				changes.range = noteOrigData.range.displace(timeOffset)
			
			if (this.owner.mouseDownAction & Editor.ACTION_DRAG_PITCH)
				changes.pitch = noteOrigData.pitch + rowOffset
			
			if (this.owner.mouseDownAction & Editor.ACTION_STRETCH_TIME_START)
				changes.range = noteOrigData.range.stretch(timeOffset, this.owner.mouseDownData.stretchRange.end, this.owner.mouseDownData.stretchRange.start).sorted()
			
			if (this.owner.mouseDownAction & Editor.ACTION_STRETCH_TIME_END)
				changes.range = noteOrigData.range.stretch(timeOffset, this.owner.mouseDownData.stretchRange.start, this.owner.mouseDownData.stretchRange.end).sorted()
			
			this.owner.song = this.owner.song.upsertNote(note.withChanges(changes))
		}
	}
	
	
	draw()
	{
		for (const note of this.owner.song.notes.enumerate())
		{
			if (!this.owner.selection.has(note.id))
				this.drawNote(note)
		}
		
		for (const note of this.owner.song.notes.enumerate())
		{
			if (this.owner.selection.has(note.id))
				this.drawNote(note)
		}
	}
	
	
	drawNote(note)
	{
		const rect = this.getNoteRect(note)
		
		this.owner.ctx.fillStyle = (this.hoverId == note.id ? "#f80" : "#f00")
		this.owner.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
		
		if (this.owner.selection.has(note.id))
		{
			this.owner.ctx.globalAlpha = 0.5
			this.owner.ctx.fillStyle = "#fff"
			this.owner.ctx.fillRect(rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6)
			
			this.owner.ctx.globalAlpha = 1
		}
	}
	
	
	getNoteRect(note)
	{
		const timeOffsetFromScroll = note.range.start.asFloat() - this.owner.timeScroll
		const noteX = timeOffsetFromScroll * this.owner.timeScale
		const noteY = this.area.h - (note.pitch + 1 - this.rowScroll) * this.rowScale
		const noteW = note.range.duration.asFloat() * this.owner.timeScale
		
		return new Rect(noteX, noteY, noteW, this.rowScale)
	}
}