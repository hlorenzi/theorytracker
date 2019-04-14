import { KeyChange } from "../song/song.js"
import { Editor } from "./editor.js"
import { Rect } from "../util/rect.js"
import { Range } from "../util/range.js"
import { Key, scales, chordList, getRomanNumeralScaleDegreeStr, getScaleDegreeForPitch, getColorRotationForScale, getColorForScaleDegree } from "../util/theory.js"


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
	
	
	onMouseDown(ev, mouseDown, mouseRightButton, mousePos)
	{
		if (mouseRightButton)
			return
		
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
			const rect = this.getChordRect(chord, 0, this.owner.width)
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
		for (const pair of this.owner.song.keyChanges.enumerateAffectingRangePairwise(this.owner.screenRange))
		{
			const curKey  = pair[0] || new KeyChange(this.owner.screenRange.start, new Key(0, 0, scales.major.pitches))
			const nextKey = pair[1] || new KeyChange(this.owner.screenRange.end,   new Key(0, 0, scales.major.pitches))
			
			const xStart = (curKey .time.asFloat() - this.owner.timeScroll) * this.owner.timeScale
			const xEnd   = (nextKey.time.asFloat() - this.owner.timeScroll) * this.owner.timeScale
			
			for (const chord of this.owner.song.chords.enumerateOverlappingRange(new Range(curKey.time, nextKey.time)))
			{
				if (!this.owner.selection.has(chord.id))
					this.drawChord(chord, curKey.key, xStart, xEnd)
			}
			
			for (const chord of this.owner.song.chords.enumerateOverlappingRange(new Range(curKey.time, nextKey.time)))
			{
				if (this.owner.selection.has(chord.id))
					this.drawChord(chord, curKey.key, xStart, xEnd)
			}
		}
	}
	
	
	drawChord(chord, key, xStart, xEnd)
	{
		const rect = this.getChordRect(chord, xStart, xEnd)
		
		const scaleDegree = getScaleDegreeForPitch(key, chord.pitch + chord.accidental)
		const scaleDegreeRotation = getColorRotationForScale(key.scalePitches)
		const color = getColorForScaleDegree(scaleDegree + scaleDegreeRotation)
		
		this.owner.ctx.fillStyle = "#eee"
		this.owner.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
		
		this.owner.ctx.fillStyle = color
		this.owner.ctx.fillRect(rect.x, rect.y, rect.w, this.decorationHeight)
		this.owner.ctx.fillRect(rect.x, rect.y + rect.h - this.decorationHeight, rect.w, this.decorationHeight)
		
		this.owner.ctx.fillStyle = "#000"
		this.owner.ctx.font = "20px Verdana"
		this.owner.ctx.textAlign = "center"
		this.owner.ctx.textBaseline = "middle"
		
		const chordData = chordList[chord.chordKind]
		
		let mainStr = getRomanNumeralScaleDegreeStr(scaleDegree, chord.accidental)
		if (chordData.symbol[0])
			mainStr = mainStr.toLowerCase()
		
		mainStr = mainStr + chordData.symbol[1]
		
		this.owner.ctx.fillText(mainStr, rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w - 6)
		
		if (chordData.symbol[2])
		{
			const mainStrWidth = this.owner.ctx.measureText(mainStr)
			this.owner.ctx.font = "15px Verdana"
			this.owner.ctx.textAlign = "left"
			this.owner.ctx.fillText(chordData.symbol[2], rect.x + rect.w / 2 + mainStrWidth.width / 2, rect.y + rect.h / 2 - 8, rect.w - 6)
		}
		
		if (this.owner.selection.has(chord.id))
		{
			this.owner.ctx.globalAlpha = 0.5
			this.owner.ctx.fillStyle = "#fff"
			this.owner.ctx.fillRect(rect.x + (rect.cutStart ? 0 : 3), rect.y + 3, rect.w - (rect.cutEnd ? 0 : 3) - (rect.cutStart ? 0 : 3), rect.h - 6)
			
			this.owner.ctx.globalAlpha = 1
		}
		
		if (this.hoverId == chord.id)
		{
			this.owner.ctx.globalAlpha = 0.5
			this.owner.ctx.fillStyle = "#fee"
			this.owner.ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
			
			this.owner.ctx.globalAlpha = 1
		}
	}
	
	
	getChordRect(chord, xStart, xEnd)
	{
		const timeOffsetFromScroll1 = chord.range.start.asFloat() - this.owner.timeScroll
		const timeOffsetFromScroll2 = chord.range.end  .asFloat() - this.owner.timeScroll
		
		const chordOrigX1 = timeOffsetFromScroll1 * this.owner.timeScale
		const chordOrigX2 = timeOffsetFromScroll2 * this.owner.timeScale
		const chordX1 = Math.max(chordOrigX1, xStart)
		const chordX2 = Math.min(chordOrigX2, xEnd)
		const chordW = chordX2 - chordX1
		
		const cutStart = chordOrigX1 < chordX1
		const cutEnd   = chordOrigX2 > chordX2
		
		return Object.assign(new Rect(chordX1, 0, chordW, this.area.h), { cutStart, cutEnd })
	}
}