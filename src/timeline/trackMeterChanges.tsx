import React from "react"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Timeline from "./index"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"


export class TimelineTrackMeterChanges extends Timeline.TimelineTrack
{
    pencil: null |
    {
        time: Rational
    }


    constructor(projectTrackId: Project.ID, name: string, h: number)
    {
        super()
        this.projectTrackId = this.parentId = projectTrackId
        this.name = name
        this.renderRect = new Rect(0, 0, 0, h)
        this.acceptedElemTypes.add("meterChange")
        this.pencil = null
    }


    *iterAtRange(
        data: Timeline.WorkData,
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
        data: Timeline.WorkData,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        for (const elem of this.iterAtRange(data, range))
            yield elem.id
    }
	
	
	hover(data: Timeline.WorkData)
	{
        const pos = data.state.mouse.point.trackPos

        const checkRange = Timeline.timeRangeAtX(
            data,
            pos.x - Timeline.MARKER_WIDTH,
            pos.x + Timeline.MARKER_WIDTH)

        for (const elem of this.iterAtRange(data, checkRange))
        {
            const rect = this.markerRectAtTime(data, elem.range.start)
            if (rect.contains(pos))
            {
                data.state.hover =
                {
                    id: elem.id,
                    range: elem.range,
                    action: Timeline.MouseAction.DragTime,
                }
            }
        }
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
            time: time,
        }
    }


    pencilDrag(data: Timeline.WorkData)
    {
		if (this.pencil)
		{
            this.pencil.time = data.state.mouse.point.time
        }
    }
	
	
	pencilComplete(data: Timeline.WorkData)
	{
		if (this.pencil)
		{
            const elem = Project.makeMeterChange(
                this.projectTrackId,
                this.pencil.time,
                Project.defaultMeter())

            let project = data.projectCtx.ref.current.project
            const id = project.nextId
            data.projectCtx.ref.current.project = Project.upsertElement(project, elem)
            Timeline.selectionAdd(data, id)
		}
	}


    render(data: Timeline.WorkData)
    {
        const visibleRange = Timeline.visibleTimeRange(data)
        const activeMeterAtStart = Project.meterAt(data.project, this.projectTrackId, visibleRange.start)

        let suppressStickyLabel = false
        for (let layer = 0; layer < 2; layer++)
        {
            for (const meterCh of this.iterAtRange(data, visibleRange))
            {
                const selected = data.state.selection.contains(meterCh.id)
                if ((layer == 0) == selected)
                    continue

                if (meterCh.type != "meterChange")
                    continue
            
                const hovering = !!data.state.hover && data.state.hover.id == meterCh.id
                this.renderMarker(
                    data, meterCh.range.start,
                    data.prefs.editor.meterChangeColor,
                    meterCh.meter.str,
                    hovering, selected)
                
                const x = Timeline.xAtTime(data, meterCh.range.start)
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