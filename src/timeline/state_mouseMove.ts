import * as Timeline from "./index"
import Range from "../util/range"
import Rational from "../util/rational"


export function mouseMove(data: Timeline.WorkData, pos: { x: number, y: number }): boolean
{
    if (data.state.mouse.down)
        return false

    data.state.mouse.pointPrev = data.state.mouse.point
    data.state.mouse.point = Timeline.pointAt(data, pos)

    const hoverPrev = data.state.hover
    data.state.hover = null

    for (let t = 0; t < data.state.tracks.length; t++)
        data.state.tracks[t].pencilClear(data)

    if (data.state.mouse.point.pos.x < data.state.trackHeaderW)
    {
        const trackIndex = Timeline.trackAtY(data, data.state.mouse.point.pos.y)
        if (trackIndex !== null)
        {
            const track = data.state.tracks[trackIndex]
            data.state.hover =
            {
                action: Timeline.MouseAction.DragTrackHeader,
                id: track.projectTrackId,
                range: new Range(new Rational(0), new Rational(0)),
            }
        }

        data.state.hoverControl = Timeline.trackControlAtPoint(
            data,
            data.state.mouse.point.trackIndex,
            data.state.mouse.point.trackPos)
    }
    else if (data.state.keysDown.has(data.prefs.editor.keyPencil))
    {
        for (let t = 0; t < data.state.tracks.length; t++)
        {
            if (t == data.state.mouse.point.trackIndex)
                data.state.tracks[t].pencilHover(data)
        }
        return true
    }
    else
    {
        for (let t = 0; t < data.state.tracks.length; t++)
        {
            if (t == data.state.mouse.point.trackIndex)
                data.state.tracks[t].hover(data)
        }
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