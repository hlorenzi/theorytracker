import * as Project from "../project"
import * as Theory from "../theory"
import * as Timeline from "./index.ts"
import * as Prefs from "../prefs.ts"
import Rect from "../utils/rect.ts"
import Range from "../utils/range.ts"


export function layoutLaneNotes(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    prefs: Prefs.Prefs,
    layout: Timeline.Layout,
    laneNotes: Timeline.LayoutElementLaneNotes)
{
    laneNotes.iterElementsAtRegion = (timeline, project, range, verticalRegion) =>
        iterNotesAndMarkersAtRegion(timeline, project, laneNotes, range, verticalRegion)

    for (const [note, keyChPair] of iterNotesAndKeyChanges(timeline, project, layout))
    {
        const key = keyChPair.keyCh1.key
        const row = rowForPitch(note.midiPitch, key)

        const [rect, cutStart, cutEnd] = rectForNote(
            timeline,
            laneNotes,
            note.range,
            row,
            keyChPair.x1,
            keyChPair.x2,
            true)

        if (!cutStart)
        {
            layout.add(laneNotes, {
                kind: "hidden",
                id: note.id,
                action: Timeline.MouseAction.StretchTimeStart,
                rect: rect.withX1(rect.x1 - prefs.timeline.hoverOuterStretchWidth),
            })
        }

        if (!cutEnd)
        {        
            layout.add(laneNotes, {
                kind: "hidden",
                id: note.id,
                action: Timeline.MouseAction.StretchTimeEnd,
                rect: rect.withX2(rect.x2 + prefs.timeline.hoverOuterStretchWidth),
            })
        }

        if (rect.w > prefs.timeline.hoverInnerStretchWidth * 2)
        {
            if (!cutStart)
            {
                layout.add(laneNotes, {
                    kind: "hidden",
                    id: note.id,
                    action: Timeline.MouseAction.StretchTimeStart,
                    rect: rect.withX2(rect.x1 + prefs.timeline.hoverInnerStretchWidth),
                    priority: 2,
                })
            }

            if (!cutEnd)
            {
                layout.add(laneNotes, {
                    kind: "hidden",
                    id: note.id,
                    action: Timeline.MouseAction.StretchTimeEnd,
                    rect: rect.withX1(rect.x2 - prefs.timeline.hoverInnerStretchWidth),
                    priority: 2,
                })
            }
        }

        layout.add(laneNotes, {
            kind: "note",
            id: note.id,
            action: Timeline.MouseAction.DragTimeAndRow,
            rect,
            cutStart,
            cutEnd,
            priority: 1,
        })
    }
}


function *iterNotesAndKeyChanges(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    layout: Timeline.Layout)
    : Generator<[Project.Note, Timeline.KeyRegion], void, void>
{
    for (const keyRegion of layout.keyRegions)
    {
        const time1 = keyRegion.keyCh1.range.start.max(layout.range.start)
        const time2 = keyRegion.keyCh2.range.start.min(layout.range.end)
        
        for (const note of iterNotes(timeline, project, new Range(time1, time2)))
            yield [note, keyRegion]
    }
}


function *iterNotes(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    range: Range)
    : Generator<Project.Note, void, void>
{
    const list = project.lists.get(project.noteTrackId)
    if (!list)
        return

    for (const elem of list.iterAtRange(range))
        yield elem as Project.Note
}
	
	
export function rowForPitch(
    pitch: number,
    key: Theory.Key)
    : number
{
    const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
    return key.octavedDegreeForMidi(pitch - Theory.Utils.midiMiddleC) + tonicRowOffset
}
	
	
export function pitchForRow(
    row: number,
    key: Theory.Key)
    : number
{
    const tonicRowOffset = Theory.Utils.chromaToDegreeInCMajor(key.tonic.chroma)
    return key.midiForDegree(row - Math.floor(tonicRowOffset)) + Theory.Utils.midiMiddleC
}


export function yForRow(
    timeline: Timeline.State,
    lane: Timeline.LayoutElementLaneNotes,
    row: number)
    : number
{
    return lane.rect.y +
        lane.rect.h / 2 - (row + 1) * timeline.noteRowH - timeline.yScroll
}


export function rowAtY(
    timeline: Timeline.State,
    lane: Timeline.LayoutElementLaneNotes,
    y: number)
    : number
{
    return -Math.floor((y - lane.rect.y + timeline.yScroll - lane.rect.h / 2) / timeline.noteRowH) - 1
}


function rectForNote(
    timeline: Timeline.State,
    lane: Timeline.LayoutElementLaneNotes,
    noteRange: Range,
    noteRow: number,
    keyChXStart: number,
    keyChXEnd: number,
    clampY: boolean)
    : [Rect, boolean, boolean]
{
    const noteOrigX1 = Timeline.xAtTime(timeline, noteRange.start)
    const noteOrigX2 = Timeline.xAtTime(timeline, noteRange.end)
    
    let noteY = 0.5 + Math.floor(yForRow(timeline, lane, noteRow))
    if (clampY)
    {
        noteY =
            Math.max(lane.rect.y - timeline.noteRowH / 2,
            Math.min(lane.rect.y + lane.rect.h - timeline.noteRowH / 2,
            noteY))
    }
    
    let noteX1 = Math.max(noteOrigX1, keyChXStart)
    let noteX2 = Math.min(noteOrigX2, keyChXEnd)
    
    const cutStart = noteOrigX1 < noteX1
    const cutEnd   = noteOrigX2 > noteX2
    
    //if (!cutStart) noteX1 += 1
    //if (!cutEnd)   noteX2 -= 1
    
    noteX1 = 0.5 + Math.floor(noteX1)
    noteX2 = 0.5 + Math.floor(noteX2)
    
    const noteW = Math.max(2, noteX2 - noteX1)
    
    return [
        new Rect(noteX1, noteY, noteW, timeline.noteRowH),
        cutStart,
        cutEnd]
}


function *iterNotesAndMarkersAtRegion(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    lane: Timeline.LayoutElementLaneNotes,
    range: Range,
    verticalRegion?: { y1: number, y2: number })
    : Generator<Project.ID, void, void>
{
    for (const note of iterNotesAtRegion(timeline, project, lane, range, verticalRegion))
        yield note
    
    for (const marker of Timeline.iterMarkersForSelection(timeline, project, range))
        yield marker
}


function *iterNotesAtRegion(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    lane: Timeline.LayoutElementLaneNotes,
    range: Range,
    verticalRegion?: { y1: number, y2: number })
    : Generator<Project.ID, void, void>
{
    for (const [note, keyChPair] of iterNotesAndKeyChanges(timeline, project, timeline.layout))
    {
        if (!note.range.overlapsRange(range))
            continue

        if (verticalRegion !== undefined)
        {
            const [rect] = rectForNote(
                timeline,
                lane,
                note.range,
                rowForPitch(note.midiPitch, keyChPair.keyCh1.key),
                keyChPair.x1,
                keyChPair.x2,
                false)

            if (verticalRegion.y1 > rect.y2 ||
                verticalRegion.y2 < rect.y1)
                continue
        }
        
        yield note.id
    }
}