import { Song, Note } from "../song/song.js"
import { EditorNotes } from "./editorNotes.js"
import { Rational } from "../util/rational.js"
import { Range } from "../util/range.js"
import { Rect } from "../util/rect.js"


export class Editor
{
	static ACTION_SELECTION_TIME     = 0x01
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
			.upsertNote(new Note(new Range(new Rational(0, 4), new Rational(1, 4)), 0))
			.upsertNote(new Note(new Range(new Rational(1, 4), new Rational(2, 4)), 1))
			.upsertNote(new Note(new Range(new Rational(2, 4), new Rational(3, 4)), 2))
			.upsertNote(new Note(new Range(new Rational(3, 4), new Rational(4, 4)), 3))
		
		this.timeScale = 200
		this.timeScroll = 0
		
		this.selection = new Set()
		
		this.tracks = []
		this.tracks.push(new EditorNotes(this))
		this.refreshLayout()
		
		this.cursorTime = new Range(new Rational(0), new Rational(0))
		this.cursorShow = true
		
		this.mouseDown = false
		this.mouseDownData = { pos: { x: -1, y: -1 }, time: new Rational(0) }
		this.mousePos = { x: -1, y: -1 }
		this.mouseTime = new Rational(0)
		this.mouseHoverAction = 0
		this.mouseDownAction = 0
		
		canvas.onmousedown = (ev) => this.onMouseDown(ev)
		window.onmousemove = (ev) => this.onMouseMove(ev)
		window.onmouseup   = (ev) => this.onMouseUp  (ev)
	}
	
	
	setSong(song)
	{
		this.song = song
	}
	
	
	refreshLayout()
	{
		this.tracks[0].area = new Rect(50, 50, this.width - 100, this.height - 100)
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
		const xOffset = (pos.x - this.tracks[0].area.x) / this.timeScale
		return Rational.fromFloat(xOffset, new Rational(1, 16))
	}
	
	
	onMouseDown(ev)
	{
		ev.preventDefault()
		
		if (this.mouseDown)
			return
		
		this.mouseDown = true
		this.mousePos = this.getMousePos(ev)
		this.mouseTime = this.getTimeAtPos(this.mousePos)
		this.mouseDownData = { pos: this.mousePos, time: this.mouseTime }
		this.mouseDownAction = 0
		
		const hoveringSelected = this.tracks.reduce((accum, track) => accum || track.hasSelectedAt({ x: this.mousePos.x - track.area.x, y: this.mousePos.y - track.area.y }), false)
		
		if (!ev.ctrlKey && !hoveringSelected)
			this.selectionClear()
			
		for (const track of this.tracks)
			track.onMouseDown(ev, true, { x: this.mousePos.x - track.area.x, y: this.mousePos.y - track.area.y })
		
		if (this.mouseDownAction == Editor.ACTION_SELECTION_TIME)
		{
			this.cursorShow = true
			this.cursorTime = new Range(this.mouseTime, this.mouseTime, false, false)
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
				
				console.log(this.mouseDownData.stretchRange)
				
				if (this.mouseDownData.stretchRange == null)
					this.mouseDownAction = 0
			}
		}
		
		this.draw()
	}
	
	
	onMouseMove(ev)
	{
		ev.preventDefault()
		
		this.mousePos = this.getMousePos(ev)
		this.mouseTime = this.getTimeAtPos(this.mousePos)
		
		if (this.mouseDown)
		{
			if (this.mouseDownAction == Editor.ACTION_SELECTION_TIME)
			{
				this.cursorTime = new Range(this.cursorTime.start, this.mouseTime, false, false)
				
				this.selectionClear()
				for (const track of this.tracks)
					track.onSelectRange(this.cursorTime.sorted())
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
				track.onMouseMove(ev, this.mouseDown, { x: this.mousePos.x - track.area.x, y: this.mousePos.y - track.area.y })
		}
		
		if (this.mouseHoverAction & (Editor.ACTION_DRAG_TIME | Editor.ACTION_DRAG_TIME))
			this.canvas.style.cursor = "move"
		else if (this.mouseHoverAction & (Editor.ACTION_STRETCH_TIME_START | Editor.ACTION_STRETCH_TIME_END))
			this.canvas.style.cursor = "col-resize"
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
		
		this.ctx.fillStyle = "#eee"
		this.ctx.fillRect(0, 0, this.width, this.height)
		
		for (const track of this.tracks)
		{
			this.ctx.save()
			this.ctx.translate(track.area.x, track.area.y)
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
		this.ctx.save()
		
		const offset = time.asFloat() - this.timeScroll
		const x = offset * this.timeScale
		
		this.ctx.strokeStyle = "#0af"
		this.ctx.lineCap = "round"
		this.ctx.lineWidth = 3
		
		this.ctx.beginPath()
		this.ctx.moveTo(this.tracks[0].area.x + x, this.tracks[0].area.y)
		this.ctx.lineTo(this.tracks[0].area.x + x, this.tracks[0].area.y + this.tracks[0].area.h)
		this.ctx.stroke()
		
		this.ctx.restore()
	}
}