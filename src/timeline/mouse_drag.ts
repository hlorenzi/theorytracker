import * as Project from "../project"
import * as Timeline from "./index.ts"
import * as Playback from "../playback"
import * as Prefs from "../prefs.ts"
import Rect from "../utils/rect.ts"
import Range from "../utils/range.ts"


export function mouseDrag(
    timeline: Timeline.State,
    project: Project.Mutable,
    playback: Playback.Manager,
    prefs: Prefs.Prefs)
    : boolean
{
    if (!timeline.mouse.down)
        return false

    timeline.mouse.pointPrev = timeline.mouse.point
    timeline.mouse.point = Timeline.pointAt(
        timeline,
        timeline.mouse.point.pos.x,
        timeline.mouse.point.pos.y)
    
    timeline.drag.posDelta = {
        x: timeline.mouse.point.pos.x - timeline.drag.origin.point.pos.x,
        y: timeline.mouse.point.pos.y - timeline.drag.origin.point.pos.y,
    }

    timeline.drag.timeDelta =
        timeline.mouse.point.time.subtract(timeline.drag.origin.point.time)

    timeline.drag.rowDelta =
        timeline.mouse.point.row - timeline.drag.origin.point.row

    timeline.drag.laneDelta =
        timeline.mouse.point.laneIndex - timeline.drag.origin.point.laneIndex
    
    timeline.drag.xLocked =
        timeline.drag.xLocked &&
        Math.abs(timeline.drag.posDelta.x) < prefs.timeline.mouseDragXLockedDistance

    timeline.drag.yLocked =
        timeline.drag.yLocked &&
        Math.abs(timeline.drag.posDelta.y) < prefs.timeline.mouseDragYLockedDistance
    

    if (timeline.mouse.action === Timeline.MouseAction.Pan)
        return handlePanning(timeline, project)

    else if (timeline.mouse.action === Timeline.MouseAction.SelectCursor)
        return handleSelectCursor(timeline, project)

    else
        return handleDragElements(timeline, project, playback)
}


function handlePanning(
    timeline: Timeline.State,
    project: Project.Mutable)
    : boolean
{
    timeline.timeScroll =
        timeline.drag.origin.timeScroll -
        (timeline.drag.posDelta.x / timeline.timeScale)

    timeline.yScroll =
        timeline.drag.origin.yScroll -
        timeline.drag.posDelta.y

    return true
}


function handleSelectCursor(
    timeline: Timeline.State,
    project: Project.Mutable)
    : boolean
{
    timeline.cursor.time2 = timeline.mouse.point.time
    timeline.cursor.laneIndex2 = timeline.mouse.point.laneIndex

    timeline.cursor.verticalRegion = {
        y1: timeline.cursor.verticalRegion.y1,
        y2: timeline.mouse.point.lanePos.y,
    }
    
    const lane = timeline.layout.lanes[timeline.cursor.laneIndex1]

    timeline.cursor.rectMode =
        timeline.cursor.laneIndex1 === timeline.cursor.laneIndex2 &&
        (timeline.cursor.time1.compare(timeline.cursor.time2) !== 0 ||
            !timeline.drag.yLocked) &&
        lane?.allowsRectSelect()

    timeline.playbackStartTime =
        timeline.cursor.time1.min(timeline.cursor.time2)
    
    Timeline.selectionClear(timeline)
    Timeline.selectionAddAtCursor(timeline, project.root)
    return true
}


function handleDragElements(
    timeline: Timeline.State,
    project: Project.Mutable,
    playback: Playback.Manager)
    : boolean
{
    let action = timeline.mouse.action

    if (timeline.drag.xLocked)
    {
        if (action === Timeline.MouseAction.DragTime ||
            action === Timeline.MouseAction.StretchTimeStart ||
            action === Timeline.MouseAction.StretchTimeEnd)
            action = Timeline.MouseAction.None
        
        else if (action === Timeline.MouseAction.DragTimeAndRow)
            action = Timeline.MouseAction.DragRow
    }

    if (timeline.drag.yLocked)
    {
        if (action === Timeline.MouseAction.DragTimeAndRow)
            action = Timeline.MouseAction.DragTime

        else if (action === Timeline.MouseAction.DragRow)
            action = Timeline.MouseAction.None
    }

    
    const origProject = timeline.drag.origin.project
    let newProject = origProject

    for (const id of timeline.selection)
    {
        const elem = origProject.elems.get(id)
        if (!elem)
            continue

        if (elem.type === "track")
            continue
            
        const changes: Partial<Project.Note> = {}

        if (action === Timeline.MouseAction.DragTime ||
            action === Timeline.MouseAction.DragTimeAndRow)
        {
            changes.range = elem.range
                .displace(timeline.drag.timeDelta)
                .quantize(Project.MAX_RATIONAL_DENOMINATOR)
        }

        
        if (action === Timeline.MouseAction.StretchTimeStart &&
            timeline.drag.origin.range)
        {
            changes.range = Project.getAbsoluteRange(origProject, elem.parentId, elem.range)
            changes.range = changes.range
                .stretch(
                    timeline.drag.timeDelta,
                    timeline.drag.origin.range.end,
                    timeline.drag.origin.range.start)
                .sorted()

            if (elem.range.start.compare(timeline.drag.origin.range.start) === 0)
                changes.range = new Range(
                    changes.range.start.snap(timeline.timeSnap),
                    changes.range.end)
                        .quantize(Project.MAX_RATIONAL_DENOMINATOR)
                
            changes.range = changes.range.sorted()
            changes.range = Project.getRelativeRange(origProject, elem.parentId, changes.range)
        }


        if (action === Timeline.MouseAction.StretchTimeEnd &&
            timeline.drag.origin.range)
        {
            changes.range = Project.getAbsoluteRange(origProject, elem.parentId, elem.range)
            changes.range = changes.range
                .stretch(
                    timeline.drag.timeDelta,
                    timeline.drag.origin.range.start,
                    timeline.drag.origin.range.end)
                .sorted()

            if (elem.range.end.compare(timeline.drag.origin.range.end) === 0)
                changes.range = new Range(
                    changes.range.start,
                    changes.range.end.snap(timeline.timeSnap))
                        .quantize(Project.MAX_RATIONAL_DENOMINATOR)

            changes.range = changes.range.sorted()
            changes.range = Project.getRelativeRange(origProject, elem.parentId, changes.range)
        }
        

        if ((action === Timeline.MouseAction.DragRow ||
            action === Timeline.MouseAction.DragTimeAndRow) &&
            elem.type === "note")
        {
            const note = elem as Project.Note
            const key = Project.keyAt(project.root, note.range.start)
            const degree = key.octavedDegreeForMidi(note.midiPitch)
            const newPitch = key.midiForDegree(Math.floor(degree + timeline.drag.rowDelta))
            changes.midiPitch = newPitch
            
            if (elem.id === timeline.drag.elemId &&
                timeline.drag.trackId !== undefined)
            {
                if ((timeline.drag.notePreviewLast && newPitch !== timeline.drag.notePreviewLast) ||
                    (!timeline.drag.notePreviewLast && newPitch !== note.midiPitch))
                {
                    timeline.drag.notePreviewLast = newPitch
                    playback.playNotePreview(
                        newProject,
                        timeline.drag.trackId,
                        newPitch)
                }
            }
        }
        
        newProject = Project.upsertElement(
            newProject,
            Project.elemModify(elem, changes))
    }

    project.root = newProject
    return newProject !== origProject
}