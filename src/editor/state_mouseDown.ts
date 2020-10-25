import * as Editor from "./index"
import Rational from "../util/rational"


export function mouseDown(data: Editor.EditorUpdateData, rightButton: boolean)
{
    if (data.state.mouse.down)
        return

    data.state.mouse.down = true
    data.state.mouse.action = Editor.EditorAction.None

    const selectMultiple = data.state.keysDown.has("control")

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
    }

    if (rightButton)// || state.contentState.keys[state.appState.prefs.editor.keyPan])
    {
        data.state.mouse.action = Editor.EditorAction.Pan
    }
    else if (data.state.hover)
    {
        const alreadySelected = data.state.selection.has(data.state.hover.id)

        if (!selectMultiple && !alreadySelected)
            Editor.selectionClear(data)

        if (!alreadySelected || !selectMultiple)
            data.state.selection = data.state.selection.add(data.state.hover.id)
        else
            data.state.selection = data.state.selection.remove(data.state.hover.id)

        data.state.drag.origin.range = Editor.selectionRange(data)
        data.state.mouse.action = data.state.hover.action
        data.state.cursor.visible = false
    }
    else
    {
        if (!selectMultiple)
            Editor.selectionClear(data)

        data.state.mouse.action = Editor.EditorAction.SelectCursor
        data.state.cursor.visible = true
        data.state.cursor.time1 = data.state.cursor.time2 =
            data.state.mouse.point.time
        data.state.cursor.trackIndex1 = data.state.cursor.trackIndex2 =
            data.state.mouse.point.trackIndex
    }
}