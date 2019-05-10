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
	
	
	constructor(canvas, synth)
	{
		this.canvas = canvas
		this.ctx = canvas.getContext("2d")
		this.width = parseInt(canvas.width)
		this.height = parseInt(canvas.height)
		
		this.synth = synth
		
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
			
			.upsertKeyChange(new KeyChange(new Rational(0, 4), new Key(0, 0, scales[0].pitches)))
			.upsertKeyChange(new KeyChange(new Rational(7, 4), new Key(5, 1, scales[5].pitches)))
			.upsertKeyChange(new KeyChange(new Rational(9, 4), new Key(7, -1, scales[7].pitches)))
		
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
		this.cursorTrack = { start: 1, end: 1 }
		this.cursorShow = true
		this.insertionDuration = new Rational(1, 4)
		this.insertionPitch = 60
		
		this.playing = false
		this.playbackTime = 0
		this.playbackTimeRational = new Rational(0)
		
		this.mouseDown = false
		this.mouseDownDate = new Date()
		this.mouseDownData = { pos: { x: -1, y: -1 }, time: new Rational(0) }
		this.mousePos = { x: -1, y: -1 }
		this.mouseTime = new Rational(0)
		this.mouseTrack = -1
		this.mouseHoverAction = 0
		this.mouseDownAction = 0
		
		this.wheelDate = new Date()
		
		this.keyDownData = { pos: { x: -1, y: -1 }, time: new Rational(0) }
		this.curSanitizationMode = "ok"
		this.curSanitizationSelectionSize = 0
		
		this.screenRange = new Range(new Rational(0), new Rational(0))
		
		this.doubleClickThreshold = 250
		this.mouseEdgeScrollThreshold = 60
		this.mouseEdgeScrollSpeed = 1
		this.cursorEdgeScrollThreshold = new Rational(4)
		this.cursorEdgeScrollSpeed = 16
		
		canvas.onmousedown = (ev) => this.onMouseDown(ev)
		window.onmousemove = (ev) => this.onMouseMove(ev)
		window.onmouseup   = (ev) => this.onMouseUp  (ev)
		window.onkeydown   = (ev) => this.onKeyDown  (ev)
		
		canvas.onwheel = (ev) => this.onMouseWheel(ev)
		
		canvas.oncontextmenu = (ev) => { ev.preventDefault() }
	}
	
	
	resize(w, h)
	{
		const prevTimeAtCenter = this.getTimeAtPos({ x: this.width / 2, y: 0 }, new Rational(1, 2048))
		
		this.canvas.width = w
		this.canvas.height = h
		
		this.width = w
		this.height = h
		
		const newTimeAtCenter = this.getTimeAtPos({ x: this.width / 2, y: 0 }, new Rational(1, 2048))
		
		this.timeScroll += prevTimeAtCenter.subtract(newTimeAtCenter).asFloat()
		
		this.refreshLayout()
		this.draw()
	}
	
	
	setSong(song)
	{
		this.song = song
		this.toolboxRefreshFn()
		this.draw()
	}
	
	
	setPlayback(playing)
	{
		this.playing = playing
		this.playbackTime = this.cursorTime.min().asFloat()
		
		if (playing)
			this.scrollTimeIntoView(this.cursorTime.min())
		
		this.toolboxRefreshFn()
		this.draw()
		
		this.onPlaybackToggle(this.playing)
	}
	
	
	playNoteSample(pitch)
	{
		const midiPitchToHertz = (midiPitch) =>
		{
			return Math.pow(2, (midiPitch - 69) / 12) * 440
		}
		
		this.synth.stopAll()
		this.synth.addNoteEvent(0, 0, midiPitchToHertz(pitch), 1, 0.5)
		this.onPlaySample()
	}
	
	
	playChordSample(chord)
	{
		const midiPitchToHertz = (midiPitch) =>
		{
			return Math.pow(2, (midiPitch - 69) / 12) * 440
		}
		
		this.synth.stopAll()
		
		const pitches = chord.getStrummingPitches()
		for (const pitch of pitches)
			this.synth.addNoteEvent(0, 0, midiPitchToHertz(pitch), 1, 0.5)
		
		this.onPlaySample()
	}
	
	
	rewind()
	{
		this.selectionClear()
		
		this.cursorTime = Range.fromPoint(this.song.range.start)
		this.cursorShow = true
		this.playbackTime = this.cursorTime.start.asFloat()
		this.playbackTimeRational = this.cursorTime.start
		
		if (this.playing)
		{
			this.setPlayback(false)
			this.setPlayback(true)
		}
		else
			this.scrollTimeIntoView(this.cursorTime.start)
		
		this.toolboxRefreshFn()
		this.draw()
	}
	
	
	refreshLayout()
	{
		this.tracks[0].area = new Rect(0, 0, this.width, 44)
		this.tracks[1].area = new Rect(0, 44, this.width, this.height - 44 - 60)
		this.tracks[2].area = new Rect(0, this.height - 60, this.width, 60)
	}
	
	
	insertNoteAtCursor(pitch)
	{
		const mod = (x, m) => (x % m + m) % m
		
		pitch = mod(pitch, 12)

		let minDistance = 10000
		let selectedOctave = 0
		for (let octave = -1; octave <= 7; octave++)
		{
			const dist = Math.abs(this.insertionPitch - (pitch + octave * 12))
			if (dist < minDistance)
			{
				minDistance = dist
				selectedOctave = octave
			}
		}
		
		const finalPitch = selectedOctave * 12 + pitch
		
		const time = this.cursorTime.start.min(this.cursorTime.end)
		const duration = this.insertionDuration
		
		const id = this.song.nextId
		this.song = this.song
			.upsertNote(new Note(Range.fromStartDuration(time, duration), finalPitch))
			.withRefreshedRange()
		
		this.cursorTime = Range.fromPoint(time.add(duration))
		this.cursorTrack = { start: 1, end: 1 }
		this.cursorShow = false
		this.scrollTimeIntoView(this.cursorTime.start)
		
		this.selectionClear()
		this.selection.add(id)
		
		this.insertionPitch = finalPitch
		
		this.curSanitizationMode = "input"
		this.sanitizeSelection()
		
		this.playNoteSample(finalPitch)
		this.toolboxRefreshFn()
		this.draw()
	}
	
	
	insertChordAtCursor(chord)
	{
		const time = this.cursorTime.start.min(this.cursorTime.end)
		const duration = this.insertionDuration
		
		const id = this.song.nextId
		this.song = this.song
			.upsertChord(new SongChord(Range.fromStartDuration(time, duration), chord))
			.withRefreshedRange()
			
		this.cursorTime = Range.fromPoint(time.add(duration))
		this.cursorTrack = { start: 2, end: 2 }
		this.cursorShow = false
		this.scrollTimeIntoView(this.cursorTime.start)
		
		this.selectionClear()
		this.selection.add(id)
		
		this.curSanitizationMode = "input"
		this.sanitizeSelection()
		
		this.playChordSample(chord)
		this.toolboxRefreshFn()
		this.draw()
	}
	
	
	scrollTimeIntoView(time)
	{
		if (time.compare(this.screenRange.end.subtract(this.timeSnap.multiply(this.cursorEdgeScrollThreshold))) > 0)
			this.timeScroll = time.subtract(this.screenRange.duration).subtract(this.timeSnap).asFloat() + this.timeSnap.asFloat() * this.cursorEdgeScrollSpeed
			
		else if (time.compare(this.screenRange.start.add(this.timeSnap.multiply(this.cursorEdgeScrollThreshold))) < 0)
			this.timeScroll = time.asFloat() - this.timeSnap.asFloat() * this.cursorEdgeScrollSpeed
	}
	
	
	scrollPlaybackIntoView(time)
	{
		const margin = this.timeSnap.multiply(new Rational(16))
		
		if (time.compare(this.screenRange.end.subtract(margin)) > 0)
			this.timeScroll = time.subtract(margin).asFloat()
			
		else if (time.compare(this.screenRange.start.add(margin)) < 0)
			this.timeScroll = time.subtract(margin).asFloat()
	}
	
	
	*enumerateTracksUnderCursor()
	{
		const trackMin = Math.min(this.cursorTrack.start, this.cursorTrack.end)
		const trackMax = Math.max(this.cursorTrack.start, this.cursorTrack.end)
		
		if (trackMin >= 0 && trackMax >= 0)
			for (let t = trackMin; t <= trackMax; t++)
				yield this.tracks[t]
	}
	
	
	sanitizeSelection(ignore = null)
	{
		if (this.curSanitizationMode == "ok")
			return
		
		if (this.curSanitizationMode == ignore &&
			this.curSanitizationSelectionSize == this.selection.size)
			return
		 
		this.curSanitizationMode = "ok"
		this.curSanitizationSelectionSize = this.selection.size
		
		for (const track of this.tracks)
			track.sanitizeSelection()
		
		this.song = this.song.withRefreshedRange()
	}
	
	
	selectionClear()
	{
		this.sanitizeSelection()
		this.selection.clear()
	}
	
	
	selectUnderCursor()
	{
		this.selectionClear()
		
		if (this.cursorTime.start.compare(this.cursorTime.end) == 0)
			return
		
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
		return Rational.fromFloat(xOffset, snap.denominator)
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
		
		this.sanitizeSelection("mouse")
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
					this.scrollTimeIntoView(anchorPoint)
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
		
		this.sanitizeSelection("mouse")
		this.toolboxRefreshFn()
		this.draw()
	}
	
	
	onMouseMove(ev)
	{
		if (this.mouseDown)
			ev.preventDefault()
		
		const mousePosPrev = this.mousePos
		this.mousePos = this.getMousePos(ev)
		this.mouseTime = this.getTimeAtPos(this.mousePos)
		this.mouseTrack = this.tracks.findIndex(track => track.area.contains(this.mousePos))
		
		const edgeAutoScroll = () =>
		{
			if (this.mousePos.x > this.width - this.mouseEdgeScrollThreshold)// && this.mousePos.x > mousePosPrev.x)
				this.timeScroll += this.timeSnap.asFloat() * this.mouseEdgeScrollSpeed
			else if (this.mousePos.x < this.mouseEdgeScrollThreshold)// && this.mousePos.x < mousePosPrev.x)
				this.timeScroll -= this.timeSnap.asFloat() * this.mouseEdgeScrollSpeed
		}
		
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
				edgeAutoScroll()
			}
			else
			{
				this.curSanitizationMode = "mouse"
				for (const track of this.tracks)
					track.onDrag({ x: this.mousePos.x - track.area.x, y: this.mousePos.y - track.area.y })
				
				edgeAutoScroll()
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
		else if (this.mouseHoverAction & (Editor.ACTION_DRAG_TIME | Editor.ACTION_DRAG_PITCH))
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
		ev.preventDefault()
		
		if (Math.abs(ev.deltaX) > 0)
		{
			this.timeScroll += 0.01 / (this.timeScale / 100) * ev.deltaX
			this.wheelDate = new Date()
		}
		else if (new Date().getTime() - this.wheelDate.getTime() > 250)
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
		}
		
		this.draw()
	}
	
	
	onKeyDown(ev)
	{
		this.sanitizeSelection("keyboard")
		
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
				
				const offset = (key == "arrowright" ? this.timeSnap : this.timeSnap.negate()).multiply(new Rational(ev.ctrlKey ? 16 : 1))
				
				if (ev.shiftKey)
				{
					this.cursorTime = new Range(this.cursorTime.start, this.cursorTime.end.add(offset), false, false)
					this.selectUnderCursor()
					this.scrollTimeIntoView(this.cursorTime.end)
					handled = true
				}
				else if (selectionEmpty)
				{
					const start  = (key == "arrowright" ? this.cursorTime.max() : this.cursorTime.min())
					this.cursorTime = Range.fromPoint(start.add(offset), false, false)
					this.cursorTrack = { start: this.cursorTrack.end, end: this.cursorTrack.end }
					this.scrollTimeIntoView(this.cursorTime.start)
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
			case " ":
			{
				this.setPlayback(!this.playing)
				handled = true
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
				this.scrollTimeIntoView(this.cursorTime.max())
				this.cursorShow = true
				handled = true
				break
			}
			case "backspace":
			{
				if (!this.cursorShow)
					break
				
				if (this.cursorTime.start.compare(this.cursorTime.end) != 0)
				{
					for (const track of this.enumerateTracksUnderCursor())
						track.deleteRange(new Range(this.cursorTime.min(), this.cursorTime.max(), true, true))
					
					this.cursorTime = Range.fromPoint(this.cursorTime.min(), false, false)
					this.scrollTimeIntoView(this.cursorTime.start)
					handled = true
				}
				else
				{				
					let anchorPoint = null
					for (const track of this.enumerateTracksUnderCursor())
						anchorPoint = Rational.max(anchorPoint, track.getPreviousDeletionAnchor(this.cursorTime.min()))
					
					if (anchorPoint != null)
					{
						for (const track of this.enumerateTracksUnderCursor())
							track.deleteRange(new Range(anchorPoint, this.cursorTime.min(), true, true))
						
						this.cursorTime = Range.fromPoint(anchorPoint, false, false)
						this.scrollTimeIntoView(anchorPoint)
						handled = true
					}
				}
				break
			}
		}
		
		const handledHere = handled
		
		this.sanitizeSelection("keyboard")
		if (!handled)
		{
			this.curSanitizationMode = "keyboard"
			for (const track of this.tracks)
				handled |= track.onKeyDown(ev)
		}
		
		if (handled)
		{
			switch (key)
			{
				case "arrowright":
				case "arrowleft":
				{
					if (this.cursorShow)
						break
					
					const newSelectionRange = this.getSelectionRange()
					if (newSelectionRange != null)
					{
						this.cursorTime = Range.fromPoint(newSelectionRange.max(), false, false)
						this.scrollTimeIntoView(key == "arrowleft" && !ev.ctrlKey ? newSelectionRange.min() : newSelectionRange.max())
					}
					
					break
				}
				case "delete":
				case "backspace":
				{
					if (key == "backspace" && handledHere)
						break
					
					if (this.keyDownData.stretchRange != null)
					{
						this.cursorTime = Range.fromPoint(this.keyDownData.stretchRange.min(), false, false)
						this.scrollTimeIntoView(this.cursorTime.start)
					}
					
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
		
		const songStartX = (this.song.range.start.asFloat() - this.timeScroll) * this.timeScale
		const songEndX   = (this.song.range.end  .asFloat() - this.timeScroll) * this.timeScale
		
		this.ctx.fillStyle = "#383838"
		if (songStartX > 0)
			this.ctx.fillRect(0, 0, songStartX, this.height)
		if (songEndX < this.width)
			this.ctx.fillRect(songEndX, 0, this.width - songEndX, this.height)
		
		this.screenRange = new Range(this.getTimeAtPos({ x: 0, y: 0 }), this.getTimeAtPos({ x: this.width, y: 0 }).add(this.timeSnap))
		this.playbackTimeRational = Rational.fromFloat(this.playbackTime, 64)
		
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
		
		if (this.cursorShow && !this.playing)
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
		
		if (this.cursorShow && !this.playing)
		{
			this.drawCursorBeam(this.cursorTime.min(), true)
			this.drawCursorBeam(this.cursorTime.max(), false)
		}
		
		if (this.playing)
			this.drawPlaybackBeam(this.playbackTime)
		
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
	
	
	drawPlaybackBeam(time)
	{
		const trackMin = 0
		const trackMax = this.tracks.length - 1
		
		this.ctx.save()
		
		const offset = time - this.timeScroll
		const x = offset * this.timeScale
		
		this.ctx.strokeStyle = "#f00"
		this.ctx.lineCap = "round"
		this.ctx.lineWidth = 3
		
		this.ctx.beginPath()
		this.ctx.moveTo(this.tracks[trackMin].area.x + x, this.tracks[trackMin].area.y)
		this.ctx.lineTo(this.tracks[trackMax].area.x + x, this.tracks[trackMax].area.y + this.tracks[trackMax].area.h)
		this.ctx.stroke()
		
		this.ctx.restore()
	}
}