import * as Editor from "./index"
import Rational from "../util/rational"
import { EditorAction } from "./state"


export function mouseDown(data: Editor.EditorUpdateData, rightButton: boolean)
{
    if (data.state.mouse.down)
        return

    const prevDownDate = data.state.mouse.downDate

    data.state.mouse.down = true
    data.state.mouse.downDate = new Date()
    data.state.mouse.action = Editor.EditorAction.None

    const selectMultiple = data.state.keysDown.has(data.prefs.editor.keySelectMultiple)
    const forcePan = data.state.keysDown.has(data.prefs.editor.keyPan)
    const doubleClick =
        data.state.mouse.downDate.getTime() - prevDownDate.getTime() <
        data.prefs.editor.mouseDoubleClickThresholdMs

    data.state.drag =
    {
        origin:
        {
            point: { ...data.state.mouse.point },
            range: null,
            timeScroll: data.state.timeScroll,
            trackScroll: data.state.trackScroll,
            project: data.project,
        },

        xLocked: true,
        yLocked: true,
        posDelta: { x: 0, y: 0 },
        timeDelta: new Rational(0),
        rowDelta: 0,
        trackDelta: 0,
        trackInsertionBefore: -1,
    }

    if (rightButton || forcePan)
    {
        data.state.mouse.action = Editor.EditorAction.Pan
    }
    else if (data.state.keysDown.has(data.prefs.editor.keyPencil))
    {
        Editor.selectionClear(data)
        data.state.mouse.action = Editor.EditorAction.Pencil
        data.state.cursor.visible = false
    }
    else if (data.state.hover)
    {
        Editor.selectionToggleHover(data, data.state.hover, selectMultiple)
        data.state.cursor.visible = false

        const range = Editor.selectionRange(data)
        if (range)
            data.playback.setStartTime(range.start)
        
        if (doubleClick)
        {
            for (let t = 0; t < data.state.tracks.length; t++)
            {
                if (t == data.state.mouse.point.trackIndex)
                    data.state.tracks[t].doubleClick(data, data.state.hover.id)
            }
        }
    }
    else
    {
        if (!selectMultiple)
            Editor.selectionClear(data)

        if (data.state.mouse.point.pos.x > data.state.trackHeaderW)
        {
            data.state.mouse.action = Editor.EditorAction.SelectCursor
            data.state.cursor.visible = true
            data.state.cursor.time1 = data.state.cursor.time2 =
                data.state.mouse.point.time
            data.state.cursor.trackIndex1 = data.state.cursor.trackIndex2 =
                data.state.mouse.point.trackIndex

            data.playback.setStartTime(data.state.cursor.time1)
        }
    }
}