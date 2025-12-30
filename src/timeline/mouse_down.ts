import * as Timeline from "./index.ts"
import * as Project from "../project"
import * as Playback from "../playback"
import * as Prefs from "../prefs.ts"
import Rect from "../utils/rect.ts"
import Rational from "../utils/rational.ts"
import Range from "../utils/range.ts"


export function mouseDown(
    timeline: Timeline.State,
    project: Project.Mutable,
    playback: Playback.Manager,
    prefs: Prefs.Prefs,
    rightButton: boolean)
{
    if (timeline.mouse.down)
        return

    Timeline.keyHandlePendingFinish(timeline, project)
    
    const prevDownDate = timeline.mouse.downDate
            
    timeline.mouse.down = true
    timeline.mouse.downDate = new Date()
    timeline.mouse.action = Timeline.MouseAction.None
    
    const selectMultiple =
        timeline.keysDown.has(prefs.timeline.keySelectMultiple)
    const selectRange =
        timeline.keysDown.has(prefs.timeline.keySelectRange)
    const selectClone =
        timeline.keysDown.has(prefs.timeline.keySelectClone)
    const selectRect =
        timeline.keysDown.has(prefs.timeline.keySelectRect)
    const forcePan =
        timeline.keysDown.has(prefs.timeline.keyPan)
    const doubleClick =
        timeline.mouse.downDate.getTime() - prevDownDate.getTime() <
        prefs.timeline.mouseDoubleClickThresholdMs

    timeline.drag = {
        origin: {
            point: { ...timeline.mouse.point },
            range: null,
            timeScroll: timeline.timeScroll,
            yScroll: timeline.yScroll,
            project: project.root,
        },

        xLocked: true,
        yLocked: true,
        posDelta: { x: 0, y: 0 },
        timeDelta: new Rational(0),
        rowDelta: 0,
        laneDelta: 0,
        trackInsertionBefore: -1,

        elemId: undefined,
        trackId: undefined,
        notePreviewLast: null,
    }

    if (rightButton || forcePan)
    {
        timeline.mouse.action = Timeline.MouseAction.Pan
        return
    }


    const hoverIsSelected =
        timeline.hover !== undefined &&
        timeline.hover.id !== undefined &&
        timeline.selection.has(timeline.hover.id)

    
    if (!selectMultiple && !hoverIsSelected)
        Timeline.selectionClear(timeline)

    
    if (timeline.hover === undefined ||
        timeline.hover.action === undefined)
    {
        timeline.mouse.action = Timeline.MouseAction.SelectCursor

        timeline.cursor.visible = true//!selectRect
        Timeline.cursorSetTime(timeline, timeline.mouse.point.time, timeline.mouse.point.time)
        
        timeline.cursor.rectY1 = timeline.cursor.rectY2 =
            timeline.mouse.point.trackPos.y
        
        timeline.cursor.laneIndex1 = timeline.cursor.laneIndex2 =
            timeline.mouse.point.laneIndex
    
        if (doubleClick)
        {
            const anchor = Timeline.findPreviousAnchor(
                timeline,
                project.root,
                timeline.mouse.point.time,
                timeline.mouse.point.laneIndex,
                timeline.mouse.point.laneIndex)
                
            Timeline.cursorSetTime(timeline, anchor, anchor)
            Timeline.scrollTimeIntoView(timeline, anchor)
        }

        timeline.playbackStartTime = timeline.cursor.time1

        return
    }

    if (timeline.hover !== undefined)
    {
        timeline.cursor.visible = false
        
        if (timeline.hover.laneIndex !== undefined)
            Timeline.cursorSetLaneIndex(
                timeline,
                timeline.hover.laneIndex,
                timeline.hover.laneIndex)

        if (!hoverIsSelected)
            Timeline.selectionToggle(
                timeline,
                project.root,
                timeline.hover)

        timeline.drag.elemId = timeline.hover.id
        timeline.drag.trackId = timeline.hover.trackId
        timeline.drag.origin.range =
            Timeline.selectionRange(timeline, project.root)
        
        if (timeline.drag.origin.range)
            Timeline.cursorSetTime(
                timeline,
                timeline.drag.origin.range.start,
                timeline.drag.origin.range.end)

        timeline.mouse.action = timeline.hover.action

        const lane = timeline.layout.lanes[timeline.mouse.point.laneIndex]
        lane?.click(timeline, project.root, playback, timeline.hover)
        return
    }
}