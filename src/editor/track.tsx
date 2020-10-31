import React from "react"
import * as Editor from "./index"
import * as Project from "../project"
import Rect from "../util/rect"
import Range from "../util/range"


export class EditorTrack
{
    projectTrackId: Project.ID = -1
    renderRect: Rect = new Rect(0, 0, 0, 0);


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
}