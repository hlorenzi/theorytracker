import * as Timeline from "./index"
import * as Prefs from "../prefs"
import Range from "../util/range"
import Rational from "../util/rational"


export function mouseMove(state: Timeline.State, pos: { x: number, y: number }): boolean
{
    if (state.mouse.down)
        return false

    state.mouse.pointPrev = state.mouse.point
    state.mouse.point = Timeline.pointAt(state, pos)

    const hoverPrev = state.hover
    state.hover = null

    for (let t = 0; t < state.tracks.length; t++)
        state.tracks[t].pencilClear(state)

    if (state.mouse.point.pos.x < state.trackHeaderW)
    {
        const trackIndex = Timeline.trackAtY(state, state.mouse.point.pos.y)
        if (trackIndex !== null)
        {
            const track = state.tracks[trackIndex]
            state.hover =
            {
                action: Timeline.MouseAction.DragTrackHeader,
                id: track.projectTrackId,
                range: new Range(new Rational(0), new Rational(0)),
            }
        }

        state.hoverControl = Timeline.trackControlAtPoint(
            state,
            state.mouse.point.trackIndex,
            state.mouse.point.trackPos)
    }
    else if (state.keysDown.has(Prefs.global.editor.keyPencil))
    {
        for (let t = 0; t < state.tracks.length; t++)
        {
            if (t == state.mouse.point.trackIndex)
                state.tracks[t].pencilHover(state)
        }
        return true
    }
    else
    {
        for (let t = 0; t < state.tracks.length; t++)
        {
            if (t == state.mouse.point.trackIndex)
                state.tracks[t].hover(state)
        }
    }

    if (state.hover && hoverPrev)
    {
        if (state.hover.id != hoverPrev.id ||
            state.hover.action != hoverPrev.action)
            return true
    }
    else if ((!state.hover && hoverPrev) || (state.hover && !hoverPrev))
        return true

    return false
}