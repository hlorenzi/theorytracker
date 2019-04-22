import { Song, Note, SongChord, MeterChange, KeyChange } from "../song/song.js"
import { EditorMarkers } from "./editorMarkers.js"
import { EditorNotes } from "./editorNotes.js"
import { EditorChords } from "./editorChords.js"
import { Rational } from "../util/rational.js"
import { Range } from "../util/range.js"
import { Rect } from "../util/rect.js"
import { Key, scales, Chord } from "../util/theory.js"


export class Editor
{
	static ACTION_SELECTION_TIME     = 0x01
	static ACTION_PAN                = 0x02
	static ACTION_DRAG_TIME          = 0x10
	static ACTION_DRAG_PITCH         = 0x20
	static ACTION_STRETCH_TIME_START = 0x40
	static ACTION_STRETCH_TIME_END   = 0x80
	
	
	constructor(canvas)
	{
		this.canvas = canvas
		this.ctx = canvas.getContext("2d")
		this.width = parseInt(canvas.width)
		this.height = parseInt(canvas.height)
		
		this.song = new Song()
			.upsertNote(new Note(new Range(new Rational(0, 4), new Rational(1, 4)), 60))
			.upsertNote(new Note(new Range(new Rational(1, 4), new Rational(2, 4)), 62))
			.upsertNote(new Note(new Range(new Rational(2, 4), new Rational(3, 4)), 64))
			.upsertNote(new Note(new Range(new Rational(3, 4), new Rational(4, 4)), 65))
			.upsertNote(new Note(new Range(new Rational(4, 4), new Rational(5, 4)), 67))
			.upsertNote(new Note(new Range(new Rational(5, 4), new Rational(6, 4)), 69))
			.upsertNote(new Note(new Range(new Rational(6, 4), new Rational(7, 4)), 71))
			.upsertNote(new Note(new Range(new Rational(7, 4), new Rational(8, 4)), 72))
			
			.upsertChord(new SongChord(new Range(new Rational(0, 4), new Rational(3, 4)), new Chord(0, 0, 0)))
			.upsertChord(new SongChord(new Range(new Rational(4, 4), new Rational(7, 4)), new Chord(9, 0, 2)))
			.upsertChord(new SongChord(new Range(new Rational(8, 4), new Rational(13, 4)), new Chord(2, 0, 3)))
			
			.upsertMeterChange(new MeterChange(new Rational(0, 4), 4, 4))
			.upsertMeterChange(new MeterChange(new Rational(11, 4), 5, 4))
			
			.upsertKeyChange(new KeyChange(new Rational(0, 4), new Key(0, 0, scales.major.pitches)))
			.upsertKeyChange(new KeyChange(new Rational(7, 4), new Key(5, 1, scales.minor.pitches)))
			.upsertKeyChange(new KeyChange(new Rational(9, 4), new Key(7, -1, scales.doubleHarmonic.pitches)))
		
		this.timeScale = 200
		this.timeScroll = 0
		this.timeSnap = new Rational(1, 16)
		this.timeSnapBase = new Rational(1, 16)
		
		this.selection = new Set()
		
		this.tracks = []
		this.tracks.push(new EditorMarkers(this))
		this.tracks.push(new EditorNotes(this))
		this.tracks.push(new EditorChords(this))
		this.refreshLayout()
		
		this.cursorTime = new Range(new Rational(0), new Rational(0))
		this.cursorTrack = { start: 0, end: 0 }
		this.cursorShow = true
		this.insertionDuration = new Rational(1, 4)
		
		this.mouseDown = false
		this.mouseDownDate = new Date()
		this.mouseDownData = { pos: { x: -1, y: -1 }, time: new Rational(0) }
		this.mousePos = { x: -1, y: -1 }
		this.mouseTime = new Rational(0)
		this.mouseTrack = -1
		this.mouseHoverAction = 0
		this.mouseDownAction = 0
		
		this.keyDownData = { pos: { x: -1, y: -1 }, time: new Rational(0) }
		
		this.screenRange = new Range(new Rational(0), new Rational(0))
		
		this.doubleClickThreshold = 250
		
		canvas.onmousedown = (ev) => this.onMouseDown(ev)
		window.onmousemove = (ev) => this.onMouseMove(ev)
		window.onmouseup   = (ev) => this.onMouseUp  (ev)
		window.onkeydown   = (ev) => this.onKeyDown  (ev)
		
		canvas.onwheel = (ev) => this.onMouseWheel(ev)
		
		canvas.oncontextmenu = (ev) => { ev.preventDefault() }
	}
	
	
	setSong(song)
	{
		this.song = song
	}
	
	
	refreshLayout()
	{
		this.tracks[0].area = new Rect(0, 0, this.width, 44)
		this.tracks[1].area = new Rect(0, 44, this.width, this.height - 44 - 60)
		this.tracks[2].area = new Rect(0, this.height - 60, this.width, 60)
	}
	
	
	insertNoteAtCursor(pitch)
	{
		const time = this.cursorTime.start.min(this.cursorTime.end)
		const duration = this.insertionDuration
		
		const id = this.song.nextId
		this.song = this.song.upsertNote(new Note(Range.fromStartDuration(time, duration), 60 + pitch))
		
		this.cursorTime = Range.fromPoint(time.add(duration))
		this.cursorTrack = { start: 1, end: 1 }
		this.cursorShow = false
		
		this.selectionClear()
		this.selection.add(id)
		
		this.toolboxRefreshFn()
		this.draw()
	}
	
	
	insertChordAtCursor(chord)
	{
		const time = this.cursorTime.start.min(this.cursorTime.end)
		const duration = this.insertionDuration
		
		const id = this.song.nextId
		this.song = this.song.upsertChord(new SongChord(Range.fromStartDuration(time, duration), chord))
		
		this.cursorTime = Range.fromPoint(time.add(duration))
		this.cursorTrack = { start: 2, end: 2 }
		this.cursorShow = false
		
		this.selectionClear()
		this.selection.add(id)
		
		this.toolboxRefreshFn()
		this.draw()
	}
	
	
	*enumerateTracksUnderCursor()
	{
		const trackMin = Math.min(this.cursorTrack.start, this.cursorTrack.end)
		const trackMax = Math.max(this.cursorTrack.start, this.cursorTrack.end)
		
		if (trackMin >= 0 && trackMax >= 0)
			for (let t = trackMin; t <= trackMax; t++)
				yield this.tracks[t]
	}
	
	
	selectionClear()
	{
		this.selection.clear()
	}
	
	
	selectUnderCursor()
	{
		this.selectionClear()
		
		for (const track of this.enumerateTracksUnderCursor())
			track.onSelectRange(this.cursorTime.sorted())
	}
	
	
	getSelectionRange()
	{
		let range = null
		for (const track of this.tracks)
		{
			const trackRange = track.getSelectedRange()
			if (trackRange != null)
				range = trackRange.merge(range)
		}
		
		return range
	}
	
	
	getSelectionTrackRange()
	{
		let max = null
		let min = null
		for (let t = 0; t < this.tracks.length; t++)
		{
			const trackRange = this.tracks[t].getSelectedRange()
			if (trackRange != null)
			{
				max = (max == null ? t : Math.max(max, t))
				min = (min == null ? t : Math.min(min, t))
			}
		}
		
		return (max == null || min == null ? null : { start: min, end: max })
	}
	
	
	getMousePos(ev)
	{
		const rect = this.canvas.getBoundingClientRect()
		return {
			x: (ev.clientX - rect.left),
			y: (ev.clientY - rect.top)
		}
	}
	
	
	getTimeAtPos(pos, snap = null)
	{
		snap = snap || this.timeSnap
		const xOffset = (pos.x - this.tracks[0].area.x) / this.timeScale + this.timeScroll
		return Rational.fromFloat(xOffset, snap)
	}
	
	
	onMouseDown(ev)
	{
		ev.preventDefault()
		
		if (this.mouseDown)
			return
		
		const isRightMouseButton = (ev.button != 0)
		const prevMouseDownDate = this.mouseDownDate
		
		this.mouseDown = true
		this.mouseDownDate = new Date()
		this.mousePos = this.getMousePos(ev)
		this.mouseTime = this.getTimeAtPos(this.mousePos)
		this.mouseTrack = this.tracks.findIndex(track => track.area.contains(this.mousePos))
		this.mouseDownData = { pos: this.mousePos, time: this.mouseTime, timeScroll: this.timeScroll, track: this.mouseTrack }
		this.mouseDownAction = (isRightMouseButton ? Editor.ACTION_PAN : Editor.ACTION_SELECTION_TIME)
		
		const hoveringSelected = this.tracks.reduce((accum, track) => accum || track.hasSelectedAt({ x: this.mousePos.x - track.area.x, y: this.mousePos.y - track.area.y }), false)
		
		if (!ev.ctrlKey && !hoveringSelected && !isRightMouseButton)
			this.selectionClear()
		
		for (const track of this.tracks)
		{
			if (track.area.contains(this.mousePos))
				track.onMouseDown(ev, true, isRightMouseButton, { x: this.mousePos.x - track.area.x, y: this.mousePos.y - track.area.y })
		}
		
		if (this.mouseDownAction == Editor.ACTION_PAN)
		{
			this.cursorShow = false
		}
		else if (this.mouseDownAction == Editor.ACTION_SELECTION_TIME)
		{
			this.cursorShow = true
			this.cursorTrack = { start: this.mouseDownData.track, end: this.mouseDownData.track }
			
			if (this.mouseDownDate.getTime() - prevMouseDownDate.getTime() > this.doubleClickThreshold)
				this.cursorTime = new Range(this.mouseTime, this.mouseTime, false, false)
			else
			{
				const anchorPoint = this.tracks[this.mouseDownData.track].getPreviousAnchor(this.cursorTime.min())
				
				if (anchorPoint != null)
				{
					this.cursorTime = Range.fromPoint(anchorPoint, false, false)
					this.mouseDownAction = 0
				}
			}
		}
		else
		{		
			this.cursorTrack = { start: this.mouseDownData.track, end: this.mouseDownData.track }
			this.cursorShow = false
			for (const track of this.tracks)
				track.onDragStart({ x: this.mousePos.x - track.area.x, y: this.mousePos.y - track.area.y })
			
			if (this.mouseHoverAction & (Editor.ACTION_STRETCH_TIME_START | Editor.ACTION_STRETCH_TIME_END))
			{
				this.mouseDownData.stretchRange = this.getSelectionRange()
				
				if (this.mouseDownData.stretchRange == null)
					this.mouseDownAction = 0
			}
		}
		
		if (this.mouseDownAction & Editor.ACTION_PAN)
			this.canvas.style.cursor = "default"
		
		this.toolboxRefreshFn()
		this.draw()
	}
	
	
	onMouseMove(ev)
	{
		if (this.mouseDown)
			ev.preventDefault()
		
		this.mousePos = this.getMousePos(ev)
		this.mouseTime = this.getTimeAtPos(this.mousePos)
		this.mouseTrack = this.tracks.findIndex(track => track.area.contains(this.mousePos))
		
		if (this.mouseDown)
		{
			if (this.mouseDownAction == Editor.ACTION_PAN)
			{
				this.timeScroll = this.mouseDownData.timeScroll + (this.mouseDownData.pos.x - this.mousePos.x) / this.timeScale
				if (this.mouseDownData.track >= 0)
					this.tracks[this.mouseDownData.track].onPan()
			}
			else if (this.mouseDownAction == Editor.ACTION_SELECTION_TIME)
			{
				this.cursorTime = new Range(this.cursorTime.start, this.mouseTime, false, false)
				
				if (this.mouseTrack >= 0)
					this.cursorTrack = { ...this.cursorTrack, end: this.mouseTrack }
				
				this.selectUnderCursor()				
			}
			else
			{
				for (const track of this.tracks)
					track.onDrag({ x: this.mousePos.x - track.area.x, y: this.mousePos.y - track.area.y })
			}
		}
		else
		{
			this.mouseHoverAction = Editor.ACTION_SELECTION_TIME
			
			for (const track of this.tracks)
				track.onMouseLeave()
			
			if (this.mouseTrack >= 0)
			{
				const track = this.tracks[this.mouseTrack]
				track.onMouseMove(ev, this.mouseDown, { x: this.mousePos.x - track.area.x, y: this.mousePos.y - track.area.y })
			}
		}
		
		if (this.mouseDown && (this.mouseDownAction & Editor.ACTION_PAN))
			this.canvas.style.cursor = "default"
		else if (this.mouseHoverAction & (Editor.ACTION_DRAG_TIME | Editor.ACTION_DRAG_TIME))
			this.canvas.style.cursor = "move"
		else if (this.mouseHoverAction & (Editor.ACTION_STRETCH_TIME_START | Editor.ACTION_STRETCH_TIME_END))
			this.canvas.style.cursor = "col-resize"
		else if (this.mouseTrack >= 0)
			this.canvas.style.cursor = "text"
		else
			this.canvas.style.cursor = "default"
		
		this.draw()
	}
	
	
	onMouseUp(ev)
	{
		if (!this.mouseDown)
			return
		
		ev.preventDefault()
		
		this.mouseDown = false
		this.mousePos = this.getMousePos(ev)
		this.mouseTime = this.getTimeAtPos(this.mousePos)
		
		for (const track of this.tracks)
			track.onMouseUp(ev, true, { x: this.mousePos.x - track.area.x, y: this.mousePos.y - track.area.y })
		
		this.toolboxRefreshFn()
		this.draw()
	}
	
	
	onMouseWheel(ev)
	{
		const snap = new Rational(1, 1024)
		const prevMouseTime = this.getTimeAtPos(this.mousePos, snap)
		
		this.timeScale *= (ev.deltaY > 0 ? 0.8 : 1.25)
		this.timeScale = Math.max(4, Math.min(2048, this.timeScale))
		
		const newMouseTime = this.getTimeAtPos(this.mousePos, snap)
		
		this.timeScroll -= (newMouseTime.subtract(prevMouseTime).asFloat())
		
		const timeSnapAdjustThresholdUpper = 24
		const timeSnapAdjustThresholdLower = 8
		this.timeSnap = this.timeSnapBase
		
		if (this.timeSnap.asFloat() * this.timeScale > timeSnapAdjustThresholdUpper)
			while (this.timeSnap.asFloat() * this.timeScale > timeSnapAdjustThresholdUpper)
				this.timeSnap = this.timeSnap.divide(new Rational(2))
			
		else if (this.timeSnap.asFloat() * this.timeScale < timeSnapAdjustThresholdLower)
			while (this.timeSnap.asFloat() * this.timeScale < timeSnapAdjustThresholdLower)
				this.timeSnap = this.timeSnap.divide(new Rational(1, 2))
		
		this.draw()
	}
	
	
	onKeyDown(ev)
	{
		this.keyDownData = {}
		this.keyDownData.stretchRange = this.getSelectionRange()
		
		const selectionEmpty = (this.selection.size == 0)
		const selectionTrackRange = this.getSelectionTrackRange()
		
		let handled = false
		
		const key = ev.key.toLowerCase()
		switch (key)
		{
			case "arrowright":
			case "arrowleft":
			{
				if (!this.cursorShow)
					break
				
				const offset = (key == "arrowright" ? this.timeSnap : this.timeSnap.negate())
				
				if (ev.shiftKey)
				{
					this.cursorTime = new Range(this.cursorTime.start, this.cursorTime.end.add(offset), false, false)
					this.selectUnderCursor()
					handled = true
				}
				else if (selectionEmpty)
				{
					const start  = (key == "arrowright" ? this.cursorTime.max() : this.cursorTime.min())
					this.cursorTime = Range.fromPoint(start.add(offset), false, false)
					this.cursorTrack = { start: this.cursorTrack.end, end: this.cursorTrack.end }
					handled = true
				}
				break
			}
			case "arrowup":
			case "arrowdown":
			{
				if (!this.cursorShow)
					break
				
				const offset = (key == "arrowdown" ? 1 : -1)
				
				if (ev.shiftKey)
				{
					const track = Math.max(0, Math.min(this.tracks.length - 1, this.cursorTrack.end + offset))
					this.cursorTrack = { start: this.cursorTrack.start, end: track }
					this.selectUnderCursor()
					handled = true
				}
				else if (selectionEmpty)
				{
					const start = (key == "arrowdown" ? Math.max : Math.min)(this.cursorTrack.start, this.cursorTrack.end)
					const track = Math.max(0, Math.min(this.tracks.length - 1, start + offset))
					this.cursorTime = Range.fromPoint(this.cursorTime.end, false, false)
					this.cursorTrack = { start: track, end: track }
					handled = true
				}
				break
			}
			case "enter":
			case "escape":
			{
				const range = this.getSelectionRange()
				const trackRange = this.getSelectionTrackRange()
				if (range != null && trackRange != null)
				{
					this.cursorTime = Range.fromPoint(range.end, false, false)
					this.cursorTrack = trackRange
				}
				else
				{
					this.cursorTime = Range.fromPoint(this.cursorTime.max(), false, false)
				}
				
				this.selectionClear()
				this.cursorShow = true
				handled = true
				break
			}
			case "backspace":
			{
				if (!selectionEmpty)
					break
				
				let anchorPoint = null
				for (const track of this.enumerateTracksUnderCursor())
					anchorPoint = Rational.max(anchorPoint, track.getPreviousDeletionAnchor(this.cursorTime.min()))
				
				if (anchorPoint != null)
				{
					this.cursorTime = Range.fromPoint(anchorPoint, false, false)
					handled = true
				}
				break
			}
		}
		
		if (!handled)
			for (const track of this.tracks)
				handled |= track.onKeyDown(ev)
		
		if (handled)
		{
			switch (ev.key.toLowerCase())
			{
				case "arrowright":
				case "arrowleft":
				{
					if (this.cursorShow)
						break
					
					const newSelectionRange = this.getSelectionRange()
					if (newSelectionRange != null)
						this.cursorTime = Range.fromPoint(newSelectionRange.max(), false, false)
					
					break
				}
				case "backspace":
				case "delete":
				{
					if (this.keyDownData.stretchRange != null)
						this.cursorTime = Range.fromPoint(this.keyDownData.stretchRange.min(), false, false)
					
					if (selectionTrackRange != null)
						this.cursorTrack = selectionTrackRange
					
					this.cursorShow = true
					break
				}
			}
			
			ev.preventDefault()
			this.toolboxRefreshFn()
			this.draw()
		}
	}
	
	
	draw()
	{
		this.ctx.save()
		
		this.ctx.fillStyle = "#111"
		this.ctx.fillRect(0, 0, this.width, this.height)
		
		this.screenRange = new Range(this.getTimeAtPos({ x: 0, y: 0 }), this.getTimeAtPos({ x: this.width, y: 0 }).add(this.timeSnap))
		
		for (const [curMeter, nextMeter] of this.song.meterChanges.enumerateAffectingRangePairwise(this.screenRange))
		{
			if (curMeter == null)
				continue
			
			const x = (curMeter.time.asFloat() - this.timeScroll) * this.timeScale
			
			this.ctx.strokeStyle = "#0cf"
			this.ctx.lineCap = "square"
			this.ctx.lineWidth = 1
			
			this.ctx.beginPath()
			this.ctx.moveTo(x, 0)
			this.ctx.lineTo(x, this.height)
			this.ctx.stroke()
			
			const submeasureDuration = curMeter.getSubmeasureDuration()
			const submeasureBigEnough = submeasureDuration.asFloat() * this.timeScale > 8
				
			let time = curMeter.time.add(submeasureDuration)
			let submeasureCount = 1
			while (time.lessThan(this.screenRange.end) && (nextMeter == null || time.lessThan(nextMeter.time)))
			{
				const submeasureX = (time.asFloat() - this.timeScroll) * this.timeScale
				const isMeasure = submeasureCount % curMeter.numerator == 0
				
				if (time.greaterThan(this.screenRange.start) && (isMeasure || submeasureBigEnough))
				{
					this.ctx.strokeStyle = (isMeasure ? "#888" : "#444")
					this.ctx.beginPath()
					this.ctx.moveTo(submeasureX, 0)
					this.ctx.lineTo(submeasureX, this.height)
					this.ctx.stroke()
				}
				
				submeasureCount++
				time = time.add(submeasureDuration)
			}
		}
		
		if (this.cursorShow)
			this.drawCursorRect()
		
		for (const keyChange of this.song.keyChanges.enumerateOverlappingRange(this.screenRange))
		{
			const x = (keyChange.time.asFloat() - this.timeScroll) * this.timeScale
			
			this.ctx.strokeStyle = "#f0c"
			this.ctx.lineCap = "square"
			this.ctx.lineWidth = 1
			
			this.ctx.beginPath()
			this.ctx.moveTo(x, 0)
			this.ctx.lineTo(x, this.height)
			this.ctx.stroke()
		}
		
		for (const track of this.tracks)
		{
			this.ctx.save()
			this.ctx.translate(track.area.x, track.area.y)
			
			this.ctx.strokeStyle = "#aaa"
			this.ctx.lineCap = "square"
			this.ctx.lineWidth = 1
			
			this.ctx.beginPath()
			this.ctx.moveTo(0, 0)
			this.ctx.lineTo(this.width, 0)
			this.ctx.stroke()
			
			this.ctx.beginPath()
			this.ctx.rect(0, 0, track.area.w, track.area.h)
			this.ctx.clip()
			
			track.draw()
			this.ctx.restore()
		}
		
		if (this.cursorShow)
		{
			this.drawCursorBeam(this.cursorTime.min(), true)
			this.drawCursorBeam(this.cursorTime.max(), false)
		}
		
		this.ctx.restore()
	}
	
	
	drawCursorBeam(time, sideToRight)
	{
		const trackMin = Math.min(this.cursorTrack.start, this.cursorTrack.end)
		const trackMax = Math.max(this.cursorTrack.start, this.cursorTrack.end)
		
		if (trackMin < 0 || trackMax < 0)
			return
		
		this.ctx.save()
		
		const offset = time.asFloat() - this.timeScroll
		const x = offset * this.timeScale
		
		this.ctx.strokeStyle = "#0af"
		this.ctx.lineCap = "round"
		this.ctx.lineWidth = 3
		
		const headSize = 7 * (sideToRight ? 1 : -1)
		
		this.ctx.beginPath()
		this.ctx.moveTo(this.tracks[trackMin].area.x + x + headSize, this.tracks[trackMin].area.y)
		this.ctx.lineTo(this.tracks[trackMin].area.x + x, this.tracks[trackMin].area.y)
		this.ctx.lineTo(this.tracks[trackMax].area.x + x, this.tracks[trackMax].area.y + this.tracks[trackMax].area.h)
		this.ctx.lineTo(this.tracks[trackMin].area.x + x + headSize, this.tracks[trackMax].area.y + this.tracks[trackMax].area.h)
		this.ctx.stroke()
		
		this.ctx.restore()
	}
	
	
	drawCursorRect()
	{
		const timeMin = this.cursorTime.min()
		const timeMax = this.cursorTime.max()
		const trackMin = Math.min(this.cursorTrack.start, this.cursorTrack.end)
		const trackMax = Math.max(this.cursorTrack.start, this.cursorTrack.end)
		
		if (trackMin < 0 || trackMax < 0)
			return
		
		this.ctx.save()
		
		const xMin = (timeMin.asFloat() - this.timeScroll) * this.timeScale
		const xMax = (timeMax.asFloat() - this.timeScroll) * this.timeScale
		
		this.ctx.fillStyle = "#0af"
		this.ctx.globalAlpha = 0.15
		
		this.ctx.fillRect(
			this.tracks[trackMin].area.x + xMin,
			this.tracks[trackMin].area.y,
			xMax - xMin,
			this.tracks[trackMax].area.y + this.tracks[trackMax].area.h - this.tracks[trackMin].area.y)
		
		this.ctx.restore()
	}
}