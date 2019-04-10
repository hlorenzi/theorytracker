import { Editor } from "./editor.js"
import { Rect } from "../util/rect.js"


export class EditorChords
{
	constructor(owner)
	{
		this.owner = owner
		this.area = new Rect(0, 0, 0, 0)
		
		this.decorationHeight = 10
		
		this.hoverId = -1
		
		this.dragData = new Map()
	}
	
	
	onMouseDown(ev, mouseDown, mousePos)
	{
		if (this.hoverId >= 0)
		{
			this.owner.selection.add(this.hoverId)
			this.owner.mouseDownAction = this.owner.mouseHoverAction
		}
	}
	
	
	onMouseMove(ev, mouseDown, mousePos)
	{
		this.hoverId = -1
		for (const chord of this.owner.song.chords.enumerate())
		{
			const rect = this.getChordRect(chord)
			if (rect.contains(mousePos))
			{
				this.hoverId = chord.id
				
				if (mousePos.x < rect.x + 8)
					this.owner.mouseHoverAction = Editor.ACTION_STRETCH_TIME_START
				else if (mousePos.x > rect.x + rect.w - 8)
					this.owner.mouseHoverAction = Editor.ACTION_STRETCH_TIME_END
				else
					this.owner.mouseHoverAction = Editor.ACTION_DRAG_TIME
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
	}
	
	
	getSelectedRange()
	{
		let range = null
		
		for (const chord of this.owner.song.chords.enumerate())
		{
			if (!this.owner.selection.has(chord.id))
				continue
			
			range = chord.range.merge(range)
		}
		
		return range
	}
	
	
	onSelectRange(range)
	{
		for (const chord of this.owner.song.chords.enumerate())
		{
			if (range.overlapsRange(chord.range))
				this.owner.selection.add(chord.id)
		}
	}
	
	
	hasSelectedAt(mousePos)
	{
		return this.hoverId >= 0 && this.owner.selection.has(this.hoverId)
	}
	
	
	onDragStart(mousePos)
	{
		this.dragData = new Map()
		
		for (const chord of this.owner.song.chords.enumerate())
		{
			if (!this.owner.selection.has(chord.id))
				continue
			
			this.dragData.set(chord.id, chord)
		}
	}
	
	
	onDrag(mousePos)
	{
		for (const chord of this.owner.song.chords.enumerate())
		{
			if (!this.owner.selection.has(chord.id))
				continue
			
			const timeOffset = this.owner.mouseTime.subtract(this.owner.mouseDownData.time)
			
			const origData = this.dragData.get(chord.id)
			
			let changes = { }
			
			if (this.owner.mouseDownAction & Editor.ACTION_DRAG_TIME)
				changes.range = origData.range.displace(timeOffset)
			
			if (this.owner.mouseDownAction & Editor.ACTION_STRETCH_TIME_START)
				changes.range = origData.range.stretch(timeOffset, this.owner.mouseDownData.stretchRange.end, this.owner.mouseDownData.stretchRange.start).sorted()
			
			if (this.owner.mouseDownAction & Editor.ACTION_STRETCH_TIME_END)
				changes.range = origData.range.stretch(timeOffset, this.owner.mouseDownData.stretchRange.start, this.owner.mouseDownData.stretchRange.end).sorted()
			
			this.owner.song = this.owner.song.upsertChord(chord.withChanges(changes))
		}
	}
	
	
	draw()
	{
		for (const chord of this.owner.song.chords.enumerate())
		{
			if (!this.owner.selection.has(chord.id))
				this.drawChord(chord)
		}
		
		for (const chord of this.owner.song.chords.enumerate())
		{
			if (this.owner.selection.has(chord.id))
				this.drawChord(chord)
		}
	}
	
	
	drawChord(chord)
	{
		const rect = this.getChordRect(chord)
		
		this.owner.ctx.fillStyle = "#eee"
		this.owner.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
		
		this.owner.ctx.fillStyle = (this.hoverId == chord.id ? "#f80" : "#f00")
		this.owner.ctx.fillRect(rect.x, rect.y, rect.w, this.decorationHeight)
		this.owner.ctx.fillRect(rect.x, rect.y + rect.h - this.decorationHeight, rect.w, this.decorationHeight)
		
		if (this.owner.selection.has(chord.id))
		{
			this.owner.ctx.globalAlpha = 0.5
			this.owner.ctx.fillStyle = "#fff"
			this.owner.ctx.fillRect(rect.x + 3, rect.y + 3, rect.w - 6, rect.h - 6)
			
			this.owner.ctx.globalAlpha = 1
		}
	}
	
	
	getChordRect(chord)
	{
		const timeOffsetFromScroll = chord.range.start.asFloat() - this.owner.timeScroll
		const chordX = timeOffsetFromScroll * this.owner.timeScale
		const chordW = chord.range.duration.asFloat() * this.owner.timeScale
		
		return new Rect(chordX, 0, chordW, this.area.h)
	}
}