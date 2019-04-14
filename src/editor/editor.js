import { Song, Note, Chord, MeterChange, KeyChange } from "../song/song.js"
import { EditorMarkers } from "./editorMarkers.js"
import { EditorNotes } from "./editorNotes.js"
import { EditorChords } from "./editorChords.js"
import { Rational } from "../util/rational.js"
import { Range } from "../util/range.js"
import { Rect } from "../util/rect.js"
import { Key, scales } from "../util/theory.js"


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
			
			.upsertChord(new Chord(new Range(new Rational(0, 4), new Rational(3, 4)), 0, 0, 0))
			.upsertChord(new Chord(new Range(new Rational(4, 4), new Rational(7, 4)), 9, 0, 2))
			.upsertChord(new Chord(new Range(new Rational(8, 4), new Rational(13, 4)), 2, 0, 3))
			
			.upsertMeterChange(new MeterChange(new Rational(0, 4), 4, 4))
			.upsertMeterChange(new MeterChange(new Rational(11, 4), 5, 4))
			
			.upsertKeyChange(new KeyChange(new Rational(0, 4), new Key(0, 0, scales.major.pitches)))
			.upsertKeyChange(new KeyChange(new Rational(7, 4), new Key(9, 0, scales.minor.pitches)))
			.upsertKeyChange(new KeyChange(new Rational(9, 4), new Key(7, -1, scales.dorian.pitches)))
		
		this.timeScale = 200
		this.timeScroll = 0
		
		this.selection = new Set()
		
		this.tracks = []
		this.tracks.push(new EditorMarkers(this))
		this.tracks.push(new EditorNotes(this))
		this.tracks.push(new EditorChords(this))
		this.refreshLayout()
		
		this.cursorTime = new Range(new Rational(0), new Rational(0))
		this.cursorTrack = { start: 0, end: 0 }
		this.cursorShow = true
		
		this.mouseDown = false
		this.mouseDownData = { pos: { x: -1, y: -1 }, time: new Rational(0) }
		this.mousePos = { x: -1, y: -1 }
		this.mouseTime = new Rational(0)
		this.mouseTrack = -1
		this.mouseHoverAction = 0
		this.mouseDownAction = 0
		
		this.screenRange = new Range(new Rational(0), new Rational(0))
		
		canvas.onmousedown = (ev) => this.onMouseDown(ev)
		window.onmousemove = (ev) => this.onMouseMove(ev)
		window.onmouseup   = (ev) => this.onMouseUp  (ev)
		
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
	
	
	selectionClear()
	{
		this.selection.clear()
	}
	
	
	getMousePos(ev)
	{
		const rect = this.canvas.getBoundingClientRect()
		return {
			x: (ev.clientX - rect.left),
			y: (ev.clientY - rect.top)
		}
	}
	
	
	getTimeAtPos(pos)
	{
		const xOffset = (pos.x - this.tracks[0].area.x) / this.timeScale + this.timeScroll
		return Rational.fromFloat(xOffset, new Rational(1, 16))
	}
	
	
	onMouseDown(ev)
	{
		ev.preventDefault()
		
		if (this.mouseDown)
			return
		
		const isRightMouseButton = (ev.button != 0)
		
		this.mouseDown = true
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
			this.cursorTime = new Range(this.mouseTime, this.mouseTime, false, false)
			this.cursorTrack = { start: this.mouseDownData.track, end: this.mouseDownData.track }
		}
		else
		{		
			this.cursorShow = false
			for (const track of this.tracks)
				track.onDragStart({ x: this.mousePos.x - track.area.x, y: this.mousePos.y - track.area.y })
			
			if (this.mouseHoverAction & (Editor.ACTION_STRETCH_TIME_START | Editor.ACTION_STRETCH_TIME_END))
			{
				this.mouseDownData.stretchRange = null
				for (const track of this.tracks)
				{
					const trackRange = track.getSelectedRange()
					if (trackRange != null)
						this.mouseDownData.stretchRange = trackRange.merge(this.mouseDownData.stretchRange)
				}
				
				if (this.mouseDownData.stretchRange == null)
					this.mouseDownAction = 0
			}
		}
		
		if (this.mouseDownAction & Editor.ACTION_PAN)
			this.canvas.style.cursor = "default"
		
		this.draw()
	}
	
	
	onMouseMove(ev)
	{
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
				
				const trackMin = Math.min(this.cursorTrack.start, this.cursorTrack.end)
				const trackMax = Math.max(this.cursorTrack.start, this.cursorTrack.end)
				
				this.selectionClear()
				
				if (trackMin >= 0 && trackMax >= 0)
					for (let t = trackMin; t <= trackMax; t++)
						this.tracks[t].onSelectRange(this.cursorTime.sorted())
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
		ev.preventDefault()
		
		if (!this.mouseDown)
			return
		
		this.mouseDown = false
		this.mousePos = this.getMousePos(ev)
		this.mouseTime = this.getTimeAtPos(this.mousePos)
		
		for (const track of this.tracks)
			track.onMouseUp(ev, true, { x: this.mousePos.x - track.area.x, y: this.mousePos.y - track.area.y })
		
		this.draw()
	}
	
	
	draw()
	{
		this.ctx.save()
		
		this.ctx.fillStyle = "#111"
		this.ctx.fillRect(0, 0, this.width, this.height)
		
		this.screenRange = new Range(this.getTimeAtPos({ x: 0, y: 0 }), this.getTimeAtPos({ x: this.width, y: 0 }))
		
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
			
			let time = curMeter.time.add(submeasureDuration)
			let submeasureCount = 1
			while (time.lessThan(this.screenRange.end) && (nextMeter == null || time.lessThan(nextMeter.time)))
			{
				const submeasureX = (time.asFloat() - this.timeScroll) * this.timeScale
				
				if (time.greaterThan(this.screenRange.start))
				{
					this.ctx.strokeStyle = (submeasureCount % curMeter.numerator == 0 ? "#888" : "#444")
					this.ctx.beginPath()
					this.ctx.moveTo(submeasureX, 0)
					this.ctx.lineTo(submeasureX, this.height)
					this.ctx.stroke()
				}
				
				submeasureCount++
				time = time.add(submeasureDuration)
			}
		}
		
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
			this.drawCursorBeam(this.cursorTime.start)
			this.drawCursorBeam(this.cursorTime.end)
		}
		
		this.ctx.restore()
	}
	
	
	drawCursorBeam(time)
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
		
		this.ctx.beginPath()
		this.ctx.moveTo(this.tracks[trackMin].area.x + x, this.tracks[trackMin].area.y)
		this.ctx.lineTo(this.tracks[trackMax].area.x + x, this.tracks[trackMax].area.y + this.tracks[trackMax].area.h)
		this.ctx.stroke()
		
		this.ctx.restore()
	}
}