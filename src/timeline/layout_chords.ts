import * as Project from "../project"
import * as Theory from "../theory"
import * as Timeline from "./index.ts"
import * as Prefs from "../prefs.ts"
import Rect from "../utils/rect.ts"
import Range from "../utils/range.ts"


export function layoutLaneChords(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    prefs: Prefs.Prefs,
    layout: Timeline.Layout,
    laneChords: Timeline.LayoutElementLaneChords)
{
    laneChords.iterElementsAtRegion = (timeline, project, range, verticalRegion) =>
        iterChordsAtRegion(timeline, project, laneChords, range)

    for (const [chord, keyChPair] of iterChordsAndKeyChanges(timeline, project, layout))
    {
        const key = keyChPair.keyCh1.key

        const [rect, cutStart, cutEnd] = rectForChord(
            timeline,
            laneChords,
            chord.range,
            keyChPair.x1,
            keyChPair.x2)

        if (!cutStart)
        {
            layout.add(laneChords, {
                kind: "hidden",
                id: chord.id,
                action: Timeline.MouseAction.StretchTimeStart,
                rect: rect.withX1(rect.x1 - prefs.timeline.hoverOuterStretchWidth),
            })
        }

        if (!cutEnd)
        {        
            layout.add(laneChords, {
                kind: "hidden",
                id: chord.id,
                action: Timeline.MouseAction.StretchTimeEnd,
                rect: rect.withX2(rect.x2 + prefs.timeline.hoverOuterStretchWidth),
            })
        }

        if (rect.w > prefs.timeline.hoverInnerStretchWidth * 4)
        {
            if (!cutStart)
            {
                layout.add(laneChords, {
                    kind: "hidden",
                    id: chord.id,
                    action: Timeline.MouseAction.StretchTimeStart,
                    rect: rect.withX2(rect.x1 + prefs.timeline.hoverInnerStretchWidth),
                    priority: 2,
                })
            }

            if (!cutEnd)
            {
                layout.add(laneChords, {
                    kind: "hidden",
                    id: chord.id,
                    action: Timeline.MouseAction.StretchTimeEnd,
                    rect: rect.withX1(rect.x2 - prefs.timeline.hoverInnerStretchWidth),
                    priority: 2,
                })
            }
        }
        
        layout.add(laneChords, {
            kind: "chord",
            id: chord.id,
            action: Timeline.MouseAction.DragTime,
            rect,
            cutStart,
            cutEnd,
            priority: 1,
            chord: chord,
            key: key,
        })
    }
}


function *iterChordsAndKeyChanges(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    layout: Timeline.Layout)
    : Generator<[Project.Chord, Timeline.KeyRegion], void, void>
{
    for (const keyRegion of layout.keyRegions)
    {
        const time1 = keyRegion.keyCh1.range.start.max(layout.range.start)
        const time2 = keyRegion.keyCh2.range.start.min(layout.range.end)
        
        for (const chord of iterChords(timeline, project, new Range(time1, time2)))
            yield [chord, keyRegion]
    }
}


function *iterChords(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    range: Range)
    : Generator<Project.Chord, void, void>
{
    const list = project.lists.get(project.chordTrackId)
    if (!list)
        return

    for (const elem of list.iterAtRange(range))
        yield elem as Project.Chord
}


function rectForChord(
    timeline: Timeline.State,
    lane: Timeline.LayoutElementLaneChords,
    chordRange: Range,
    keyChXStart: number,
    keyChXEnd: number)
    : [Rect, boolean, boolean]
{
    const chordOrigX1 = Timeline.xAtTime(timeline, chordRange.start)
    const chordOrigX2 = Timeline.xAtTime(timeline, chordRange.end)
    
    let chordX1 = Math.max(chordOrigX1, keyChXStart)
    let chordX2 = Math.min(chordOrigX2, keyChXEnd)
    
    const cutStart = chordOrigX1 < chordX1
    const cutEnd   = chordOrigX2 > chordX2
    
    //if (!cutStart) chordX1 += 1
    //if (!cutEnd)   chordX2 -= 1
    
    chordX1 = 0.5 + Math.floor(chordX1)
    chordX2 = 0.5 + Math.floor(chordX2)
    
    const chordW = Math.max(2, chordX2 - chordX1)
    
    return [
        new Rect(chordX1, lane.rect.y, chordW, lane.rect.h),
        cutStart,
        cutEnd]
}


function *iterChordsAtRegion(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    lane: Timeline.LayoutElementLaneChords,
    range: Range)
    : Generator<Project.ID, void, void>
{
    for (const [chord, keyChPair] of iterChordsAndKeyChanges(timeline, project, timeline.layout))
    {
        if (!chord.range.overlapsRange(range))
            continue

        yield chord.id
    }
}