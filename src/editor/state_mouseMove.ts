import * as Editor from "./index"


export function mouseMove(data: Editor.EditorUpdateData, pos: { x: number, y: number }): boolean
{
    if (data.state.mouse.down)
        return false

    data.state.mouse.pointPrev = data.state.mouse.point
    data.state.mouse.point = Editor.pointAt(data, pos)

    const hoverPrev = data.state.hover
    data.state.hover = null

    for (let t = 0; t < data.state.tracks.length; t++)
    {
        if (t == data.state.mouse.point.trackIndex)
            data.state.tracks[t].hover(data)
    }

    if (data.state.hover && hoverPrev)
    {
        if (data.state.hover!.id != hoverPrev!.id ||
            data.state.hover!.action != hoverPrev!.action)
            return true
    }
    else if ((!data.state.hover && hoverPrev) || (data.state.hover && !hoverPrev))
        return true

    return false
}