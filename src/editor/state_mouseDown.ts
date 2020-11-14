import * as Editor from "./index"
import * as Project from "../project"
import * as Windows from "../windows"
import Rational from "../util/rational"
import Rect from "../util/rect"
import { EditorAction } from "./state"
import { ElementType } from "../project"


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

        elemId: -1,
        notePreviewLast: null,
    }

    function withTrackAtMouse<T>(fn: (track: Editor.EditorTrack) => T | null)
    {
        for (let t = 0; t < data.state.tracks.length; t++)
        {
            if (t == data.state.mouse.point.trackIndex)
                return fn(data.state.tracks[t])
        }

        return null
    }

    const trackAtMouseNoCursor = !!withTrackAtMouse(tr => tr.noCursor)

    if (rightButton || forcePan)
    {
        data.state.mouse.action = Editor.EditorAction.Pan
    }
    else if (data.state.mouse.point.pos.x > data.state.trackHeaderW &&
        (data.state.keysDown.has(data.prefs.editor.keyPencil) || trackAtMouseNoCursor))
    {
        if (!trackAtMouseNoCursor)
        {
            Editor.selectionClear(data)
            data.state.cursor.visible = false
        }

        data.state.mouse.action = Editor.EditorAction.Pencil
        withTrackAtMouse(tr => tr.pencilStart(data))
    }
    else if (data.state.hover)
    {
        const elem = data.project.elems.get(data.state.hover.id)
        data.state.drag.elemId = data.state.hover.id

        Editor.selectionToggleHover(data, data.state.hover, selectMultiple)
        data.state.cursor.visible = false

        withTrackAtMouse(tr => tr.click(data, data.state.hover!.id))

        const range = Editor.selectionRange(data)
        if (range)
            data.playback.setStartTime(range.start)
        
        if (doubleClick)
        {
            withTrackAtMouse(tr => tr.doubleClick(data, data.state.hover!.id))

            if (elem && elem.type == Project.ElementType.Track)
            {
                data.dockable.ref.current.createFloating(
                    Windows.TrackSettings,
                    { trackId: elem.id },
                    new Rect(
                        data.state.renderRect.x + data.state.mouse.point.pos.x,
                        data.state.renderRect.y + data.state.mouse.point.pos.y,
                        1, 1))
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