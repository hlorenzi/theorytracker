import { Editor } from "./editor.js"
import { Rational } from "../util/rational.js"
import { Range } from "../util/range.js"
import { Rect } from "../util/rect.js"
import { Key, scales, getScaleDegreeForPitch, getPitchForScaleDegree } from "../util/theory.js"


export class EditorMarkers
{
	constructor(owner)
	{
		this.owner = owner
		this.area = new Rect(0, 0, 0, 0)
		
		this.markerWidth = 22
		this.keyMarkerY = 0
		this.keyMarkerHeight = 22
		this.meterMarkerY = 22
		this.meterMarkerHeight = 22
		
		this.hoverId = -1
		this.hoverRange = new Range(new Rational(0), new Rational(0))
		
		this.dragData = new Map()
	}
	
	
	onMouseDown(ev, mouseDown, mouseRightButton, mousePos)
	{
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
		for (const meterChange of this.owner.song.meterChanges.enumerate())
		{
			const rect = this.getMeterChangeHandleRect(meterChange)
			if (rect.contains(mousePos))
			{
				this.hoverId = meterChange.id
				this.hoverRange = Range.fromPoint(meterChange.time)
				this.owner.mouseHoverAction = Editor.ACTION_DRAG_TIME
			}
		}
		
		for (const keyChange of this.owner.song.keyChanges.enumerate())
		{
			const rect = this.getKeyChangeHandleRect(keyChange)
			if (rect.contains(mousePos))
			{
				this.hoverId = keyChange.id
				this.hoverRange = Range.fromPoint(keyChange.time)
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
					{
						this.alterSelectedKeyChanges  ((data, origData, changes) => changes.time = data.time.stretch(offset, this.owner.keyDownData.stretchRange.start, this.owner.keyDownData.stretchRange.end))
						this.alterSelectedMeterChanges((data, origData, changes) => changes.time = data.time.stretch(offset, this.owner.keyDownData.stretchRange.start, this.owner.keyDownData.stretchRange.end))
					}
				}
				else
				{
					this.alterSelectedKeyChanges  ((data, origData, changes) => changes.time = data.time.add(offset))
					this.alterSelectedMeterChanges((data, origData, changes) => changes.time = data.time.add(offset))
				}
				
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
				
				this.alterSelectedKeyChanges((data, origData, changes) => changes.key = data.key.withChanges({ tonicPitch: data.key.tonicPitch + offset }))
				this.owner.cursorShow = false
				return true
			}
			case "delete":
			{
				for (const keyChange of this.owner.song.keyChanges.enumerate())
				{
					if (this.owner.selection.has(keyChange.id))
					{
						this.owner.song = this.owner.song.upsertKeyChange(keyChange, true)
						this.owner.selection.delete(keyChange.id)
					}
				}
				
				for (const meterChange of this.owner.song.meterChanges.enumerate())
				{
					if (this.owner.selection.has(meterChange.id))
					{
						this.owner.song = this.owner.song.upsertMeterChange(meterChange, true)
						this.owner.selection.delete(meterChange.id)
					}
				}
				
				return true
			}
		}
	}
	
	
	alterSelectedKeyChanges(fn)
	{
		for (const keyChange of this.owner.song.keyChanges.enumerate())
		{
			if (!this.owner.selection.has(keyChange.id))
				continue
			
			const origData = this.dragData.get(keyChange.id)
			
			let changes = { }
			fn(keyChange, origData, changes)
			this.owner.song = this.owner.song.upsertKeyChange(keyChange.withChanges(changes))
		}
	}
	
	
	alterSelectedMeterChanges(fn)
	{
		for (const meterChange of this.owner.song.meterChanges.enumerate())
		{
			if (!this.owner.selection.has(meterChange.id))
				continue
			
			const origData = this.dragData.get(meterChange.id)
			
			let changes = { }
			fn(meterChange, origData, changes)
			this.owner.song = this.owner.song.upsertMeterChange(meterChange.withChanges(changes))
		}
	}
	
	
	onPan()
	{
	}
	
	
	sanitizeSelection()
	{
		for (const selectedKeyChange of this.owner.song.keyChanges.enumerate())
		{
			if (!this.owner.selection.has(selectedKeyChange.id))
				continue
			
			this.owner.song = this.owner.song.upsertKeyChange(selectedKeyChange, true)
		
			for (const keyChange of this.owner.song.keyChanges.enumerate())
			{
				if (keyChange.time.compare(selectedKeyChange.time) == 0)
					this.owner.song = this.owner.song.upsertKeyChange(keyChange, true)
			}
			
			this.owner.song = this.owner.song.upsertKeyChange(selectedKeyChange)
		}
		
		for (const selectedMeterChange of this.owner.song.meterChanges.enumerate())
		{
			if (!this.owner.selection.has(selectedMeterChange.id))
				continue
			
			this.owner.song = this.owner.song.upsertMeterChange(selectedMeterChange, true)
		
			for (const meterChange of this.owner.song.meterChanges.enumerate())
			{
				if (meterChange.time.compare(selectedMeterChange.time) == 0)
					this.owner.song = this.owner.song.upsertMeterChange(meterChange, true)
			}
			
			this.owner.song = this.owner.song.upsertMeterChange(selectedMeterChange)
		}
	}
	
	
	deleteRange(range)
	{
		const pointIsContained = (p) =>
		{
			if (range.start.compare(range.end) == 0)
				return true
			
			if (range.start.compare(p) < 0 && range.end.compare(p) > 0)
				return true
			
			return false
		}
		
		for (const keyChange of this.owner.song.keyChanges.enumerateOverlappingRange(range))
		{
			if (pointIsContained(keyChange.time))
				this.owner.song = this.owner.song.upsertKeyChange(keyChange, true)
		}
		
		for (const meterChange of this.owner.song.meterChanges.enumerateOverlappingRange(range))
		{
			if (pointIsContained(meterChange.time))
				this.owner.song = this.owner.song.upsertMeterChange(meterChange, true)
		}
	}
	
	
	getPreviousAnchor(time)
	{
		const prevKeyChange = this.owner.song.keyChanges.findPrevious(time)
		const prevMeterChange = this.owner.song.meterChanges.findPrevious(time)
		
		const anchor1 = (prevKeyChange   == null ? null : prevKeyChange  .time)
		const anchor2 = (prevMeterChange == null ? null : prevMeterChange.time)
		
		return Rational.max(anchor1, anchor2)
	}
	
	
	getPreviousDeletionAnchor(time)
	{
		const anchor1 = this.owner.song.keyChanges  .findPreviousDeletionAnchor(time)
		const anchor2 = this.owner.song.meterChanges.findPreviousDeletionAnchor(time)
		
		return Rational.max(anchor1, anchor2)
	}
	
	
	getSelectedRange()
	{
		let range = null
		
		for (const meterChange of this.owner.song.meterChanges.enumerate())
		{
			if (!this.owner.selection.has(meterChange.id))
				continue
			
			range = meterChange.getTimeAsRange().merge(range)
		}
		
		for (const keyChange of this.owner.song.keyChanges.enumerate())
		{
			if (!this.owner.selection.has(keyChange.id))
				continue
			
			range = keyChange.getTimeAsRange().merge(range)
		}
		
		return range
	}
	
	
	onSelectRange(range)
	{
		for (const meterChange of this.owner.song.meterChanges.enumerate())
		{
			if (range.overlapsRange(meterChange.getTimeAsRange()))
				this.owner.selection.add(meterChange.id)
		}
		
		for (const keyChange of this.owner.song.keyChanges.enumerate())
		{
			if (range.overlapsRange(keyChange.getTimeAsRange()))
				this.owner.selection.add(keyChange.id)
		}
	}
	
	
	hasSelectedAt(mousePos)
	{
		return this.hoverId >= 0 && this.owner.selection.has(this.hoverId)
	}
	
	
	onDragStart(mousePos)
	{
		this.dragData = new Map()
		
		for (const meterChange of this.owner.song.meterChanges.enumerate())
		{
			if (!this.owner.selection.has(meterChange.id))
				continue
			
			this.dragData.set(meterChange.id, meterChange)
		}
		
		for (const keyChange of this.owner.song.keyChanges.enumerate())
		{
			if (!this.owner.selection.has(keyChange.id))
				continue
			
			this.dragData.set(keyChange.id, keyChange)
		}
	}
	
	
	onDrag(mousePos)
	{
		for (const meterChange of this.owner.song.meterChanges.enumerate())
		{
			if (!this.owner.selection.has(meterChange.id))
				continue
			
			const timeOffset = this.owner.mouseTime.subtract(this.owner.mouseDownData.time)
			
			const origData = this.dragData.get(meterChange.id)
			
			let changes = { }
			
			if (this.owner.mouseDownAction & Editor.ACTION_DRAG_TIME)
				changes.time = origData.time.add(timeOffset)
			
			if (this.owner.mouseDownAction & Editor.ACTION_STRETCH_TIME_START)
				changes.time = Range.fromPoint(origData.time).stretch(timeOffset, this.owner.mouseDownData.stretchRange.end, this.owner.mouseDownData.stretchRange.start).start
			
			if (this.owner.mouseDownAction & Editor.ACTION_STRETCH_TIME_END)
				changes.time = Range.fromPoint(origData.time).stretch(timeOffset, this.owner.mouseDownData.stretchRange.start, this.owner.mouseDownData.stretchRange.end).start
			
			this.owner.song = this.owner.song.upsertMeterChange(meterChange.withChanges(changes))
		}
		
		for (const keyChange of this.owner.song.keyChanges.enumerate())
		{
			if (!this.owner.selection.has(keyChange.id))
				continue
			
			const timeOffset = this.owner.mouseTime.subtract(this.owner.mouseDownData.time)
			
			const origData = this.dragData.get(keyChange.id)
			
			let changes = { }
			
			if (this.owner.mouseDownAction & Editor.ACTION_DRAG_TIME)
				changes.time = origData.time.add(timeOffset)
			
			if (this.owner.mouseDownAction & Editor.ACTION_STRETCH_TIME_START)
				changes.time = Range.fromPoint(origData.time).stretch(timeOffset, this.owner.mouseDownData.stretchRange.end, this.owner.mouseDownData.stretchRange.start).start
			
			if (this.owner.mouseDownAction & Editor.ACTION_STRETCH_TIME_END)
				changes.time = Range.fromPoint(origData.time).stretch(timeOffset, this.owner.mouseDownData.stretchRange.start, this.owner.mouseDownData.stretchRange.end).start
			
			this.owner.song = this.owner.song.upsertKeyChange(keyChange.withChanges(changes))
		}
	}
	
	
	draw()
	{
		for (const meterChange of this.owner.song.meterChanges.enumerateOverlappingRange(this.owner.screenRange))
		{
			if (!this.owner.selection.has(meterChange.id))
				this.drawMeterChange(meterChange)
		}
		
		for (const keyChange of this.owner.song.keyChanges.enumerateOverlappingRange(this.owner.screenRange))
		{
			if (!this.owner.selection.has(keyChange.id))
				this.drawKeyChange(keyChange)
		}
		
		for (const meterChange of this.owner.song.meterChanges.enumerateOverlappingRange(this.owner.screenRange))
		{
			if (this.owner.selection.has(meterChange.id))
				this.drawMeterChange(meterChange)
		}
		
		for (const keyChange of this.owner.song.keyChanges.enumerateOverlappingRange(this.owner.screenRange))
		{
			if (this.owner.selection.has(keyChange.id))
				this.drawKeyChange(keyChange)
		}
	}
	
	
	drawMeterChange(meterChange)
	{
		const rect = this.getMeterChangeHandleRect(meterChange)
		
		this.owner.ctx.fillStyle = "#0cf"
		
		this.owner.ctx.beginPath()
		this.owner.ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
		this.owner.ctx.fill()
		
		this.owner.ctx.font = "14px Verdana"
		this.owner.ctx.textAlign = "left"
		this.owner.ctx.textBaseline = "middle"
		this.owner.ctx.fillText(meterChange.numerator.toString() + " / " + meterChange.denominator.toString(), rect.x + rect.w + 5, rect.y + rect.h / 2)
		
		if (this.owner.selection.has(meterChange.id))
		{
			this.owner.ctx.globalAlpha = 0.75
			this.owner.ctx.fillStyle = "#fff"
			
			this.owner.ctx.beginPath()
			this.owner.ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2 - 3, 0, Math.PI * 2)
			this.owner.ctx.fill()
			
			this.owner.ctx.globalAlpha = 1
		}
	}
	
	
	drawKeyChange(keyChange)
	{
		const rect = this.getKeyChangeHandleRect(keyChange)
		
		this.owner.ctx.fillStyle = "#f0c"
		
		this.owner.ctx.beginPath()
		this.owner.ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
		this.owner.ctx.fill()
		
		this.owner.ctx.font = "14px Verdana"
		this.owner.ctx.textAlign = "left"
		this.owner.ctx.textBaseline = "middle"
		this.owner.ctx.fillText(keyChange.key.getName(), rect.x + rect.w + 5, rect.y + rect.h / 2)
		
		if (this.owner.selection.has(keyChange.id))
		{
			this.owner.ctx.globalAlpha = 0.75
			this.owner.ctx.fillStyle = "#fff"
			
			this.owner.ctx.beginPath()
			this.owner.ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2 - 3, 0, Math.PI * 2)
			this.owner.ctx.fill()
			
			this.owner.ctx.globalAlpha = 1
		}
	}
	
	
	getMeterChangeHandleRect(meterChange)
	{
		const timeOffsetFromScroll = meterChange.time.asFloat() - this.owner.timeScroll
		const handleX = timeOffsetFromScroll * this.owner.timeScale
		
		return new Rect(handleX - this.markerWidth / 2, this.meterMarkerY, this.markerWidth, this.meterMarkerHeight)
	}
	
	
	getKeyChangeHandleRect(keyChange)
	{
		const timeOffsetFromScroll = keyChange.time.asFloat() - this.owner.timeScroll
		const handleX = timeOffsetFromScroll * this.owner.timeScale
		
		return new Rect(handleX - this.markerWidth / 2, this.keyMarkerY, this.markerWidth, this.keyMarkerHeight)
	}
}