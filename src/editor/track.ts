import * as Editor from "./index"
import * as Project from "../project"
import Rect from "../util/rect"
import Range from "../util/range"


export class EditorTrack
{
    renderRect: Rect = new Rect(0, 0, 0, 0);


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


    render(data: Editor.EditorUpdateData)
    {

    }
}