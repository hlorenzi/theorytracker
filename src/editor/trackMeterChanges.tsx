import React from "react"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Editor from "./index"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"
import { EditorTrack } from "./track"


export class EditorTrackMeterChanges extends EditorTrack
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
        this.acceptedElemTypes.add(Project.ElementType.MeterChange)
        this.pencil = null
    }


    *iterAtRange(
        data: Editor.EditorUpdateData,
        range: Range)
        : Generator<Project.MeterChange, void, void>
    {
        const trackElems = data.project.lists.get(this.projectTrackId)
        if (!trackElems)
            return

        for (const elem of trackElems.iterAtRange(range))
            yield elem as Project.MeterChange
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
            const elem = Project.makeMeterChange(
                this.projectTrackId,
                this.pencil.time,
                Editor.defaultMeter())

            const id = data.project.nextId
            data.project = Project.upsertElement(data.project, elem)
            Editor.selectionAdd(data, id)
		}
	}


    render(data: Editor.EditorUpdateData)
    {
        const visibleRange = Editor.visibleTimeRange(data)
        const activeMeterAtStart = Editor.meterAt(data, this.projectTrackId, visibleRange.start)

        let suppressStickyLabel = false
        for (let layer = 0; layer < 2; layer++)
        {
            for (const meterCh of this.iterAtRange(data, visibleRange))
            {
                const selected = data.state.selection.contains(meterCh.id)
                if ((layer == 0) == selected)
                    continue
            
                const hovering = !!data.state.hover && data.state.hover.id == meterCh.id
                this.renderMarker(
                    data, meterCh.range.start,
                    data.prefs.editor.meterChangeColor,
                    meterCh.meter.str,
                    hovering, selected)
                
                const x = Editor.xAtTime(data, meterCh.range.start)
                if (x > data.state.trackHeaderW && x < data.state.trackHeaderW + 100)
                    suppressStickyLabel = true
            }
        }

        if (!suppressStickyLabel)
        {
            this.renderMarkerLabel(
                data,
                data.state.trackHeaderW + 5,
                data.prefs.editor.meterChangeColor,
                activeMeterAtStart.str)
        }

        if (this.pencil)
        {
            data.ctx.save()
            data.ctx.globalAlpha = 0.4

            this.renderMarker(
                data, this.pencil.time,
                data.prefs.editor.meterChangeColor,
                null,
                false, false)
            
            data.ctx.restore()
        }
    }
}