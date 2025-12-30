import * as Project from "../project"
import * as Theory from "../theory"
import * as Timeline from "./index.ts"
import * as Playback from "../playback"
import * as Prefs from "../prefs.ts"
import Rect from "../utils/rect.ts"
import Range from "../utils/range.ts"
import Rational from "../utils/rational.ts"


export class LaneChords extends Timeline.Lane
{
    override refreshLayout(
        timeline: Timeline.State,
        project: Project.ImmutableRoot,
        prefs: Prefs.Prefs)
    {
        this.elements = []

        for (const [chord, keyChPair] of iterChordsAndKeyChanges(timeline, project))
        {
            const key = keyChPair.keyCh1.key

            const [rect, cutStart, cutEnd] = rectForChord(
                timeline,
                this,
                chord.range,
                keyChPair.x1,
                keyChPair.x2)

            if (!cutStart)
            {
                this.add({
                    kind: "hidden",
                    id: chord.id,
                    trackId: project.chordTrackId,
                    laneIndex: this.laneIndex,
                    action: Timeline.MouseAction.StretchTimeStart,
                    rect: rect.withX1(rect.x1 - prefs.timeline.hoverOuterStretchWidth),
                })
            }

            if (!cutEnd)
            {        
                this.add({
                    kind: "hidden",
                    id: chord.id,
                    trackId: project.chordTrackId,
                    laneIndex: this.laneIndex,
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
                        id: chord.id,
                        trackId: project.chordTrackId,
                        laneIndex: this.laneIndex,
                        action: Timeline.MouseAction.StretchTimeStart,
                        rect: rect.withX2(rect.x1 + prefs.timeline.hoverInnerStretchWidth),
                        priority: 2,
                    })
                }

                if (!cutEnd)
                {
                    this.add({
                        kind: "hidden",
                        id: chord.id,
                        trackId: project.chordTrackId,
                        laneIndex: this.laneIndex,
                        action: Timeline.MouseAction.StretchTimeEnd,
                        rect: rect.withX1(rect.x2 - prefs.timeline.hoverInnerStretchWidth),
                        priority: 2,
                    })
                }
            }
            
            this.add({
                kind: "chord",
                id: chord.id,
                trackId: project.chordTrackId,
                laneIndex: this.laneIndex,
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

    
    override *iterElementsAtRegion(
        timeline: Timeline.State,
        project: Project.ImmutableRoot,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        for (const chord of iterChords(timeline, project, range))
            yield chord.id
    }
        
        
    override findPreviousAnchor(
        timeline: Timeline.State,
        project: Project.ImmutableRoot,
        time: Rational)
        : Rational | null
    {
        const list = project.lists.get(project.chordTrackId)
        if (!list)
            return null
    
        const anchor = list.findPreviousDeletionAnchor(time)
        return anchor
    }
    
    
    override click(
        timeline: Timeline.State,
        project: Project.ImmutableRoot,
        playback: Playback.Manager,
        element: Timeline.LayoutElement)
    {
        const chord = Project.getTypedElem(project, element.id, "chord")
        if (!chord)
            return

        if (element.trackId === undefined)
            return

        timeline.insertion.duration = chord.range.duration
        playback.playChordPreview(project, element.trackId, chord.chord)
    }
    
            
    override deleteRange(
        timeline: Timeline.State,
        project: Project.Mutable,
        range: Range)
    {
        const list = project.root.lists.get(project.root.chordTrackId)
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
        
        
    override insertByDegree(
        timeline: Timeline.State,
        project: Project.Mutable,
        playback: Playback.Manager,
        prefs: Prefs.Prefs,
        time: Rational,
        degree: number)
    {
        const trackId = project.root.chordTrackId
        const key = Project.keyAt(project.root, time)
        
        const chord = Theory.Chord.fromDiatonicTriad(key, degree)
        Timeline.insertChord(timeline, project, trackId, time, chord)
        playback.playChordPreview(project.root, trackId, chord)
    }
}


function *iterChordsAndKeyChanges(
    timeline: Timeline.State,
    project: Project.ImmutableRoot)
    : Generator<[Project.Chord, Timeline.KeyRegion], void, void>
{
    for (const keyRegion of timeline.layout.keyRegions)
    {
        const time1 = keyRegion.keyCh1.range.start.max(timeline.layout.range.start)
        const time2 = keyRegion.keyCh2.range.start.min(timeline.layout.range.end)
        
        for (const chord of iterChords(timeline, project, new Range(time1, time2)))
            yield [chord, keyRegion]
    }
}


function *iterChords(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    range: Range)
{
    const list = project.lists.get(project.chordTrackId)
    if (!list)
        return

    for (const elem of list.iterAtRange(range))
        yield elem as Project.Chord
}


function rectForChord(
    timeline: Timeline.State,
    lane: Timeline.Lane,
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
        new Rect(chordX1, 0, chordW, lane.rect.h),
        cutStart,
        cutEnd]
}


function *iterChordsAtRegion(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    lane: Timeline.Lane,
    range: Range)
    : Generator<Project.ID, void, void>
{
    for (const [chord, keyChPair] of iterChordsAndKeyChanges(timeline, project))
    {
        if (!chord.range.overlapsRange(range))
            continue

        yield chord.id
    }
}