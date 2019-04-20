import { KeyChange } from "../song/song.js"
import { Editor } from "./editor.js"
import { Rational } from "../util/rational.js"
import { Range } from "../util/range.js"
import { Rect } from "../util/rect.js"
import { Key, scales, getTonicPitchRowOffset, getScaleDegreeForPitch, getPitchForScaleDegree, getColorRotationForScale, getColorForScaleDegree } from "../util/theory.js"


export class EditorNotes
{
	constructor(owner)
	{
		this.owner = owner
		this.area = new Rect(0, 0, 0, 0)
		
		this.rowScale = 15
		this.rowScroll = 0
		
		this.hoverId = -1
		this.hoverRange = new Range(new Rational(0), new Rational(0))
		
		this.mouseDownRow = -1
		this.mouseDownRowScroll = 0
		this.mouseRow = -1
		
		this.dragData = new Map()
	}
	
	
	getRowAt(pos)
	{
		return Math.floor((this.area.h - pos.y) / this.rowScale)
	}
	
	
	onMouseDown(ev, mouseDown, mouseRightButton, mousePos)
	{
		this.mouseRow = this.mouseDownRow = this.getRowAt(mousePos)
		this.mouseDownRowScroll = this.rowScroll
		
		if (mouseRightButton)
			return
		
		if (this.hoverId >= 0)
		{
			this.owner.selection.add(this.hoverId)
			this.owner.mouseDownAction = this.owner.mouseHoverAction
			this.owner.cursorTime = Range.fromPoint(this.hoverRange.start)
		}
	}
	
	
	onMouseMove(ev, mouseDown, mousePos)
	{
		this.hoverId = -1
		for (const pair of this.owner.song.keyChanges.enumerateAffectingRangePairwise(this.owner.screenRange))
		{
			const curKey  = pair[0] || new KeyChange(this.owner.screenRange.start, new Key(0, 0, scales.major.pitches))
			const nextKey = pair[1] || new KeyChange(this.owner.screenRange.end,   new Key(0, 0, scales.major.pitches))
			
			const xStart = (curKey .time.asFloat() - this.owner.timeScroll) * this.owner.timeScale
			const xEnd   = (nextKey.time.asFloat() - this.owner.timeScroll) * this.owner.timeScale
			
			for (const note of this.owner.song.notes.enumerateOverlappingRange(new Range(curKey.time, nextKey.time)))
			{
				const rect = this.getNoteRect(note, curKey.key, xStart, xEnd)
				if (rect.contains(mousePos))
				{
					this.hoverId = note.id
					this.hoverRange = note.range
					
					if (mousePos.x < rect.x + 8 && !rect.cutStart)
						this.owner.mouseHoverAction = Editor.ACTION_STRETCH_TIME_START
					else if (mousePos.x > rect.x + rect.w - 8 && !rect.cutEnd)
						this.owner.mouseHoverAction = Editor.ACTION_STRETCH_TIME_END
					else
						this.owner.mouseHoverAction = Editor.ACTION_DRAG_TIME | Editor.ACTION_DRAG_PITCH
				}
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
	
	
	onKeyDown(ev)
	{
		const key = ev.key.toLowerCase()
		switch (key)
		{
			case "arrowright":
			case "arrowleft":
			{
				let offset = (ev.shiftKey && !this.owner.cursorShow ? new Rational(1) : this.owner.timeSnap)
				if (key == "arrowleft")
					offset = offset.negate()
				
				if (ev.ctrlKey)
				{
					if (offset.greaterThan(new Rational(0)) || this.owner.keyDownData.stretchRange.duration.greaterThan(this.owner.timeSnap))
						this.alterSelectedNotes((data, origData, changes) => changes.range = data.range.stretch(offset, this.owner.keyDownData.stretchRange.start, this.owner.keyDownData.stretchRange.end).sorted())
				}
				else
					this.alterSelectedNotes((data, origData, changes) => changes.range = data.range.displace(offset))
				
				this.owner.cursorShow = false
				return true
			}
			case "arrowup":
			case "arrowdown":
			{
				let offset = (ev.shiftKey && !this.owner.cursorShow ? 7 : 1)
				if (key == "arrowdown")
					offset = -offset
				
				this.alterSelectedNotes((data, origData, changes) =>
				{
					const keyChange = this.owner.song.keyChanges.findActiveAt(data.range.start) || new KeyChange(data.range.start, new Key(0, 0, scales.major.pitches))
					const scaleDegree = getScaleDegreeForPitch(keyChange.key, data.pitch)
					changes.pitch = getPitchForScaleDegree(keyChange.key, scaleDegree + offset)
				})
				this.owner.cursorShow = false
				return true
			}
			case ".":
			case ">":
			case ",":
			case "<":
			{
				let offset = (ev.shiftKey && !this.owner.cursorShow ? 12 : 1)
				if (key == "," || key == "<")
					offset = -offset
				
				this.alterSelectedNotes((data, origData, changes) => changes.pitch = data.pitch + offset)
				this.owner.cursorShow = false
				return true
			}
			case "backspace":
			case "delete":
			{
				for (const note of this.owner.song.notes.enumerate())
				{
					if (!this.owner.selection.has(note.id))
						continue
					
					this.owner.song = this.owner.song.upsertNote(note, true)
				}
				return true
			}
		}
		
		return false
	}
	
	
	alterSelectedNotes(fn)
	{
		for (const note of this.owner.song.notes.enumerate())
		{
			if (!this.owner.selection.has(note.id))
				continue
			
			const noteOrigData = this.dragData.get(note.id)
			
			let changes = { }
			fn(note, noteOrigData, changes)
			this.owner.song = this.owner.song.upsertNote(note.withChanges(changes))
		}
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
			{
				const keyChange = this.owner.song.keyChanges.findActiveAt(noteOrigData.range.start) || new KeyChange(noteOrigData.range.start, new Key(0, 0, scales.major.pitches))
				const scaleDegree = getScaleDegreeForPitch(keyChange.key, noteOrigData.pitch)
				const newPitch = getPitchForScaleDegree(keyChange.key, scaleDegree + rowOffset)
				changes.pitch = newPitch
			}
			
			if (this.owner.mouseDownAction & Editor.ACTION_STRETCH_TIME_START)
				changes.range = noteOrigData.range.stretch(timeOffset, this.owner.mouseDownData.stretchRange.end, this.owner.mouseDownData.stretchRange.start).sorted()
			
			if (this.owner.mouseDownAction & Editor.ACTION_STRETCH_TIME_END)
				changes.range = noteOrigData.range.stretch(timeOffset, this.owner.mouseDownData.stretchRange.start, this.owner.mouseDownData.stretchRange.end).sorted()
			
			this.owner.song = this.owner.song.upsertNote(note.withChanges(changes))
		}
	}
	
	
	draw()
	{
		for (const pair of this.owner.song.keyChanges.enumerateAffectingRangePairwise(this.owner.screenRange))
		{
			const curKey  = pair[0] || new KeyChange(this.owner.screenRange.start, new Key(0, 0, scales.major.pitches))
			const nextKey = pair[1] || new KeyChange(this.owner.screenRange.end,   new Key(0, 0, scales.major.pitches))
			
			const xStart = (curKey .time.asFloat() - this.owner.timeScroll) * this.owner.timeScale
			const xEnd   = (nextKey.time.asFloat() - this.owner.timeScroll) * this.owner.timeScale
			
			const tonicRowOffset = getTonicPitchRowOffset(curKey.key.tonicPitch + curKey.key.tonicAccidental)
			
			for (let i = -4; i <= 4; i++)
			{
				const y = this.area.h / 2 + (this.rowScroll - tonicRowOffset + i * 7) * this.rowScale
				
				this.owner.ctx.strokeStyle = "#666"
				this.owner.ctx.beginPath()
				this.owner.ctx.moveTo(xStart, y)
				this.owner.ctx.lineTo(xEnd,   y)
				this.owner.ctx.stroke()
			}
			
			for (const note of this.owner.song.notes.enumerateOverlappingRange(new Range(curKey.time, nextKey.time)))
			{
				if (!this.owner.selection.has(note.id))
					this.drawNote(note, curKey.key, xStart, xEnd)
			}
			
			for (const note of this.owner.song.notes.enumerateOverlappingRange(new Range(curKey.time, nextKey.time)))
			{
				if (this.owner.selection.has(note.id))
					this.drawNote(note, curKey.key, xStart, xEnd)
			}
		}
	}
	
	
	drawNote(note, key, xStart, xEnd)
	{
		const rect = this.getNoteRect(note, key, xStart, xEnd)
		
		const scaleDegree = getScaleDegreeForPitch(key, note.pitch)
		const scaleDegreeRotation = getColorRotationForScale(key.scalePitches)
		const color = getColorForScaleDegree(scaleDegree + scaleDegreeRotation)
		
		this.owner.ctx.fillStyle = color
		this.owner.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
		
		if (this.owner.selection.has(note.id))
		{
			this.owner.ctx.globalAlpha = 0.5
			this.owner.ctx.fillStyle = "#fff"
			this.owner.ctx.fillRect(rect.x + (rect.cutStart ? 0 : 3), rect.y + 3, rect.w - (rect.cutEnd ? 0 : 3) - (rect.cutStart ? 0 : 3), rect.h - 6)
			
			this.owner.ctx.globalAlpha = 1
		}
		
		if (this.hoverId == note.id)
		{
			this.owner.ctx.globalAlpha = 0.5
			this.owner.ctx.fillStyle = "#fee"
			this.owner.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
			
			this.owner.ctx.globalAlpha = 1
		}
	}
	
	
	getNoteRow(note, key)
	{
		const tonicRowOffset = getTonicPitchRowOffset(key.tonicPitch + key.tonicAccidental)
		const scaleDegree = getScaleDegreeForPitch(key, note.pitch)
		
		return tonicRowOffset + scaleDegree
	}
	
	
	getNoteRect(note, key, xStart, xEnd)
	{
		const noteRow = this.getNoteRow(note, key)
		
		const timeOffsetFromScroll1 = note.range.start.asFloat() - this.owner.timeScroll
		const timeOffsetFromScroll2 = note.range.end  .asFloat() - this.owner.timeScroll
		const noteOrigX1 = timeOffsetFromScroll1 * this.owner.timeScale
		const noteOrigX2 = timeOffsetFromScroll2 * this.owner.timeScale
		const noteX1 = Math.max(noteOrigX1, xStart)
		const noteX2 = Math.min(noteOrigX2, xEnd)
		const noteW = noteX2 - noteX1
		const noteY = this.area.h / 2 - (noteRow + 1 - this.rowScroll) * this.rowScale
		
		const cutStart = noteOrigX1 < noteX1
		const cutEnd   = noteOrigX2 > noteX2
		
		return Object.assign(new Rect(noteX1, noteY, noteW, this.rowScale), { cutStart, cutEnd })
	}
}