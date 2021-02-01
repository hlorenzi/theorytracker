import * as Timeline from "./index"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Playback from "../playback"
import * as Windows from "../windows"
import Rational from "../util/rational"
import Rect from "../util/rect"


export function mouseDown(data: Timeline.WorkData, rightButton: boolean)
{
    if (data.state.mouse.down)
        return
            
    const prevDownDate = data.state.mouse.downDate

    data.state.mouse.down = true
    data.state.mouse.downDate = new Date()
    data.state.mouse.action = Timeline.MouseAction.None

    const selectMultiple = data.state.keysDown.has(Prefs.global.editor.keySelectMultiple)
    const selectRange = data.state.keysDown.has(Prefs.global.editor.keySelectRange)
    const selectClone = data.state.keysDown.has(Prefs.global.editor.keySelectClone)
    const forcePan = data.state.keysDown.has(Prefs.global.editor.keyPan)
    const doubleClick =
        data.state.mouse.downDate.getTime() - prevDownDate.getTime() <
        Prefs.global.editor.mouseDoubleClickThresholdMs

    data.state.drag =
    {
        origin:
        {
            point: { ...data.state.mouse.point },
            range: null,
            timeScroll: data.state.timeScroll,
            trackScroll: data.state.trackScroll,
            trackYScroll: data.state.tracks[data.state.mouse.point.trackIndex].yScroll,
            project: Project.global.project,
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

    function withTrackAtMouse<T>(fn: (track: Timeline.TimelineTrack) => T | null)
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
        data.state.mouse.action = Timeline.MouseAction.Pan
    }
    else if (data.state.mouse.point.pos.x > data.state.trackHeaderW &&
        (data.state.keysDown.has(Prefs.global.editor.keyPencil) || trackAtMouseNoCursor))
    {
        if (!trackAtMouseNoCursor)
        {
            Timeline.selectionClear(data)
            data.state.cursor.visible = false
        }

        data.state.mouse.action = Timeline.MouseAction.Pencil
        withTrackAtMouse(tr => tr.pencilStart(data))
    }
    else if (data.state.hover)
    {
        Timeline.keyHandlePendingFinish(data)

        const elem = Project.global.project.elems.get(data.state.hover.id)
        data.state.drag.elemId = data.state.hover.id

        Timeline.selectionToggleHover(data, data.state.hover, selectMultiple)
        data.state.cursor.visible = false

        if (elem && elem.type == "track")
        {
            if (!selectRange)
            {
                data.state.rangeSelectOriginTrackIndex = data.state.mouse.point.trackIndex
                if (data.state.hoverControl != Timeline.TrackControl.None)
                {
                    data.state.mouse.action = Timeline.MouseAction.DragTrackControl
                }
            }
            else if (data.state.rangeSelectOriginTrackIndex >= 0)
            {
                selectTrackRange(data,
                    data.state.rangeSelectOriginTrackIndex,
                    data.state.mouse.point.trackIndex)
            }
        }
        else
        {
            data.state.rangeSelectOriginTrackIndex = -1

            withTrackAtMouse(tr => tr.click(data, data.state.hover!.id))

            const range = Timeline.selectionRange(data)
            if (range)
            {
                Timeline.cursorSetTime(data, range.start, range.start)
                Timeline.cursorSetTrack(data, data.state.mouse.point.trackIndex, data.state.mouse.point.trackIndex)
                Playback.setStartTime(range.start)
            }
            
            if (doubleClick)
            {
                withTrackAtMouse(tr => tr.doubleClick(data, data.state.hover!.id))
            }

            if (selectClone)
            {
                data.state.mouse.action = Timeline.MouseAction.DragClone
            }
        }
    }
    else
    {
        Timeline.keyHandlePendingFinish(data)

        if (!selectMultiple)
            Timeline.selectionClear(data)

        if (data.state.mouse.point.pos.x > data.state.trackHeaderW)
        {
            data.state.mouse.action = Timeline.MouseAction.SelectCursor
            data.state.cursor.visible = true
            Timeline.cursorSetTime(data, data.state.mouse.point.time, data.state.mouse.point.time)
            data.state.cursor.trackIndex1 = data.state.cursor.trackIndex2 =
                data.state.mouse.point.trackIndex

            if (doubleClick)
            {
                const anchor = Timeline.findPreviousAnchor(
                    data, data.state.mouse.point.time,
                    data.state.mouse.point.trackIndex, data.state.mouse.point.trackIndex)
                    
                Timeline.cursorSetTime(data, anchor, anchor)
                Timeline.scrollTimeIntoView(data, anchor)
            }

            Playback.setStartTime(data.state.cursor.time1)
        }
    }
}


function selectTrackRange(
    data: Timeline.WorkData,
    trackIndex1: number,
    trackIndex2: number)
{
    const trackIndexMin = Math.min(trackIndex1, trackIndex2)
    const trackIndexMax = Math.max(trackIndex1, trackIndex2)

    Timeline.selectionClear(data)

    for (var i = trackIndexMin; i <= trackIndexMax; i++)
        Timeline.selectionAdd(data, data.state.tracks[i].projectTrackId)
}