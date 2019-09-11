//import { KeyChange } from "../song/song.js"
import { Editor } from "./editor.js"
import { Rational } from "../util/rational.js"
import { Range } from "../util/range.js"
import { Rect } from "../util/rect.js"
import { Key, scales, Chord, chords, drawChordOnCanvas, getChordKindFromPitches, getRomanNumeralScaleDegreeStr, getScaleDegreeForPitch, getPitchForScaleDegree, getColorRotationForScale, getColorForScaleDegree, getFillStyleForScaleDegree } from "../util/theory.js"


export class EditorChords
{
	constructor(owner)
	{
		this.owner = owner
		this.area = new Rect(0, 0, 0, 0)
		
		this.decorationHeight = 10
		
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
			
			const chord = this.owner.song.chords.findById(this.hoverId)
			this.owner.playChordSample(chord.chord)
			this.owner.insertionDuration = chord.range.duration
		}
	}
	
	
	onMouseMove(ev, mouseDown, mousePos)
	{
		this.hoverId = -1
		this.owner.mouseHoverChordId = null
		
		for (const chord of this.owner.song.chords.iterAtRange(this.owner.screenRange))
		{
			const rect = this.getChordRect(chord, 0, this.owner.width)
			
			const margin = 4 + (rect.w < 16 ? 16 - rect.w : 0)
			const stretchMargin = 12
			
			const rectWithMargin = new Rect(rect.x - margin, rect.y, rect.w + margin * 2, rect.h)
			if (rectWithMargin.contains(mousePos))
			{
				this.hoverId = chord.id
				this.hoverRange = chord.range
				this.owner.mouseHoverChordId = chord.id
				
				if (mousePos.x < rectWithMargin.x + stretchMargin)
					this.owner.mouseHoverAction = Editor.ACTION_STRETCH_TIME_START
				else if (mousePos.x > rectWithMargin.x + rectWithMargin.w - stretchMargin)
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
	
	
	onKeyDown(ev, trackIsSelected)
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
						this.alterSelectedChords((data, origData, changes) =>
						{
							changes.range = data.range.stretch(offset, this.owner.keyDownData.stretchRange.start, this.owner.keyDownData.stretchRange.end).sorted()
							this.owner.insertionDuration = changes.range.duration
						})
				}
				else
					this.alterSelectedChords((data, origData, changes) => changes.range = data.range.displace(offset))
				
				this.owner.cursorShow = false
				return true
			}
			case "arrowup":
			case "arrowdown":
			{
				let offset = (ev.shiftKey && !this.owner.cursorShow ? 7 : 1)
				if (key == "arrowdown")
					offset = -offset
				
				this.alterSelectedChords((data, origData, changes) =>
				{
					const keyChange = this.owner.song.keyChanges.findActiveAt(data.range.start) || new KeyChange(data.range.start, new Key(0, 0, scales[0].pitches))
					const scaleDegree = getScaleDegreeForPitch(keyChange.key, data.chord.rootPitch)
					changes.chord = data.chord.withChanges({ rootPitch: getPitchForScaleDegree(keyChange.key, scaleDegree + offset) })
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
				
				this.alterSelectedChords((data, origData, changes) => changes.chord = data.chord.withChanges({ rootPitch: data.chord.rootPitch + offset }))
				this.owner.cursorShow = false
				return true
			}
			case "delete":
			case "backspace":
			{
				for (const chord of this.owner.song.chords.iterAll())
				{
					if (!this.owner.selection.has(chord.id))
						continue
					
					this.owner.song = this.owner.song.upsertChord(chord, true)
					this.owner.selection.delete(chord.id)
				}
				return true
			}
			case "1":
			case "2":
			case "3":
			case "4":
			case "5":
			case "6":
			case "7":
			{
				if (!trackIsSelected)
					break
				
				const degree = key.charCodeAt(0) - "1".charCodeAt(0)
				const keyChange = this.owner.song.keyChanges.findActiveAt(this.owner.cursorTime.start) || new KeyChange(this.owner.cursorTime.start, new Key(0, 0, scales[0].pitches))
				const rootPitch = getPitchForScaleDegree(keyChange.key, degree + 0)
				
				const relativePitches =
				[
					getPitchForScaleDegree(keyChange.key, degree + 0) - rootPitch,
					getPitchForScaleDegree(keyChange.key, degree + 2) - rootPitch,
					getPitchForScaleDegree(keyChange.key, degree + 4) - rootPitch
				]
				const kind = getChordKindFromPitches(relativePitches)
				
				const chord = new Chord(rootPitch, 0, kind, {})
				this.owner.insertChordAtCursor(chord)
				return true
			}
		}
		
		return false
	}
	
	
	alterSelectedChords(fn)
	{
		for (const chord of this.owner.song.chords.iterAll())
		{
			if (!this.owner.selection.has(chord.id))
				continue
			
			const origData = this.dragData.get(chord.id)
			
			let changes = { }
			fn(chord, origData, changes)
			this.owner.song = this.owner.song.upsertChord(chord.withChanges(changes))
		}
	}
	
	
	onPan()
	{
	}
	
	
	sanitizeSelection()
	{
		for (const selectedChord of this.owner.song.chords.iterAll())
		{
			if (!this.owner.selection.has(selectedChord.id))
				continue
			
			this.owner.song = this.owner.song.upsertChord(selectedChord, true)
		
			for (const chord of this.owner.song.chords.iterAtRange(selectedChord.range))
			{
				const slices = chord.range.slice(selectedChord.range)
				if (slices.length == 1 && chord.range.start.compare(slices[0].start) == 0 && chord.range.end.compare(slices[0].end) == 0)
					continue
				
				this.owner.song = this.owner.song.upsertChord(chord, true)
				
				for (const slice of slices)
					this.owner.song = this.owner.song.upsertChord(chord.withChanges({ id: -1, range: slice }))
			}
			
			this.owner.song = this.owner.song.upsertChord(selectedChord)
		}
	}
	
	
	deleteRange(range)
	{
		for (const chord of this.owner.song.chords.iterAtRange(range))
		{
			const slices = chord.range.slice(range)
			if (slices.length == 1 && chord.range.start.compare(slices[0].start) == 0 && chord.range.end.compare(slices[0].end) == 0)
				continue
			
			this.owner.song = this.owner.song.upsertChord(chord, true)
			
			for (const slice of slices)
				this.owner.song = this.owner.song.upsertChord(chord.withChanges({ id: -1, range: slice }))
		}
	}
	
	
	getPreviousAnchor(time)
	{
		const prev = this.owner.song.chords.findPrevious(time)
		if (!prev)
			return null
		
		return prev.range.end
	}
	
	
	getPreviousDeletionAnchor(time)
	{
		return this.owner.song.chords.findPreviousDeletionAnchor(time)
	}
	
	
	getSelectedRange()
	{
		let range = null
		
		for (const chord of this.owner.song.chords.iterAll())
		{
			if (!this.owner.selection.has(chord.id))
				continue
			
			range = chord.range.merge(range)
		}
		
		return range
	}
	
	
	onSelectRange(range)
	{
		for (const chord of this.owner.song.chords.iterAll())
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
		
		for (const chord of this.owner.song.chords.iterAll())
		{
			if (!this.owner.selection.has(chord.id))
				continue
			
			this.dragData.set(chord.id, chord)
		}
	}
	
	
	onDrag(mousePos)
	{
		for (const chord of this.owner.song.chords.iterAll())
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
			
			this.owner.insertionDuration = (changes.range || noteOrigData.range).duration
			
			this.owner.song = this.owner.song.upsertChord(chord.withChanges(changes))
		}
	}
	
	
	draw()
	{
		for (const pair of this.owner.song.keyChanges.iterActiveAtRangePairwise(this.owner.screenRange))
		{
			const curKey  = pair[0] || new KeyChange(this.owner.screenRange.start, new Key(0, 0, scales[0].pitches))
			const nextKey = pair[1] || new KeyChange(this.owner.screenRange.end,   new Key(0, 0, scales[0].pitches))
			
			const timeStart = curKey.time.max(this.owner.screenRange.start)
			const timeEnd = nextKey.time.min(this.owner.screenRange.end)
			
			const xStart = (curKey .time.asFloat() - this.owner.timeScroll) * this.owner.timeScale
			const xEnd   = (nextKey.time.asFloat() - this.owner.timeScroll) * this.owner.timeScale
			
			for (const chord of this.owner.song.chords.iterAtRange(new Range(timeStart, timeEnd)))
			{
				if (!this.owner.selection.has(chord.id))
					this.drawChord(chord, curKey.key, xStart, xEnd)
			}
			
			for (const chord of this.owner.song.chords.iterAtRange(new Range(timeStart, timeEnd)))
			{
				if (this.owner.selection.has(chord.id))
					this.drawChord(chord, curKey.key, xStart, xEnd)
			}
		}
	}
	
	
	drawChord(chord, key, xStart, xEnd)
	{
		const rect = this.getChordRect(chord, xStart, xEnd)
		const playbackOverlaps = (this.owner.playing && chord.range.overlapsPoint(this.owner.playbackTimeRational))
		const selected = (playbackOverlaps || (!this.owner.playing && this.owner.selection.has(chord.id)))
		const hovering = (playbackOverlaps || this.hoverId == chord.id)
			
		drawChordOnCanvas(this.owner.ctx, rect, chord.chord, key, selected, hovering)
	}
	
	
	getChordRect(chord, xStart, xEnd)
	{
		const timeOffsetFromScroll1 = chord.range.start.asFloat() - this.owner.timeScroll
		const timeOffsetFromScroll2 = chord.range.end  .asFloat() - this.owner.timeScroll
		
		const chordOrigX1 = timeOffsetFromScroll1 * this.owner.timeScale
		const chordOrigX2 = timeOffsetFromScroll2 * this.owner.timeScale
		
		let chordX1 = Math.max(chordOrigX1, xStart)
		let chordX2 = Math.min(chordOrigX2, xEnd)
		
		const cutStart = chordOrigX1 < chordX1
		const cutEnd   = chordOrigX2 > chordX2
		
		if (!cutStart) chordX1 += 1
		if (!cutEnd)   chordX2 -= 1
		
		const chordW = Math.max(2, chordX2 - chordX1)
		
		return Object.assign(new Rect(chordX1, 0, chordW, this.area.h), { cutStart, cutEnd })
	}
}