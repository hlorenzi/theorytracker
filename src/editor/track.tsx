import React from "react"
import * as Editor from "./index"
import * as Project from "../project"
import Rect from "../util/rect"
import Rational from "../util/rational"
import Range from "../util/range"


export const MARKER_WIDTH = 12


export class EditorTrack
{
    projectTrackId: Project.ID = -1
    renderRect: Rect = new Rect(0, 0, 0, 0)
    acceptedElemTypes: Set<Project.ElementType> = new Set<Project.ElementType>()
    pencil: any


    *elemsAtRegion(
        data: Editor.EditorUpdateData,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        
    }


    contextMenu(data: Editor.EditorUpdateData): JSX.Element | null
    {
        return null
    }


    hover(data: Editor.EditorUpdateData)
    {
        
    }


    pencilClear(data: Editor.EditorUpdateData)
    {
        
    }


    pencilHover(data: Editor.EditorUpdateData)
    {
        
    }


    pencilDrag(data: Editor.EditorUpdateData)
    {
        
    }


    pencilComplete(data: Editor.EditorUpdateData)
    {
        
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
        selected: boolean,
        playing: boolean)
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

        if (label)
        {
            data.ctx.font = Math.floor(y2 - y1 - 10) + "px system-ui"
            data.ctx.textAlign = "left"
            data.ctx.textBaseline = "middle"
            data.ctx.fillText(label, x2 + 5, (y1 + y2) / 2)
        }

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
}