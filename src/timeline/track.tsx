import React from "react"
import * as Timeline from "./index"
import * as Project from "../project"
import Rect from "../util/rect"
import Rational from "../util/rational"
import Range from "../util/range"


export const MARKER_WIDTH = 12


export class TimelineTrack
{
    projectTrackId: Project.ID
    parentId: Project.ID
    name: string
    renderRect: Rect
    acceptedElemTypes: Set<Project.Element["type"]>

    scrollEnabled: boolean
    yScroll: number
    
    noCursor: boolean
    pencil: any


    constructor()
    {
        this.projectTrackId = -1
        this.parentId = -1
        this.name = ""
        this.renderRect = new Rect(0, 0, 0, 0)
        this.acceptedElemTypes = new Set<Project.Element["type"]>()

        this.scrollEnabled = false
        this.yScroll = 0

        this.noCursor = false
        this.pencil = null
    }


    copyState(state: Timeline.State)
    {
        for (const track of state.tracks)
        {
            if (track.projectTrackId == this.projectTrackId)
            {
                this.yScroll = track.yScroll
                break
            }
        }
    }


    *elemsAtRegion(
        state: Timeline.State,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        
    }


    *iterKeyChangePairsAtRange(
        state: Timeline.State,
        range: Range)
        : Generator<[Project.KeyChange, Project.KeyChange, number, number], void, void>
    {
        const keyChangeTrackId = Project.keyChangeTrackId(Project.global.project)
        const keyChangeTrackTimedElems = Project.global.project.lists.get(keyChangeTrackId)
        if (!keyChangeTrackTimedElems)
            return

        const firstKeyCh = keyChangeTrackTimedElems.findFirst() as (Project.KeyChange | null)
        const defaultKey = firstKeyCh?.key ?? Project.defaultKey()
    
        for (const pair of keyChangeTrackTimedElems.iterActiveAtRangePairwise(range))
        {
            const keyCh1 = pair[0] ?? Project.makeKeyChange(-1, range.start, defaultKey)
            const keyCh2 = pair[1] ?? Project.makeKeyChange(-1, range.end,   defaultKey)
            
            const keyCh1X = Timeline.xAtTime(state, keyCh1.range.start)
            const keyCh2X = Timeline.xAtTime(state, keyCh2.range.start)
            
            yield [keyCh1 as Project.KeyChange, keyCh2 as Project.KeyChange, keyCh1X, keyCh2X]
        }
    }


    hover(state: Timeline.State)
    {
        
    }


    hoverBlockElements(
        state: Timeline.State,
        elemsIter: (range: Range) => Generator<Project.Element, void, void>)
    {
        const pos = state.mouse.point.trackPos

        const margin = 10
        const checkRange = Timeline.timeRangeAtX(state, pos.x - margin, pos.x + margin)

        let hoverDrag = null
        let hoverStretch = null
        
        for (const elem of elemsIter(checkRange))
        {
            const margin = 8

            const x1 = Timeline.xAtTime(state, elem.range.start)
            const x2 = Timeline.xAtTime(state, elem.range.end)

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
                    id: elem.id,
                    range: elem.range,
                    action: Timeline.MouseAction.DragTime,
                }
            }
            else if (rectStretch.contains(pos))
            {
                hoverStretch =
                {
                    id: elem.id,
                    range: elem.range,
                    action: pos.x < (x1 + x2) / 2 ?
                        Timeline.MouseAction.StretchTimeStart :
                        Timeline.MouseAction.StretchTimeEnd
                }
            }
        }

        state.hover = hoverDrag ?? hoverStretch
    }


    click(state: Timeline.State, elemId: Project.ID)
    {
        
    }


    doubleClick(state: Timeline.State, elemId: Project.ID)
    {
        
    }


    contextMenu(state: Timeline.State, elemId: Project.ID)
    {
        
    }


    pencilClear(state: Timeline.State)
    {
        
    }


    pencilHover(state: Timeline.State)
    {
        
    }


    pencilStart(state: Timeline.State)
    {
        
    }


    pencilDrag(state: Timeline.State)
    {
        
    }


    pencilComplete(state: Timeline.State)
    {
        
    }
	
	
	rowAtY(state: Timeline.State, y: number): number
	{
        return 0
	}
    
    
    findPreviousAnchor(state: Timeline.State, time: Rational): Rational
    {
        const list = Project.global.project.lists.get(this.parentId)
        if (!list)
            return Project.global.project.range.start
            
        const relTime = Project.getRelativeTime(
            Project.global.project,
            this.parentId,
            time)

        const anchor = list.findPreviousDeletionAnchor(relTime)
        if (!anchor)
            return Project.global.project.range.start

        return Project.getAbsoluteTime(
            Project.global.project,
            this.parentId,
            anchor)
    }
	
	
	deleteRange(state: Timeline.State, range: Range)
	{
        const list = Project.global.project.lists.get(this.parentId)
        if (!list)
            return

        const relRange = Project.getRelativeRange(
            Project.global.project,
            this.parentId,
            range)
    
        if (range.duration.isZero())
        {
            for (const elem of list.iterAtPoint(relRange.start))
            {
                const removeElem = Project.elemModify(elem, { parentId: -1 })
                Project.global.project = Project.upsertElement(Project.global.project, removeElem)
            }
        }
        else
        {
            for (const elem of list.iterAtRange(relRange))
            {
                Project.global.project = Project.splitElem(
                    Project.global.project,
                    elem,
                    range)
            }
        }
	}


	selectionRemoveConflictingBehind(state: Timeline.State)
	{
		for (const id of state.selection)
		{
			const selectedElem = Project.global.project.elems.get(id)
			if (!selectedElem)
				continue

            if (selectedElem.parentId !== this.parentId)
                continue

            const list = Project.global.project.lists.get(this.parentId)
            if (!list)
                continue

            const absSelectedRange = Project.getAbsoluteRange(
                Project.global.project,
                selectedElem.parentId,
                selectedElem.range)
        
            if (selectedElem.range.duration.isZero())
            {
                for (const elem of list.iterAtPoint(selectedElem.range.start))
                {
                    if (state.selection.has(elem.id))
                        continue
    
                    const removeElem = Project.elemModify(elem, { parentId: -1 })
                    Project.global.project = Project.upsertElement(Project.global.project, removeElem)
                }
            }
            else
            {
                for (const elem of list.iterAtRange(selectedElem.range))
                {
                    if (state.selection.has(elem.id))
                        continue

                    if (elem.type == "note" && selectedElem.type == "note" &&
                        elem.midiPitch != selectedElem.midiPitch)
                        continue
    
                    Project.global.project = Project.splitElem(
                        Project.global.project,
                        elem,
                        absSelectedRange)
                }
            }
		}
	}


    render(state: Timeline.State, canvas: CanvasRenderingContext2D)
    {

    }
	
	
	markerRectAtTime(state: Timeline.State, time: Rational)
	{
        return new Rect(
            Timeline.xAtTime(state, time) - MARKER_WIDTH / 2,
            0,
            MARKER_WIDTH,
            this.renderRect.h)
	}


    renderMarker(
        state: Timeline.State,
        canvas: CanvasRenderingContext2D,
        time: Rational,
        color: string,
        label: string | null,
        hovering: boolean,
        selected: boolean)
    {
        const xCenter = Math.round(Timeline.xAtTime(state, time))
        const x1 = xCenter - MARKER_WIDTH / 2
        const x2 = xCenter + MARKER_WIDTH / 2

        const y1 = 0.5
        const y2 = this.renderRect.h

        canvas.beginPath()
        canvas.moveTo(x1, y1)
        canvas.lineTo(x2, y1)
        canvas.lineTo(x2, y2 - MARKER_WIDTH / 2)
        canvas.lineTo(xCenter, y2)
        canvas.lineTo(x1, y2 - MARKER_WIDTH / 2)
        canvas.lineTo(x1, y1)

        canvas.fillStyle = color
        canvas.fill()

        if (label && xCenter > state.trackHeaderW)
            this.renderMarkerLabel(state, canvas, x2, color, label)

        if (hovering)
        {
            canvas.fillStyle = "#fff8"
            canvas.fill()
        }

        if (selected)
        {
            canvas.strokeStyle = "#fff"
            canvas.stroke()
        }
    }


    renderMarkerLabel(
        state: Timeline.State,
        canvas: CanvasRenderingContext2D,
        x: number,
        color: string,
        label: string)
    {
        const y1 = 0.5
        const y2 = this.renderRect.h

        canvas.fillStyle = color
        canvas.font = Math.floor(y2 - y1 - 10) + "px system-ui"
        canvas.textAlign = "left"
        canvas.textBaseline = "middle"
        canvas.fillText(label, x + 5, (y1 + y2) / 2)
    }
}