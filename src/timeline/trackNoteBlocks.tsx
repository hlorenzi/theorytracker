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
        data: Timeline.WorkData,
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
        data: Timeline.WorkData,
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
        data: Timeline.WorkData,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        for (const note of this.iterNoteBlocksAtRange(data, range))
            yield note.id
    }
	
	
	hover(data: Timeline.WorkData)
	{
        this.hoverBlockElements(data, (range) => this.iterNoteBlocksAtRange(data, range))
    }


    doubleClick(data: Timeline.WorkData, elemId: Project.ID)
    {
        const elem = Project.global.project.elems.get(elemId)
        if (!elem || elem.type != "noteBlock")
            return
        
        Timeline.modeStackPush(data)
        data.state.mode = Timeline.Mode.NoteBlock
        data.state.modeNoteBlockId = elemId
        Timeline.refreshTracks(data)
    }


    pencilClear(data: Timeline.WorkData)
    {
        this.pencil = null
    }


    pencilHover(data: Timeline.WorkData)
    {
        const time = data.state.mouse.point.time

        this.pencil =
        {
            time1: time,
            time2: time.add(data.state.timeSnap.multiply(new Rational(4))),
        }
    }


    pencilDrag(data: Timeline.WorkData)
    {
		if (this.pencil)
		{
            this.pencil.time2 = data.state.mouse.point.time
            
            const time1X = Timeline.xAtTime(data, this.pencil.time1)
            const time2X = Timeline.xAtTime(data, this.pencil.time2)
			if (Math.abs(time1X - time2X) < 5)
                this.pencil.time2 = this.pencil.time1.add(data.state.timeSnap.multiply(new Rational(4)))
        }
    }
	
	
	pencilComplete(data: Timeline.WorkData)
	{
		if (this.pencil)
		{
            const elem = Project.makeNoteBlock(
                this.projectTrackId,
                new Range(this.pencil.time1, this.pencil.time2).sorted())

            let project = Project.global.project
            const id = project.nextId
            Project.global.project = Project.upsertElement(project, elem)
            Timeline.selectionAdd(data, id)
		}
	}


    render(data: Timeline.WorkData)
    {
        const visibleRange = Timeline.visibleTimeRange(data)

        for (let layer = 0; layer < 2; layer++)
        {
            for (const noteBlock of this.iterNoteBlocksAtRange(data, visibleRange))
            {
                const selected = data.state.selection.contains(noteBlock.id)
                if ((layer == 0) == selected)
                    continue
                
                const hovering = !!data.state.hover && data.state.hover.id == noteBlock.id
                const playing = Playback.global.playing && noteBlock.range.overlapsPoint(Playback.global.playTime)
                
                this.renderNoteBlock(
                    data, noteBlock.range,
                    this.iterNotesAtNoteBlock(data, noteBlock, visibleRange.displace(noteBlock.range.start.negate())),
                    hovering, selected, playing)
            }
        }

        if (this.pencil)
        {
            data.ctx.save()
            data.ctx.globalAlpha = 0.4

            const range = new Range(this.pencil.time1, this.pencil.time2).sorted()
            this.renderNoteBlock(data, range, null, false, false, false)
            
            data.ctx.restore()
        }
    }


    renderNoteBlock(
        data: Timeline.WorkData,
        range: Range,
        notes: Generator<Project.Note, void, void> | null,
        hovering: boolean,
        selected: boolean,
        playing: boolean)
    {
        const x1 = Math.floor(Timeline.xAtTime(data, range.start)) + 0.5
        const x2 = Math.floor(Timeline.xAtTime(data, range.end)) + 0.5 - 1

        const y1 = 1.5
        const y2 = this.renderRect.h - 0.5

		data.ctx.fillStyle = (selected || playing) ? "#222" : "#000"
        data.ctx.fillRect(x1, y1, x2 - x1, y2 - y1)

        if (notes)
        {
            data.ctx.fillStyle = "#fff"
            for (const note of notes)
            {
                const noteH = 2
                const noteSpacing = 1

                const noteRange = note.range.displace(range.start)
                const noteY = this.renderRect.h / 2 + (60 - note.midiPitch) * noteSpacing
                const noteY1 = noteY - noteH / 2
                const noteY2 = noteY + noteH / 2

                const noteX1 = Math.max(x1, Math.min(x2,
                    Timeline.xAtTime(data, noteRange.start) + 0.5))

                const noteX2 = Math.max(x1, Math.min(x2,
                    Timeline.xAtTime(data, noteRange.end) + 0.5))
        
                data.ctx.fillRect(noteX1, noteY1, noteX2 - noteX1, noteY2 - noteY1)
            }
        }
		
        data.ctx.strokeStyle = (selected || playing) ? "#fff" : hovering ? "#888" : "#444"
        data.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
    }
}