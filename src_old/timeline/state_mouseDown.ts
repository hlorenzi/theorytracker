import * as Timeline from "./index"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Playback from "../playback"
import * as Windows from "../windows"
import Rational from "../util/rational"
import Rect from "../util/rect"


export function mouseDown(state: Timeline.State, rightButton: boolean)
{
    if (state.mouse.down)
        return
            
    const prevDownDate = state.mouse.downDate

    state.mouse.down = true
    state.mouse.downDate = new Date()
    state.mouse.action = Timeline.MouseAction.None

    const selectMultiple = state.keysDown.has(Prefs.global.editor.keySelectMultiple)
    const selectRange = state.keysDown.has(Prefs.global.editor.keySelectRange)
    const selectClone = state.keysDown.has(Prefs.global.editor.keySelectClone)
    const selectRect = state.keysDown.has(Prefs.global.editor.keySelectRect)
    const forcePan = state.keysDown.has(Prefs.global.editor.keyPan)
    const doubleClick =
        state.mouse.downDate.getTime() - prevDownDate.getTime() <
        Prefs.global.editor.mouseDoubleClickThresholdMs

    state.drag =
    {
        origin:
        {
            point: { ...state.mouse.point },
            range: null,
            timeScroll: state.timeScroll,
            trackScroll: state.trackScroll,
            trackYScroll: state.tracks[state.mouse.point.trackIndex].yScroll,
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
        for (let t = 0; t < state.tracks.length; t++)
        {
            if (t == state.mouse.point.trackIndex)
                return fn(state.tracks[t])
        }

        return null
    }

    const trackAtMouseNoCursor = !!withTrackAtMouse(tr => tr.noCursor)

    if (rightButton || forcePan)
    {
        state.mouse.action = Timeline.MouseAction.Pan
    }
    else if (state.mouse.point.pos.x > state.trackHeaderW &&
        (state.keysDown.has(Prefs.global.editor.keyPencil) || trackAtMouseNoCursor))
    {
        if (!trackAtMouseNoCursor)
        {
            Timeline.selectionClear(state)
            state.cursor.visible = false
        }

        state.mouse.action = Timeline.MouseAction.Pencil
        withTrackAtMouse(tr => tr.pencilStart(state))
    }
    else if (state.hover && !selectRect)
    {
        Timeline.keyHandlePendingFinish(state)

        const elem = Project.global.project.elems.get(state.hover.id)
        state.drag.elemId = state.hover.id

        Timeline.selectionToggleHover(state, state.hover, selectMultiple)
        state.cursor.visible = false

        if (elem && elem.type == "track")
        {
            if (!selectRange)
            {
                state.rangeSelectOriginTrackIndex = state.mouse.point.trackIndex
                if (state.hoverControl != Timeline.TrackControl.None)
                {
                    state.mouse.action = Timeline.MouseAction.DragTrackControl
                }
            }
            else if (state.rangeSelectOriginTrackIndex >= 0)
            {
                selectTrackRange(state,
                    state.rangeSelectOriginTrackIndex,
                    state.mouse.point.trackIndex)
            }
        }
        else
        {
            state.rangeSelectOriginTrackIndex = -1

            withTrackAtMouse(tr => tr.click(state, state.hover!.id))

            const range = Timeline.selectionRange(state)
            if (range)
            {
                Timeline.cursorSetTime(state, range.start, range.start)
                Timeline.cursorSetTrack(state, state.mouse.point.trackIndex, state.mouse.point.trackIndex)
                Playback.setStartTime(range.start)
            }
            
            if (doubleClick)
            {
                withTrackAtMouse(tr => tr.doubleClick(state, state.hover!.id))
            }

            if (selectClone)
            {
                state.mouse.action = Timeline.MouseAction.DragClone
            }
        }
    }
    else
    {
        Timeline.keyHandlePendingFinish(state)

        if (!selectMultiple)
            Timeline.selectionClear(state)

        if (state.mouse.point.pos.x > state.trackHeaderW)
        {
            state.mouse.action = selectRect ?
                Timeline.MouseAction.SelectRect :
                Timeline.MouseAction.SelectCursor

            state.cursor.visible = !selectRect
            Timeline.cursorSetTime(state, state.mouse.point.time, state.mouse.point.time)
            
            state.cursor.rectY1 = state.cursor.rectY2 =
                state.mouse.point.trackPos.y
            
            state.cursor.trackIndex1 = state.cursor.trackIndex2 =
                state.mouse.point.trackIndex

            if (doubleClick)
            {
                const anchor = Timeline.findPreviousAnchor(
                    state, state.mouse.point.time,
                    state.mouse.point.trackIndex, state.mouse.point.trackIndex)
                    
                Timeline.cursorSetTime(state, anchor, anchor)
                Timeline.scrollTimeIntoView(state, anchor)
            }

            Playback.setStartTime(state.cursor.time1)
        }
    }
}


function selectTrackRange(
    state: Timeline.State,
    trackIndex1: number,
    trackIndex2: number)
{
    const trackIndexMin = Math.min(trackIndex1, trackIndex2)
    const trackIndexMax = Math.max(trackIndex1, trackIndex2)

    Timeline.selectionClear(state)

    for (var i = trackIndexMin; i <= trackIndexMax; i++)
        Timeline.selectionAdd(state, state.tracks[i].projectTrackId)
}