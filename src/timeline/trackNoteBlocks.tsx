import React from "react"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Playback from "../playback"
import * as Timeline from "./index"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"


export class TimelineTrackNoteBlocks extends Timeline.TimelineTrack
{
    pencil: null |
    {
        time1: Rational
        time2: Rational
    }


    constructor(projectTrackId: Project.ID, name: string, h: number)
    {
        super()
        this.projectTrackId = this.parentId = projectTrackId
        this.name = name
        this.renderRect = new Rect(0, 0, 0, h)
        this.acceptedElemTypes.add("noteBlock")
        this.pencil = null
    }


    *iterNoteBlocksAtRange(
        state: Timeline.State,
        range: Range)
        : Generator<Project.NoteBlock, void, void>
    {
        const trackElems = Project.global.project.lists.get(this.projectTrackId)
        if (!trackElems)
            return

        for (const elem of trackElems.iterAtRange(range))
            yield elem as Project.NoteBlock
    }


    *iterNotesAtNoteBlock(
        state: Timeline.State,
        noteBlock: Project.NoteBlock,
        range: Range)
        : Generator<Project.Note, void, void>
    {
        const list = Project.global.project.lists.get(noteBlock.id)
        if (!list)
            return

        for (const elem of list.iterAtRange(range))
            yield elem as Project.Note
    }


    *elemsAtRegion(
        state: Timeline.State,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        for (const note of this.iterNoteBlocksAtRange(state, range))
            yield note.id
    }
	
	
	hover(state: Timeline.State)
	{
        this.hoverBlockElements(state, (range) => this.iterNoteBlocksAtRange(state, range))
    }


    doubleClick(state: Timeline.State, elemId: Project.ID)
    {
        const elem = Project.global.project.elems.get(elemId)
        if (!elem || elem.type != "noteBlock")
            return
        
        Timeline.modeStackPush(state)
        state.mode = Timeline.Mode.NoteBlock
        state.modeNoteBlockId = elemId
        Timeline.refreshTracks(state)
    }


    pencilClear(state: Timeline.State)
    {
        this.pencil = null
    }


    pencilHover(state: Timeline.State)
    {
        const time = state.mouse.point.time

        this.pencil =
        {
            time1: time,
            time2: time.add(state.timeSnap.multiply(new Rational(4))),
        }
    }


    pencilDrag(state: Timeline.State)
    {
		if (this.pencil)
		{
            this.pencil.time2 = state.mouse.point.time
            
            const time1X = Timeline.xAtTime(state, this.pencil.time1)
            const time2X = Timeline.xAtTime(state, this.pencil.time2)
			if (Math.abs(time1X - time2X) < 5)
                this.pencil.time2 = this.pencil.time1.add(state.timeSnap.multiply(new Rational(4)))
        }
    }
	
	
	pencilComplete(state: Timeline.State)
	{
		if (this.pencil)
		{
            const elem = Project.makeNoteBlock(
                this.projectTrackId,
                new Range(this.pencil.time1, this.pencil.time2).sorted())

            let project = Project.global.project
            const id = project.nextId
            Project.global.project = Project.upsertElement(project, elem)
            Timeline.selectionAdd(state, id)
		}
	}


    render(state: Timeline.State, canvas: CanvasRenderingContext2D)
    {
        const visibleRange = Timeline.visibleTimeRange(state)

        for (let layer = 0; layer < 2; layer++)
        {
            for (const noteBlock of this.iterNoteBlocksAtRange(state, visibleRange))
            {
                const selected = state.selection.contains(noteBlock.id)
                if ((layer == 0) == selected)
                    continue
                
                const hovering = !!state.hover && state.hover.id == noteBlock.id
                const playing = Playback.global.playing && noteBlock.range.overlapsPoint(Playback.global.playTime)
                
                this.renderNoteBlock(
                    state, canvas, noteBlock.range,
                    this.iterNotesAtNoteBlock(state, noteBlock, visibleRange.displace(noteBlock.range.start.negate())),
                    hovering, selected, playing)
            }
        }

        if (this.pencil)
        {
            canvas.save()
            canvas.globalAlpha = 0.4

            const range = new Range(this.pencil.time1, this.pencil.time2).sorted()
            this.renderNoteBlock(state, canvas, range, null, false, false, false)
            
            canvas.restore()
        }
    }


    renderNoteBlock(
        state: Timeline.State,
        canvas: CanvasRenderingContext2D,
        range: Range,
        notes: Generator<Project.Note, void, void> | null,
        hovering: boolean,
        selected: boolean,
        playing: boolean)
    {
        const x1 = Math.floor(Timeline.xAtTime(state, range.start)) + 0.5
        const x2 = Math.floor(Timeline.xAtTime(state, range.end)) + 0.5 - 1

        const y1 = 1.5
        const y2 = this.renderRect.h - 0.5

		canvas.fillStyle = (selected || playing) ? "#222" : "#000"
        canvas.fillRect(x1, y1, x2 - x1, y2 - y1)

        if (notes)
        {
            canvas.fillStyle = "#fff"
            for (const note of notes)
            {
                const noteH = 2
                const noteSpacing = 1

                const noteRange = note.range.displace(range.start)
                const noteY = this.renderRect.h / 2 + (60 - note.midiPitch) * noteSpacing
                const noteY1 = noteY - noteH / 2
                const noteY2 = noteY + noteH / 2

                const noteX1 = Math.max(x1, Math.min(x2,
                    Timeline.xAtTime(state, noteRange.start) + 0.5))

                const noteX2 = Math.max(x1, Math.min(x2,
                    Timeline.xAtTime(state, noteRange.end) + 0.5))
        
                canvas.fillRect(noteX1, noteY1, noteX2 - noteX1, noteY2 - noteY1)
            }
        }
		
        canvas.strokeStyle = (selected || playing) ? "#fff" : hovering ? "#888" : "#444"
        canvas.strokeRect(x1, y1, x2 - x1, y2 - y1)
    }
}