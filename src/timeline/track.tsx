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


    copyState(data: Timeline.WorkData)
    {
        for (const track of data.state.tracks)
        {
            if (track.projectTrackId == this.projectTrackId)
            {
                this.yScroll = track.yScroll
                break
            }
        }
    }


    *elemsAtRegion(
        data: Timeline.WorkData,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        
    }


    *iterKeyChangePairsAtRange(
        data: Timeline.WorkData,
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
            
            const keyCh1X = Timeline.xAtTime(data, keyCh1.range.start)
            const keyCh2X = Timeline.xAtTime(data, keyCh2.range.start)
            
            yield [keyCh1 as Project.KeyChange, keyCh2 as Project.KeyChange, keyCh1X, keyCh2X]
        }
    }


    hover(data: Timeline.WorkData)
    {
        
    }


    hoverBlockElements(
        data: Timeline.WorkData,
        elemsIter: (range: Range) => Generator<Project.Element, void, void>)
    {
        const pos = data.state.mouse.point.trackPos

        const margin = 10
        const checkRange = Timeline.timeRangeAtX(data, pos.x - margin, pos.x + margin)

        let hoverDrag = null
        let hoverStretch = null
        
        for (const elem of elemsIter(checkRange))
        {
            const margin = 8

            const x1 = Timeline.xAtTime(data, elem.range.start)
            const x2 = Timeline.xAtTime(data, elem.range.end)

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

        data.state.hover = hoverDrag ?? hoverStretch
    }


    click(data: Timeline.WorkData, elemId: Project.ID)
    {
        
    }


    doubleClick(data: Timeline.WorkData, elemId: Project.ID)
    {
        
    }


    contextMenu(data: Timeline.WorkData, elemId: Project.ID)
    {
        
    }


    pencilClear(data: Timeline.WorkData)
    {
        
    }


    pencilHover(data: Timeline.WorkData)
    {
        
    }


    pencilStart(data: Timeline.WorkData)
    {
        
    }


    pencilDrag(data: Timeline.WorkData)
    {
        
    }


    pencilComplete(data: Timeline.WorkData)
    {
        
    }
	
	
	rowAtY(data: Timeline.WorkData, y: number): number
	{
        return 0
	}
    
    
    findPreviousAnchor(data: Timeline.WorkData, time: Rational): Rational
    {
        const list = Project.global.project.lists.get(this.projectTrackId)
        if (!list)
            return Project.global.project.range.start

        return list.findPreviousDeletionAnchor(time) || Project.global.project.range.start
    }
	
	
	deleteRange(data: Timeline.WorkData, range: Range)
	{
        const list = Project.global.project.lists.get(this.projectTrackId)
        if (!list)
            return

        if (range.duration.isZero())
        {
            for (const elem of list.iterAtPoint(range.start))
            {
                const removeElem = Project.elemModify(elem, { parentId: -1 })
                Project.global.project = Project.upsertElement(Project.global.project, removeElem)
            }
        }
        else
        {
            for (const elem of list.iterAtRange(range))
            {
                const removeElem = Project.elemModify(elem, { parentId: -1 })
                Project.global.project = Project.upsertElement(Project.global.project, removeElem)
            }
        }
	}


	selectionRemoveConflictingBehind(data: Timeline.WorkData)
	{
        Project.global.project = Project.global.project

        const list = Project.global.project.lists.get(this.projectTrackId)
        if (!list)
            return

		for (const id of data.state.selection)
		{
			const selectedElem = Project.global.project.elems.get(id)
			if (!selectedElem)
				continue

            if (selectedElem.parentId !== this.projectTrackId)
                continue

            if (selectedElem.range.duration.isZero())
            {
                for (const elem of list.iterAtPoint(selectedElem.range.start))
                {
                    if (data.state.selection.has(elem.id))
                        continue
    
                    const removeElem = Project.elemModify(elem, { parentId: -1 })
                    Project.global.project = Project.upsertElement(Project.global.project, removeElem)
                }
            }
            else
            {
                for (const elem of list.iterAtRange(selectedElem.range))
                {
                    if (data.state.selection.has(elem.id))
                        continue
    
                    const removeElem = Project.elemModify(elem, { parentId: -1 })
                    Project.global.project = Project.upsertElement(Project.global.project, removeElem)
                }
            }
		}

        Project.global.project = Project.global.project
	}


    render(data: Timeline.WorkData)
    {

    }
	
	
	markerRectAtTime(data: Timeline.WorkData, time: Rational)
	{
        return new Rect(
            Timeline.xAtTime(data, time) - MARKER_WIDTH / 2,
            0,
            MARKER_WIDTH,
            this.renderRect.h)
	}


    renderMarker(
        data: Timeline.WorkData,
        time: Rational,
        color: string,
        label: string | null,
        hovering: boolean,
        selected: boolean)
    {
        const xCenter = Math.round(Timeline.xAtTime(data, time))
        const x1 = xCenter - MARKER_WIDTH / 2
        const x2 = xCenter + MARKER_WIDTH / 2

        const y1 = 0.5
        const y2 = this.renderRect.h

        data.ctx.beginPath()
        data.ctx.moveTo(x1, y1)
        data.ctx.lineTo(x2, y1)
        data.ctx.lineTo(x2, y2 - MARKER_WIDTH / 2)
        data.ctx.lineTo(xCenter, y2)
        data.ctx.lineTo(x1, y2 - MARKER_WIDTH / 2)
        data.ctx.lineTo(x1, y1)

        data.ctx.fillStyle = color
        data.ctx.fill()

        if (label && xCenter > data.state.trackHeaderW)
            this.renderMarkerLabel(data, x2, color, label)

        if (hovering)
        {
            data.ctx.fillStyle = "#fff8"
            data.ctx.fill()
        }

        if (selected)
        {
            data.ctx.strokeStyle = "#fff"
            data.ctx.stroke()
        }
    }


    renderMarkerLabel(
        data: Timeline.WorkData,
        x: number,
        color: string,
        label: string)
    {
        const y1 = 0.5
        const y2 = this.renderRect.h

        data.ctx.fillStyle = color
        data.ctx.font = Math.floor(y2 - y1 - 10) + "px system-ui"
        data.ctx.textAlign = "left"
        data.ctx.textBaseline = "middle"
        data.ctx.fillText(label, x + 5, (y1 + y2) / 2)
    }
}