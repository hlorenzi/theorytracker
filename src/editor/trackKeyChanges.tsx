import React from "react"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Editor from "./index"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"
import { EditorTrack } from "./track"


export class EditorTrackKeyChanges extends EditorTrack
{
    pencil: null |
    {
        time: Rational
    }


    constructor(projectTrackId: Project.ID, name: string, h: number)
    {
        super()
        this.projectTrackId = projectTrackId
        this.name = name
        this.renderRect = new Rect(0, 0, 0, h)
        this.acceptedElemTypes.add(Project.ElementType.KeyChange)
        this.pencil = null
    }


    *iterAtRange(
        data: Editor.EditorUpdateData,
        range: Range)
        : Generator<Project.KeyChange, void, void>
    {
        const trackElems = data.project.lists.get(this.projectTrackId)
        if (!trackElems)
            return

        for (const elem of trackElems.iterAtRange(range))
            yield elem as Project.KeyChange
    }


    *elemsAtRegion(
        data: Editor.EditorUpdateData,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        for (const elem of this.iterAtRange(data, range))
            yield elem.id
    }
	
	
	hover(data: Editor.EditorUpdateData)
	{
        const pos = data.state.mouse.point.trackPos

        const checkRange = Editor.timeRangeAtX(
            data,
            pos.x - Editor.MARKER_WIDTH,
            pos.x + Editor.MARKER_WIDTH)

        for (const elem of this.iterAtRange(data, checkRange))
        {
            const rect = this.markerRectAtTime(data, elem.range.start)
            if (rect.contains(pos))
            {
                data.state.hover =
                {
                    id: elem.id,
                    range: elem.range,
                    action: Editor.EditorAction.DragTime,
                }
            }
        }
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
            time: time,
        }
    }


    pencilDrag(data: Editor.EditorUpdateData)
    {
		if (this.pencil)
		{
            this.pencil.time = data.state.mouse.point.time
        }
    }
	
	
	pencilComplete(data: Editor.EditorUpdateData)
	{
		if (this.pencil)
		{
            const elem = Project.makeKeyChange(
                this.projectTrackId,
                this.pencil.time,
                Editor.defaultKey())

            const id = data.project.nextId
            data.project = Project.upsertElement(data.project, elem)
            Editor.selectionAdd(data, id)
		}
	}


    render(data: Editor.EditorUpdateData)
    {
        const visibleRange = Editor.visibleTimeRange(data)

		for (const elem of this.iterAtRange(data, visibleRange))
		{
            const selected = data.state.selection.contains(elem.id)
            if (selected)
                continue
            
			const hovering = !!data.state.hover && data.state.hover.id == elem.id
			const playing = false//data.state.playback.playing && note.range.overlapsPoint(state.appState.playback.time)
			this.renderMarker(
                data, elem.range.start,
                data.prefs.editor.keyChangeColor,
                elem.key.str,
                hovering, selected, playing)
        }

		for (const elem of this.iterAtRange(data, visibleRange))
		{
			const selected = data.state.selection.contains(elem.id)
            if (!selected)
                continue
            
			const hovering = !!data.state.hover && data.state.hover.id == elem.id
			const playing = false//data.state.playback.playing && note.range.overlapsPoint(state.appState.playback.time)
			this.renderMarker(
                data, elem.range.start,
                data.prefs.editor.keyChangeColor,
                elem.key.str,
                hovering, selected, playing)
        }

        if (this.pencil)
        {
            data.ctx.save()
            data.ctx.globalAlpha = 0.4

            this.renderMarker(
                data, this.pencil.time,
                data.prefs.editor.keyChangeColor,
                null,
                false, false, false)
            
            data.ctx.restore()
        }
    }
}