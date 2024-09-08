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
        state: Timeline.State,
        range: Range)
        : Generator<Project.MeterChange, void, void>
    {
        const trackElems = Project.global.project.lists.get(this.projectTrackId)
        if (!trackElems)
            return

        for (const elem of trackElems.iterAtRange(range))
            yield elem as Project.MeterChange
    }


    *elemsAtRegion(
        state: Timeline.State,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        for (const elem of this.iterAtRange(state, range))
            yield elem.id
    }
	
	
	hover(state: Timeline.State)
	{
        const pos = state.mouse.point.trackPos

        const checkRange = Timeline.timeRangeAtX(
            state,
            pos.x - Timeline.MARKER_WIDTH,
            pos.x + Timeline.MARKER_WIDTH)

        for (const elem of this.iterAtRange(state, checkRange))
        {
            const rect = this.markerRectAtTime(state, elem.range.start)
            if (rect.contains(pos))
            {
                state.hover =
                {
                    id: elem.id,
                    range: elem.range,
                    action: Timeline.MouseAction.DragTime,
                }
            }
        }
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
            time: time,
        }
    }


    pencilDrag(state: Timeline.State)
    {
		if (this.pencil)
		{
            this.pencil.time = state.mouse.point.time
        }
    }
	
	
	pencilComplete(state: Timeline.State)
	{
		if (this.pencil)
		{
            const elem = Project.makeMeterChange(
                this.projectTrackId,
                this.pencil.time,
                Project.defaultMeter())

            let project = Project.global.project
            const id = project.nextId
            Project.global.project = Project.upsertElement(project, elem)
            Timeline.selectionAdd(state, id)
		}
	}


    render(state: Timeline.State, canvas: CanvasRenderingContext2D)
    {
        const visibleRange = Timeline.visibleTimeRange(state)
        const activeMeterAtStart = Project.meterAt(Project.global.project, this.projectTrackId, visibleRange.start)

        let suppressStickyLabel = false
        for (let layer = 0; layer < 2; layer++)
        {
            for (const meterCh of this.iterAtRange(state, visibleRange))
            {
                const selected = state.selection.contains(meterCh.id)
                if ((layer == 0) == selected)
                    continue

                if (meterCh.type != "meterChange")
                    continue
            
                const hovering = !!state.hover && state.hover.id == meterCh.id
                this.renderMarker(
                    state, canvas, meterCh.range.start,
                    Prefs.global.editor.meterChangeColor,
                    meterCh.meter.str,
                    hovering, selected)
                
                const x = Timeline.xAtTime(state, meterCh.range.start)
                if (x > state.trackHeaderW && x < state.trackHeaderW + 100)
                    suppressStickyLabel = true
            }
        }

        if (!suppressStickyLabel)
        {
            this.renderMarkerLabel(
                state, canvas,
                state.trackHeaderW + 5,
                Prefs.global.editor.meterChangeColor,
                activeMeterAtStart.str)
        }

        if (this.pencil)
        {
            canvas.save()
            canvas.globalAlpha = 0.4

            this.renderMarker(
                state, canvas, this.pencil.time,
                Prefs.global.editor.meterChangeColor,
                null,
                false, false)
            
            canvas.restore()
        }
    }
}