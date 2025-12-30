import * as Immutable from "immutable"
import * as Project from "../project"
import * as Timeline from "./index.ts"
import * as Theory from "../theory"
import Rational from "../utils/rational.ts"
import Range from "../utils/range.ts"
import Rect from "../utils/rect.ts"
import * as MathUtils from "../utils/mathUtils.ts"


export interface State
{
    pixelRatio: number
    renderRect: Rect

    trackMeasuresH: number
    trackControlX: number
    trackControlY: number
    trackControlSize: number

    layout: Timeline.Layout
    hover: Timeline.LayoutElement | undefined
    
    yScroll: number
    timeScroll: number
    timeScale: number
    timeSnap: Rational
    timeSnapBase: Rational

    noteRowH: number

    cursor:
    {
        visible: boolean
        time1: Rational
        time2: Rational
        laneIndex1: number
        laneIndex2: number
        rectY1: number
        rectY2: number
    }

    keysDown: Set<string>,

    mouse:
    {
        down: boolean
        downDate: Date

        action: MouseAction

        point: Point
        pointPrev: Point

        wheelDate: Date
    }

    drag:
    {
        origin:
        {
            point: Point
            range: Range | null
            timeScroll: number
            yScroll: number
            project: Project.ImmutableRoot
        }

        xLocked: boolean
        yLocked: boolean

        posDelta: { x: number, y: number }
        timeDelta: Rational
        rowDelta: number
        laneDelta: number
        trackInsertionBefore: number

        elemId: Project.ID | undefined
        trackId: Project.ID | undefined
        notePreviewLast: number | null
    }

    insertion:
    {
        nearMidiPitch: number
        duration: Rational
    }

    selection: Immutable.Set<Project.ID>

    needsKeyFinish: boolean
    rangeSelectOriginTrackIndex: number

    playbackStartTime: Rational
}


export enum MouseAction
{
    None,
    Pan,
    DragTime,
    DragRow,
    DragTimeAndRow,
    StretchTimeStart,
    StretchTimeEnd,
    SelectCursor,
}


export interface Point
{
    pos: { x: number, y: number }
    time: Rational
    row: number
    laneIndex: number
    trackPos: { x: number, y: number }
    originTrackPos: { x: number, y: number }
}


export interface HoverData
{
    id: Project.ID
    range: Range
    action: MouseAction
}



export function makeNew(): State
{
    return {
        pixelRatio: 1,
        renderRect: new Rect(0, 0, 0, 0),

        trackMeasuresH: 20,
        trackControlX: 10,
        trackControlY: 25,
        trackControlSize: 20,
        
        layout: new Timeline.Layout(),
        hover: undefined,
        
        yScroll: 0,
        timeScroll: -2.5,
        timeScale: 100,
        timeSnap: new Rational(1, 8),
        timeSnapBase: new Rational(1, 16),

        noteRowH: 16,

        cursor:
        {
            visible: true,
            time1: new Rational(0),
            time2: new Rational(0),
            laneIndex1: 0,
            laneIndex2: 0,
            rectY1: 0,
            rectY2: 0,
        },

        keysDown: new Set<string>(),

        mouse:
        {
            down: false,
            downDate: new Date(),

            action: MouseAction.None,
            
            point: 
            {
                pos: { x: 0, y: 0 },
                time: new Rational(0),
                row: 0,
                laneIndex: 0,
                trackPos: { x: 0, y: 0 },
                originTrackPos: { x: 0, y: 0 },
            },
            
            pointPrev:
            {
                pos: { x: 0, y: 0 },
                time: new Rational(0),
                row: 0,
                laneIndex: 0,
                trackPos: { x: 0, y: 0 },
                originTrackPos: { x: 0, y: 0 },
            },

            wheelDate: new Date(),
        },

        drag:
        {
            origin: null!,
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
        },

        insertion:
        {
            nearMidiPitch: 60,
            duration: new Rational(1, 4),
        },
        
        selection: Immutable.Set<Project.ID>(),

        needsKeyFinish: false,
        rangeSelectOriginTrackIndex: -1,

        playbackStartTime: new Rational(0),
    }
}


export function resize(
    state: State,
    pixelRatio: number,
    rect: Rect)
{
    state.pixelRatio = pixelRatio
    state.renderRect = rect
}


export function xAtTime(
    timeline: Timeline.State,
    time: Rational)
    : number
{
    return (time.asFloat() - timeline.timeScroll) * timeline.timeScale
}


export function timeAtX(
    timeline: Timeline.State,
    x: number,
    timeSnap?: Rational)
    : Rational
{
    timeSnap = timeSnap || timeline.timeSnap
    const time = x / timeline.timeScale + timeline.timeScroll
    return Rational.fromFloat(time, timeSnap.denominator)
}


export function timeRangeAtX(
    timeline: Timeline.State,
    x1: number,
    x2: number,
    timeSnap?: Rational)
    : Range
{
    timeSnap = timeSnap || timeline.timeSnap
    return new Range(
        timeAtX(timeline, x1, timeSnap).subtract(timeSnap),
        timeAtX(timeline, x2, timeSnap).add(timeSnap))
}


export function visibleTimeRange(
    timeline: Timeline.State)
    : Range
{
    return new Range(
        timeAtX(timeline, 0).subtract(timeline.timeSnap),
        timeAtX(timeline, timeline.renderRect.w).add(timeline.timeSnap))
}


export function laneIndexAtY(
    timeline: Timeline.State,
    y: number)
    : number
{
    if (y < 0)
        return -1

    for (let i = 0; i < timeline.layout.lanes.length; i++)
    {
        const lane = timeline.layout.lanes[i]

        if (y < lane.rect.y2)
            return i
    }

    return timeline.layout.lanes.length
}


export function pointAt(
    timeline: Timeline.State,
    x: number,
    y: number)
    : Point
{
    const time = timeAtX(timeline, x)

    const laneIndex = laneIndexAtY(timeline, y)
    const lane = timeline.layout.lanes[laneIndex]
    
    const row = lane?.rowAtY(timeline, y) ?? 0
    
    /*const trackPosY = pos.y - trackY(state, state.mouse.point.trackIndex)
    const trackPos = { x: pos.x, y: trackPosY }


    let originTrackPos = trackPos
    if (state.drag.origin)
    {
        const originTrackPosY = pos.y - trackY(state, state.drag.origin.point.trackIndex)
        originTrackPos = { x: pos.x, y: originTrackPosY }
    }*/
    
    return {
        pos: { x, y },
        time,
        laneIndex,
        trackPos: { x: 0, y: 0 },
        row,
        originTrackPos: { x: 0, y: 0 },
    }
}
    

export function selectionClear(
    timeline: Timeline.State)
{
    timeline.selection = timeline.selection.clear()
}


export function selectionRange(
    state: Timeline.State,
    project: Project.ImmutableRoot)
    : Range | null
{
    return Project.getRangeForElems(project, state.selection)
}


export function selectionToggle(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    element: Timeline.LayoutElement)
{
    if (element.id === undefined ||
        element.action === undefined)
        return

    const alreadySelected = timeline.selection.has(element.id)

    if (!alreadySelected)
        timeline.selection = timeline.selection.add(element.id)
    else
        timeline.selection = timeline.selection.remove(element.id)
}


export function selectionAdd(
    timeline: Timeline.State,
    id: Project.ID)
{
    timeline.selection = timeline.selection.add(id)
}


export function selectionAddAtCursor(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    verticalRegion?: { y1: number, y2: number })
{
    const time1 = timeline.cursor.time1
    const time2 = timeline.cursor.time2
    if (time1.compare(time2) === 0)
        return
    
    const range = new Range(time1, time2, false, false).sorted()

    const laneIndexMin = cursorGetLaneIndexMin(timeline)
    const laneIndexMax = cursorGetLaneIndexMax(timeline)
    
    for (let l = laneIndexMin; l <= laneIndexMax; l++)
    {
        const lane = timeline.layout.lanes[l]
        if (lane.iterElementsAtRegion === undefined)
            continue

        for (const id of lane.iterElementsAtRegion(timeline, project, range, verticalRegion))
            selectionAdd(timeline, id)
    }
}


export function rewind(
    state: Timeline.State,
    project: Project.ImmutableRoot)
{
    state.cursor.visible = true
    state.cursor.time1 = state.cursor.time2 = project.range.start
    //Playback.setStartTime(Project.global.project.range.start)
    scrollTimeIntoView(state, state.cursor.time1)
}


export function cursorSetTime(
    timeline: Timeline.State,
    time1: Rational | null,
    time2?: Rational | null)
{
    timeline.cursor.time1 = time1 ?? timeline.cursor.time1
    timeline.cursor.time2 = time2 ?? timeline.cursor.time2
}


export function cursorSetLaneIndex(
    timeline: Timeline.State,
    laneIndex1: number | null,
    laneIndex2?: number | null)
{
    timeline.cursor.laneIndex1 =
        Math.max(0, Math.min(timeline.layout.lanes.length - 1,
            laneIndex1 ?? timeline.cursor.laneIndex1))

    timeline.cursor.laneIndex2 = 
        Math.max(0, Math.min(timeline.layout.lanes.length - 1,
            laneIndex2 ?? timeline.cursor.laneIndex2))
}


export function cursorGetLaneIndexMin(
    timeline: Timeline.State)
{
    return Math.max(0, Math.min(
        timeline.cursor.laneIndex1,
        timeline.cursor.laneIndex2))
}


export function cursorGetLaneIndexMax(
    timeline: Timeline.State)
{
    return Math.min(timeline.layout.lanes.length - 1, Math.max(
        timeline.cursor.laneIndex1,
        timeline.cursor.laneIndex2))
}


export function scrollTimeIntoView(
    timeline: Timeline.State,
    time: Rational)
{
    const range = visibleTimeRange(timeline)
    const marginPixels = 100
    const marginTime = Rational.fromFloat(marginPixels / timeline.timeScale, 10000)
    
    if (time.compare(range.end.subtract(marginTime)) >= 0)
    {
        timeline.timeScroll =
            time.asFloat() -
            (timeline.renderRect.w - marginPixels) / timeline.timeScale
    }
    else if (time.compare(range.start.add(marginTime)) <= 0)
    {
        timeline.timeScroll =
            time.asFloat() -
            marginPixels / timeline.timeScale
    }
}


export function keyHandlePendingFinish(
    timeline: Timeline.State,
    project: Project.Mutable)
{
    if (!timeline.needsKeyFinish)
        return

    timeline.needsKeyFinish = false

    selectionResolveOverlappingAndDegenerate(timeline, project)
}


export function selectionResolveOverlappingAndDegenerate(
    timeline: Timeline.State,
    project: Project.Mutable)
{
    for (const id of timeline.selection)
    {
        const selectedElem = project.root.elems.get(id)
        if (!selectedElem)
            continue

        const list = project.root.lists.get(selectedElem.parentId)
        if (!list)
            continue

        const absSelectedRange = Project.getAbsoluteRange(
            project.root,
            selectedElem.parentId,
            selectedElem.range)
    
        if (selectedElem.range.duration.isZero())
        {
            if (selectedElem.type === "note" ||
                selectedElem.type === "chord")
            {
                const removeElem = Project.elemModify(selectedElem, { parentId: -1 })
                project.root = Project.upsertElement(project.root, removeElem)
            }
            else
            {
                for (const elem of list.iterAtPoint(selectedElem.range.start))
                {
                    if (timeline.selection.has(elem.id))
                        continue

                    const removeElem = Project.elemModify(elem, { parentId: -1 })
                    project.root = Project.upsertElement(project.root, removeElem)
                }
            }
        }
        else
        {
            for (const elem of list.iterAtRange(selectedElem.range))
            {
                if (timeline.selection.has(elem.id))
                    continue

                if (elem.type === "note" &&
                    selectedElem.type === "note" &&
                    elem.midiPitch !== selectedElem.midiPitch)
                    continue

                project.root = Project.splitElem(
                    project.root,
                    elem,
                    absSelectedRange)
            }
        }
    }
}


export function insertNote(
    timeline: Timeline.State,
    project: Project.Mutable,
    trackId: Project.ID,
    time: Rational,
    chroma: number)
    : number
{
    keyHandlePendingFinish(timeline, project)

    const insertOctave = Math.floor(timeline.insertion.nearMidiPitch / 12)
    const possiblePitches = [-1, 0, 1].map(offset => {
        const pitch = (insertOctave + offset) * 12 + (MathUtils.mod(chroma, 12))
        const delta = Math.abs(pitch - timeline.insertion.nearMidiPitch)
        return { pitch, delta }
    })

    possiblePitches.sort((a, b) => a.delta - b.delta)
    const chosenPitch = possiblePitches[0].pitch

    const range = new Range(time, time.add(timeline.insertion.duration))
        
    const note = Project.makeNote(
        trackId,
        range,
        chosenPitch)

    const id = project.root.nextId
    project.root = Project.upsertElement(project.root, note)
    project.root = Project.withRefreshedRange(project.root)

    timeline.insertion.nearMidiPitch = chosenPitch

    timeline.cursor.visible = false
    cursorSetTime(timeline, range.end, range.end)
    scrollTimeIntoView(timeline, range.end)
    selectionClear(timeline)
    selectionAdd(timeline, id)
    //Playback.playNotePreview(noteBlock.parentId, chosenPitch, volumeDb, velocity)
    selectionResolveOverlappingAndDegenerate(timeline, project)
    return chosenPitch
}


export function findPreviousAnchor(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    time: Rational,
    laneIndex1: number,
    laneIndex2: number)
    : Rational
{
    let prevAnchor: Rational | null = null
    
    const laneMin = Math.min(laneIndex1, laneIndex2)
    const laneMax = Math.max(laneIndex1, laneIndex2)
    
    for (let i = Math.max(0, laneMin); i <= Math.min(timeline.layout.lanes.length - 1, laneMax); i++)
    {
        const anchor = timeline.layout.lanes[i].findPreviousAnchor(timeline, project, time)
        if (!anchor)
            continue

        prevAnchor = Rational.max(prevAnchor, anchor)
    }

    if (!prevAnchor)
        return project.range.start
    
    return prevAnchor
}


export function deleteRange(
    timeline: Timeline.State,
    project: Project.Mutable,
    range: Range,
    trackIndex1: number,
    trackIndex2: number)
{
    const trackMin = Math.min(trackIndex1, trackIndex2)
    const trackMax = Math.max(trackIndex1, trackIndex2)
    
    for (let tr = Math.max(0, trackMin); tr <= Math.min(timeline.layout.lanes.length - 1, trackMax); tr++)
        timeline.layout.lanes[tr].deleteRange(timeline, project, range)
}


export function insertChord(
    timeline: Timeline.State,
    project: Project.Mutable,
    trackId: Project.ID,
    time: Rational,
    chord: Theory.Chord)
{
    keyHandlePendingFinish(timeline, project)

    const range = new Range(time, time.add(timeline.insertion.duration))
        
    const projChord = Project.makeChord(
        trackId,
        range,
        chord)

    const id = project.root.nextId
    project.root = Project.upsertElement(project.root, projChord)
    project.root = Project.withRefreshedRange(project.root)

    timeline.cursor.visible = false
    cursorSetTime(timeline, range.end, range.end)
    scrollTimeIntoView(timeline, range.end)
    selectionClear(timeline)
    selectionAdd(timeline, id)
    //Playback.playChordPreview(track.projectTrackId, chord, volumeDb, velocity)
    selectionResolveOverlappingAndDegenerate(timeline, project)
}


export function deleteElems(
    timeline: Timeline.State,
    project: Project.Mutable,
    elemIds: Iterable<Project.ID>)
{
    const range =
        Project.getRangeForElems(project.root, elemIds) ??
        new Range(timeline.cursor.time1, timeline.cursor.time1)

    for (const id of elemIds)
    {
        const elem = project.root.elems.get(id)
        if (!elem)
            continue

        if (elem.type == "track")
            continue

        const removeElem = Project.elemModify(elem, { parentId: -1 })
        project.root = Project.upsertElement(project.root, removeElem)
    }
    
    for (const id of elemIds)
    {
        const track = project.root.elems.get(id)
        if (!track)
            continue

        if (track.type != "track")
            continue

        if (track.id === project.root.keyChangeTrackId ||
            track.id === project.root.meterChangeTrackId ||
            track.id === project.root.chordTrackId)
            continue

        project.root = Project.upsertTrack(project.root, track, true)
    }

    project.root = Project.withRefreshedRange(project.root)
    timeline.cursor.visible = true
    cursorSetTime(timeline, range.start, range.start)
    scrollTimeIntoView(timeline, range.start)
}