import * as Project from "../project"
import * as Timeline from "./index.ts"
import * as Prefs from "../prefs.ts"
import * as Theory from "../theory/index.ts"
import Rect from "../utils/rect.ts"
import Range from "../utils/range.ts"
import Rational from "../utils/rational.ts"


export interface TupleIndicator
{
    denominator: number
    rect: Rect
    range: Range
    highestMidiPitch: number
    lowestMidiPitch: number
}


export const tupleDenominators = [13, 11, 7, 5, 3]


export class LaneNotes extends Timeline.Lane
{
    tupleIndicators: TupleIndicator[] = []


    refreshLayout(
        timeline: Timeline.State,
        project: Project.ImmutableRoot,
        prefs: Prefs.Prefs)
    {
        this.elements = []
        this.tupleIndicators = []

        for (const [note, keyChPair] of iterNotesAndKeyChanges(timeline, project))
        {
            const key = keyChPair.keyCh1.key
            const row = rowForPitch(note.midiPitch, key)

            const [rect, cutStart, cutEnd] = rectForNote(
                timeline,
                this,
                note.range,
                row,
                keyChPair.x1,
                keyChPair.x2,
                true)

            if (!cutStart)
            {
                this.add({
                    kind: "hidden",
                    id: note.id,
                    action: Timeline.MouseAction.StretchTimeStart,
                    rect: rect.withX1(rect.x1 - prefs.timeline.hoverOuterStretchWidth),
                })
            }

            if (!cutEnd)
            {        
                this.add({
                    kind: "hidden",
                    id: note.id,
                    action: Timeline.MouseAction.StretchTimeEnd,
                    rect: rect.withX2(rect.x2 + prefs.timeline.hoverOuterStretchWidth),
                })
            }

            if (rect.w > prefs.timeline.hoverInnerStretchWidth * 4)
            {
                if (!cutStart)
                {
                    this.add({
                        kind: "hidden",
                        id: note.id,
                        action: Timeline.MouseAction.StretchTimeStart,
                        rect: rect.withX2(rect.x1 + prefs.timeline.hoverInnerStretchWidth),
                        priority: 2,
                    })
                }

                if (!cutEnd)
                {
                    this.add({
                        kind: "hidden",
                        id: note.id,
                        action: Timeline.MouseAction.StretchTimeEnd,
                        rect: rect.withX1(rect.x2 - prefs.timeline.hoverInnerStretchWidth),
                        priority: 2,
                    })
                }
            }

            this.add({
                kind: "note",
                id: note.id,
                note: note,
                key: keyChPair.keyCh1.key,
                action: Timeline.MouseAction.DragTimeAndRow,
                rect,
                cutStart,
                cutEnd,
                priority: 1,
            })

            for (const denom of Timeline.tupleDenominators)
            {
                if (note.range.duration.denominator % denom !== 0)
                    continue
                
                let tuple = this.tupleIndicators.find(t =>
                    t.denominator === denom &&
                    t.range.end.compare(note.range.start) === 0)
                    
                if (tuple === undefined)
                {
                    tuple = {
                        denominator: denom,
                        rect: rect,
                        range: note.range,
                        highestMidiPitch: note.midiPitch,
                        lowestMidiPitch: note.midiPitch,
                    }

                    this.tupleIndicators.push(tuple)
                }

                tuple.highestMidiPitch = Math.max(tuple.highestMidiPitch, note.midiPitch)
                tuple.lowestMidiPitch = Math.min(tuple.lowestMidiPitch, note.midiPitch)
                tuple.range = tuple.range.merge(note.range)
                tuple.rect = tuple.rect.merge(rect)
                break
            }
        }

        let keyChCurrent = timeline.layout.keyRegions[0].keyCh1

        for (const elem of iterMarkersForLayout(timeline, project, timeline.layout.range))
        {
            const rect = rectForMarker(
                timeline,
                this,
                elem.type === "keyChange" ? 0 :
                    1,
                elem.range.start)

            let keyCh: Project.KeyChange | undefined = undefined
            let keyChPrev: Project.KeyChange | undefined = undefined
            if (elem.type === "keyChange")
            {
                keyCh = elem

                if (keyCh.id !== keyChCurrent.id &&
                    keyChCurrent.id >= 0)
                    keyChPrev = keyChCurrent

                keyChCurrent = keyCh
            }
            
            this.add({
                kind: "marker",
                id: elem.id,
                action: Timeline.MouseAction.DragTime,
                rect,
                priority: 1,
                zIndex: 1,
                keyCh,
                keyChPrev,
                meterCh: elem.type === "meterChange" ? elem : undefined,
            })
    
            timeline.layout.markers.push({
                time: elem.range.start,
                keyCh: elem.type === "keyChange" ? elem : undefined,
                meterCh: elem.type === "meterChange" ? elem : undefined,
            })
        }
    }


    *iterElementsAtRegion(
        timeline: Timeline.State,
        project: Project.ImmutableRoot,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        for (const note of iterNotesAtRegion(timeline, project, this, range, verticalRegion))
            yield note
        
        for (const marker of iterMarkersForSelection(timeline, project, range))
            yield marker
    }
    
    
    findPreviousAnchor(
        timeline: Timeline.State,
        project: Project.ImmutableRoot,
        time: Rational)
        : Rational | null
    {
        const list = project.lists.get(project.noteTrackId)
        if (!list)
            return null
    
        const anchor = list.findPreviousDeletionAnchor(time)
        return anchor
    }

        
    deleteRange(
        timeline: Timeline.State,
        project: Project.Mutable,
        range: Range)
    {
        const list = project.root.lists.get(project.root.noteTrackId)
        if (!list)
            return
    
        if (range.duration.isZero())
        {
            for (const elem of list.iterAtPoint(range.start))
            {
                const removeElem = Project.elemModify(elem, { parentId: -1 })
                project.root = Project.upsertElement(project.root, removeElem)
            }
        }
        else
        {
            for (const elem of list.iterAtRange(range))
            {
                project.root = Project.splitElem(project.root, elem, range)
            }
        }
    }
    
    
    insertByDegree(
        timeline: Timeline.State,
        project: Project.Mutable,
        prefs: Prefs.Prefs,
        time: Rational,
        degree: number)
    {
        const trackId = project.root.noteTrackId
        const key = Project.keyAt(project.root, trackId, time)
        const chroma = key.chromaForDegree(degree)
        Timeline.insertNote(timeline, project, trackId, time, chroma)
    }
    
    
    rowAtY(
        timeline: Timeline.State,
        y: number)
    {
        return rowAtY(timeline, this, y)
    }
}


function *iterNotesAndKeyChanges(
    timeline: Timeline.State,
    project: Project.ImmutableRoot)
    : Generator<[Project.Note, Timeline.KeyRegion], void, void>
{
    for (const keyRegion of timeline.layout.keyRegions)
    {
        const time1 = keyRegion.keyCh1.range.start.max(timeline.layout.range.start)
        const time2 = keyRegion.keyCh2.range.start.min(timeline.layout.range.end)
        
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
    lane: Timeline.Lane,
    row: number)
    : number
{
    return lane.rect.h / 2 - (row + 1) * timeline.noteRowH - timeline.yScroll
}


export function rowAtY(
    timeline: Timeline.State,
    lane: Timeline.Lane,
    y: number)
    : number
{
    return -Math.floor((y + timeline.yScroll - lane.rect.h / 2) / timeline.noteRowH) - 1
}


function rectForNote(
    timeline: Timeline.State,
    lane: Timeline.Lane,
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


function *iterNotesAtRegion(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    lane: Timeline.Lane,
    range: Range,
    verticalRegion?: { y1: number, y2: number })
    : Generator<Project.ID, void, void>
{
    for (const [note, keyChPair] of iterNotesAndKeyChanges(timeline, project))
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


function *iterMarkersForLayout(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    range: Range)
    : Generator<Project.KeyChange | Project.MeterChange, void, void>
{
    const keyChTrackElems = project.lists.get(project.keyChangeTrackId)
    if (!keyChTrackElems)
        return

    for (const keyCh of keyChTrackElems.iterAtRange(range))
        yield keyCh as Project.KeyChange
    
    const meterChTrackElems = project.lists.get(project.meterChangeTrackId)
    if (!meterChTrackElems)
        return

    for (const meterCh of meterChTrackElems.iterAtRange(range))
        yield meterCh as Project.MeterChange
}


function rectForMarker(
    timeline: Timeline.State,
    lane: Timeline.Lane,
    row: number,
    time: Rational)
    : Rect
{
    const x = Timeline.xAtTime(timeline, time)
    const w = 16
    const h = 24
    const y = h * row
    
    return new Rect(x - w / 2, y, w, h)
}


function *iterMarkersForSelection(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    range: Range)
    : Generator<Project.ID, void, void>
{
    const keyChTrackElems = project.lists.get(project.keyChangeTrackId)
    if (!keyChTrackElems)
        return

    for (const keyCh of keyChTrackElems.iterAtRange(range))
        yield keyCh.id
    
    const meterChTrackElems = project.lists.get(project.meterChangeTrackId)
    if (!meterChTrackElems)
        return

    for (const meterCh of meterChTrackElems.iterAtRange(range))
        yield meterCh.id
}