import React from "react"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"
import * as Editor from "./index"
import { EditorTrack } from "./track"


export class EditorTrackNoteBlocks extends EditorTrack
{
    pencil: null |
    {
        time1: Rational
        time2: Rational
    }


    constructor(projectTrackId: Project.ID, h: number)
    {
        super()
        this.projectTrackId = projectTrackId
        this.renderRect = new Rect(0, 0, 0, h)
        this.pencil = null
    }


    *iterAtRange(
        data: Editor.EditorUpdateData,
        range: Range)
        : Generator<Project.NoteBlock, void, void>
    {
        const trackElems = data.project.lists.get(this.projectTrackId)
        if (!trackElems)
            return

        for (const noteBlock of trackElems.iterAtRange(range))
            yield noteBlock as Project.NoteBlock
    }


    *elemsAtRegion(
        data: Editor.EditorUpdateData,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        for (const note of this.iterAtRange(data, range))
            yield note.id
    }


    contextMenu(data: Editor.EditorUpdateData)
    {
        return <>
            <Popup.Button label="Change duration"/>
            <Popup.Button label="Change pitch"/>
        </>
    }
	
	
	hover(data: Editor.EditorUpdateData)
	{
        const pos = data.state.mouse.point.trackPos

        const margin = 10
        const checkRange = Editor.timeRangeAtX(data, pos.x - margin, pos.x + margin)

        let hoverDrag = null
        let hoverStretch = null
        
        for (const noteBlock of this.iterAtRange(data, checkRange))
        {
            const margin = 8

            const x1 = Editor.xAtTime(data, noteBlock.range.start)
            const x2 = Editor.xAtTime(data, noteBlock.range.end)

            const rectDrag = new Rect(
                x1,
                0,
                x2 - x1,
                this.renderRect.h)

            const rectStretch = new Rect(
                x1 - margin,
                0,
                x2 - x1 + margin * 2,
                this.renderRect.h)

            if (rectDrag.contains(pos))
            {
                hoverDrag =
                {
                    id: noteBlock.id,
                    range: noteBlock.range,
                    action: Editor.EditorAction.DragTime,
                }
            }
            else if (rectStretch.contains(pos))
            {
                hoverStretch =
                {
                    id: noteBlock.id,
                    range: noteBlock.range,
                    action: pos.x < (x1 + x2) / 2 ?
                        Editor.EditorAction.StretchTimeStart :
                        Editor.EditorAction.StretchTimeEnd
                }
            }
        }

        data.state.hover = hoverDrag ?? hoverStretch
    }


    pencilClear(data: Editor.EditorUpdateData)
    {
        this.pencil = null
    }


    pencilHover(data: Editor.EditorUpdateData)
    {
        const time = data.state.mouse.point.time

        this.pencil =
        {
            time1: time,
            time2: time.add(data.state.timeSnap.multiply(new Rational(4))),
        }
    }


    pencilDrag(data: Editor.EditorUpdateData)
    {
		if (this.pencil)
		{
            this.pencil.time2 = data.state.mouse.point.time
            
            const time1X = Editor.xAtTime(data, this.pencil.time1)
            const time2X = Editor.xAtTime(data, this.pencil.time2)
			if (Math.abs(time1X - time2X) < 5)
                this.pencil.time2 = this.pencil.time1.add(data.state.timeSnap.multiply(new Rational(4)))
        }
    }
	
	
	pencilComplete(data: Editor.EditorUpdateData)
	{
		if (this.pencil)
		{
            const elem = Project.makeNoteBlock(
                this.projectTrackId,
                new Range(this.pencil.time1, this.pencil.time2).sorted())

            const id = data.project.nextId
            data.project = Project.Root.upsertElement(data.project, elem)
            Editor.selectionAdd(data, id)
		}
	}


    render(data: Editor.EditorUpdateData)
    {
        const visibleRange = Editor.visibleTimeRange(data)

		for (const noteBlock of this.iterAtRange(data, visibleRange))
		{
            const selected = data.state.selection.contains(noteBlock.id)
            if (selected)
                continue
            
			const hovering = !!data.state.hover && data.state.hover.id == noteBlock.id
			const playing = false//data.state.playback.playing && note.range.overlapsPoint(state.appState.playback.time)
			this.renderNoteBlock(data, noteBlock.range, hovering, selected, playing)
        }

		for (const noteBlock of this.iterAtRange(data, visibleRange))
		{
			const selected = data.state.selection.contains(noteBlock.id)
            if (!selected)
                continue
            
			const hovering = !!data.state.hover && data.state.hover.id == noteBlock.id
			const playing = false//data.state.playback.playing && note.range.overlapsPoint(state.appState.playback.time)
			this.renderNoteBlock(data, noteBlock.range, hovering, selected, playing)
        }

        if (this.pencil)
        {
            data.ctx.save()
            data.ctx.globalAlpha = 0.4

            const range = new Range(this.pencil.time1, this.pencil.time2).sorted()
            this.renderNoteBlock(data, range, false, false, false)
            
            data.ctx.restore()
        }
    }


    renderNoteBlock(
        data: Editor.EditorUpdateData,
        range: Range,
        hovering: boolean,
        selected: boolean,
        playing: boolean)
    {
        const x1 = Editor.xAtTime(data, range.start) + 0.5
        const x2 = Editor.xAtTime(data, range.end) + 0.5 - 1

        const y1 = 0
        const y2 = this.renderRect.h

		data.ctx.fillStyle = (selected || playing) ? "#222" : "#000"
        data.ctx.fillRect(x1, y1, x2 - x1, y2 - y1)
		
        data.ctx.strokeStyle = (selected || playing) ? "#fff" : hovering ? "#888" : "#444"
        data.ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
    }
}