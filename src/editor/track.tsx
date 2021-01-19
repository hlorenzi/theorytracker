import React from "react"
import * as Editor from "./index"
import * as Project from "../project"
import Rect from "../util/rect"
import Rational from "../util/rational"
import Range from "../util/range"


export const MARKER_WIDTH = 12


export class EditorTrack
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


    copyState(data: Editor.EditorUpdateData)
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
        data: Editor.EditorUpdateData,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        
    }


    hover(data: Editor.EditorUpdateData)
    {
        
    }


    click(data: Editor.EditorUpdateData, elemId: Project.ID)
    {
        
    }


    doubleClick(data: Editor.EditorUpdateData, elemId: Project.ID)
    {
        
    }


    contextMenu(data: Editor.EditorUpdateData, elemId: Project.ID)
    {
        
    }


    pencilClear(data: Editor.EditorUpdateData)
    {
        
    }


    pencilHover(data: Editor.EditorUpdateData)
    {
        
    }


    pencilStart(data: Editor.EditorUpdateData)
    {
        
    }


    pencilDrag(data: Editor.EditorUpdateData)
    {
        
    }


    pencilComplete(data: Editor.EditorUpdateData)
    {
        
    }
	
	
	rowAtY(data: Editor.EditorUpdateData, y: number): number
	{
        return 0
	}
    
    
    findPreviousAnchor(data: Editor.EditorUpdateData, time: Rational): Rational
    {
        const list = data.project.lists.get(this.projectTrackId)
        if (!list)
            return data.project.range.start

        return list.findPreviousDeletionAnchor(time) || data.project.range.start
    }
	
	
	deleteRange(data: Editor.EditorUpdateData, range: Range)
	{
        const list = data.project.lists.get(this.projectTrackId)
        if (!list)
            return

        if (range.duration.isZero())
        {
            for (const elem of list.iterAtPoint(range.start))
            {
                const removeElem = Project.elemModify(elem, { parentId: -1 })
                data.project = Project.upsertElement(data.project, removeElem)
            }
        }
        else
        {
            for (const elem of list.iterAtRange(range))
            {
                const removeElem = Project.elemModify(elem, { parentId: -1 })
                data.project = Project.upsertElement(data.project, removeElem)
            }
        }
	}


	selectionRemoveConflictingBehind(data: Editor.EditorUpdateData)
	{
        data.project = data.projectCtx.ref.current.project

        const list = data.project.lists.get(this.projectTrackId)
        if (!list)
            return

		for (const id of data.state.selection)
		{
			const selectedElem = data.project.elems.get(id)
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
                    data.project = Project.upsertElement(data.project, removeElem)
                }
            }
            else
            {
                for (const elem of list.iterAtRange(selectedElem.range))
                {
                    if (data.state.selection.has(elem.id))
                        continue
    
                    const removeElem = Project.elemModify(elem, { parentId: -1 })
                    data.project = Project.upsertElement(data.project, removeElem)
                }
            }
		}

        data.projectCtx.ref.current.project = data.project
	}


    render(data: Editor.EditorUpdateData)
    {

    }
	
	
	markerRectAtTime(data: Editor.EditorUpdateData, time: Rational)
	{
        return new Rect(
            Editor.xAtTime(data, time) - MARKER_WIDTH / 2,
            0,
            MARKER_WIDTH,
            this.renderRect.h)
	}


    renderMarker(
        data: Editor.EditorUpdateData,
        time: Rational,
        color: string,
        label: string | null,
        hovering: boolean,
        selected: boolean)
    {
        const xCenter = Math.round(Editor.xAtTime(data, time))
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
        data: Editor.EditorUpdateData,
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