import Immutable from "immutable"
import * as Project from "../project"
import * as Playback from "../playback"
import * as Prefs from "../prefs"
import * as Timeline from "./index"
import * as Popup from "../popup"
import * as Theory from "../theory"
import * as Dockable from "../dockable"
import * as MathUtils from "../util/mathUtils"
import Rational from "../util/rational"
import { RefState } from "../util/refState"
import Range from "../util/range"
import Rect from "../util/rect"


export enum MouseAction
{
    None,
    Pan,
    SelectCursor,
    SelectRect,
    Pencil,
    DragTime,
    DragRow,
    DragTimeAndRow,
    DragTrackHeader,
    DragTrackControl,
    StretchTimeStart,
    StretchTimeEnd,
    DragClone,
}


export enum TrackControl
{
    None,
    Volume,
    Pan,
    Mute,
    Solo,
}


export enum Mode
{
    Project,
    NoteBlock,
}


export interface ModeStack
{
    mode: Mode
    modeNoteBlockId: Project.ID

    trackScroll: number
}


export interface State
{
    modeStack: ModeStack[]
    mode: Mode
    modeNoteBlockId: Project.ID

    renderRect: Rect

    trackHeaderW: number
    trackControlX: number
    trackControlY: number
    trackControlSize: number

    tracks: Timeline.TimelineTrack[]
    trackScroll: number
    trackScrollLocked: boolean

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
        trackIndex1: number
        trackIndex2: number
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
            trackScroll: number
            trackYScroll: number
            project: Project.Root
        }

        xLocked: boolean
        yLocked: boolean

        posDelta: { x: number, y: number }
        timeDelta: Rational
        rowDelta: number
        trackDelta: number
        trackInsertionBefore: number

        elemId: Project.ID
        notePreviewLast: number | null
    }

    insertion:
    {
        nearMidiPitch: number
        duration: Rational
    }

    hover: HoverData | null
    hoverControl: TrackControl
    selection: Immutable.Set<Project.ID>

    needsKeyFinish: boolean
    rangeSelectOriginTrackIndex: number
}


export interface Point
{
    pos: { x: number, y: number }
    time: Rational
    row: number
    trackIndex: number
    trackPos: { x: number, y: number }
    originTrackPos: { x: number, y: number }
}


export interface HoverData
{
    id: Project.ID
    range: Range
    action: MouseAction
}


export function init(): State
{
    return {
        modeStack: [],
        mode: Mode.Project,
        modeNoteBlockId: -1,

        renderRect: new Rect(0, 0, 0, 0),

        trackHeaderW: 200,
        trackControlX: 10,
        trackControlY: 25,
        trackControlSize: 20,
        
        tracks: [],
        trackScroll: -40,
        trackScrollLocked: true,

        timeScroll: -2.5,
        timeScale: 100,
        timeSnap: new Rational(1, 8),
        timeSnapBase: new Rational(1, 16),

        noteRowH: 15,

        cursor:
        {
            visible: true,
            time1: new Rational(0),
            time2: new Rational(0),
            trackIndex1: 0,
            trackIndex2: 0,
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
                trackIndex: 0,
                trackPos: { x: 0, y: 0 },
                originTrackPos: { x: 0, y: 0 },
            },
            
            pointPrev:
            {
                pos: { x: 0, y: 0 },
                time: new Rational(0),
                row: 0,
                trackIndex: 0,
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
            trackDelta: 0,
            trackInsertionBefore: -1,

            elemId: -1,
            notePreviewLast: null,
        },

        insertion:
        {
            nearMidiPitch: 60,
            duration: new Rational(1, 4),
        },
        
        hover: null,
        hoverControl: TrackControl.None,

        selection: Immutable.Set<Project.ID>(),

        needsKeyFinish: false,
        rangeSelectOriginTrackIndex: -1,
    }
}


export function resize(state: Timeline.State, rect: Rect)
{
    state.renderRect = rect
    refreshTracks(state)
}


export function reset(state: Timeline.State)
{
    state.trackScroll = -40
    state.trackScrollLocked = true

    state.timeScroll = -2.5
    state.timeScale = 100
    state.timeSnap = new Rational(1, 8)
    state.timeSnapBase = new Rational(1, 16)
}


export function rewind(state: Timeline.State)
{
    state.cursor.visible = true
    state.cursor.time1 = state.cursor.time2 = Project.global.project.range.start
    Playback.setStartTime(Project.global.project.range.start)
    scrollTimeIntoView(state, state.cursor.time1)
}


export function refreshTracks(state: Timeline.State)
{
    const tracks: Timeline.TimelineTrack[] = []

    for (let t = 0; t < Project.global.project.tracks.length; t++)
    {
        const track = Project.global.project.tracks[t]
        if (track.trackType == "notes")
        {
            if (state.mode == Mode.NoteBlock)
            {
                const noteBlock = Project.global.project.elems.get(state.modeNoteBlockId)
                if (noteBlock && track.id == noteBlock.parentId)
                {
                    tracks.push(new Timeline.TimelineTrackNotes(track.id, state.modeNoteBlockId, track.name, 0))
                    tracks.push(new Timeline.TimelineTrackNoteVolumes(track.id, state.modeNoteBlockId, 80))
                }
            }
            else
                tracks.push(new Timeline.TimelineTrackNoteBlocks(track.id, track.name, 50))
        }
        else if (track.trackType == "chords")
        {
            tracks.push(new Timeline.TimelineTrackChords(track.id, track.name, 50))
        }
        else if (track.trackType == "keyChanges")
        {
            tracks.push(new Timeline.TimelineTrackKeyChanges(track.id, track.name, 25))
        }
        else if (track.trackType == "meterChanges")
        {
            tracks.push(new Timeline.TimelineTrackMeterChanges(track.id, track.name, 25))
        }
    }

    for (let t = 0; t < tracks.length; t++)
        tracks[t].copyState(state)

    state.trackScrollLocked = false

    let fixedH = 0
    for (let t = 0; t < tracks.length; t++)
    {
        if (tracks[t].renderRect.h > 0)
            fixedH += tracks[t].renderRect.h
    }

    for (let t = 0; t < tracks.length; t++)
    {
        if (tracks[t].renderRect.h == 0)
        {
            tracks[t].renderRect.h = state.renderRect.h - fixedH
            state.trackScroll = 0
            state.trackScrollLocked = true
        }
    }

    let y = 0
    for (let t = 0; t < tracks.length; t++)
    {
        tracks[t].renderRect.y = y
        y += tracks[t].renderRect.h
    }

    state.tracks = tracks
}


export function modeStackPush(state: Timeline.State)
{
    const newStack =
    {
        mode: state.mode,
        modeNoteBlockId: state.modeNoteBlockId,
        trackScroll: state.trackScroll,
    }

    state.modeStack.push(newStack)
    selectionClear(state)
}


export function modeStackPop(state: Timeline.State, index?: number)
{
    if (state.modeStack.length == 0)
        return

    if (index !== undefined)
    {
        if (index >= state.modeStack.length)
            return

        while (state.modeStack.length > index + 1)
            state.modeStack.pop()
    }
    
    const stackElem = state.modeStack.pop()!

    state.mode = stackElem.mode
    state.modeNoteBlockId = stackElem.modeNoteBlockId
    state.trackScroll = stackElem.trackScroll

    selectionClear(state)
}


export function scrollTimeIntoView(state: Timeline.State, time: Rational)
{
    const range = visibleTimeRange(state)
    const marginPixels = 100
    const marginTime = Rational.fromFloat(marginPixels / state.timeScale, 10000)
    if (time.compare(range.end.subtract(marginTime)) >= 0)
    {
        state.timeScroll =
            time.asFloat() -
            (state.renderRect.w - state.trackHeaderW + marginPixels) / state.timeScale
    }
    else if (time.compare(range.start.add(marginTime)) <= 0)
    {
        state.timeScroll =
            time.asFloat() -
            (state.trackHeaderW + marginPixels) / state.timeScale
    }
}


export function scrollPlaybackTimeIntoView(state: Timeline.State)
{
    if (!Playback.global.playing) 
        return

    if (state.mouse.down)
        return

    const range = visibleTimeRange(state)
    const marginPixels = 100
    const marginTime = Rational.fromFloat(marginPixels / state.timeScale, 10000)
    if (Playback.global.playTime.compare(range.end.subtract(marginTime)) >= 0 ||
        Playback.global.playTime.compare(range.start.add(marginTime)) <= 0)
    {
        state.timeScroll =
            Playback.global.playTime.asFloat() -
            (state.trackHeaderW + marginPixels) / state.timeScale
    }
}


export function xAtTime(state: Timeline.State, time: Rational): number
{
    return (time.asFloat() - state.timeScroll) * state.timeScale
}


export function timeAtX(state: Timeline.State, x: number, timeSnap?: Rational): Rational
{
    timeSnap = timeSnap || state.timeSnap
    const time = x / state.timeScale + state.timeScroll
    return Rational.fromFloat(time, timeSnap.denominator)
}


export function timeRangeAtX(state: Timeline.State, x1: number, x2: number, timeSnap?: Rational)
{
    timeSnap = timeSnap || state.timeSnap
    return new Range(
        timeAtX(state, x1, timeSnap).subtract(timeSnap),
        timeAtX(state, x2, timeSnap).add(timeSnap))
}


export function trackY(state: Timeline.State, trackIndex: number): number
{
    if (trackIndex < 0 || trackIndex >= state.tracks.length)
        return 0
    
    return state.tracks[trackIndex].renderRect.y - state.trackScroll
}


export function trackAtY(state: Timeline.State, y: number): number | null
{
    y += state.trackScroll

    if (y < 0)
        return null

    for (let t = 0; t < state.tracks.length; t++)
    {
        const track = state.tracks[t]

        if (y >= track.renderRect.y && y <= track.renderRect.y + track.renderRect.h)
            return t
    }

    return null
}


export function trackAtYClamped(state: Timeline.State, y: number): number
{
    y += state.trackScroll

    if (y < 0)
        return 0

    for (let t = 0; t < state.tracks.length; t++)
    {
        const track = state.tracks[t]

        if (y >= track.renderRect.y && y <= track.renderRect.y + track.renderRect.h)
            return t
    }

    return state.tracks.length - 1
}


export function trackInsertionAtY(state: Timeline.State, y: number): number
{
    y += state.trackScroll

    if (y < 0)
        return 0

    for (let t = 0; t < state.tracks.length; t++)
    {
        const track = state.tracks[t]

        if (y <= track.renderRect.y + track.renderRect.h / 2)
            return t
    }

    return state.tracks.length
}


export function trackControlAtPoint(
    state: Timeline.State,
    trackIndex: number,
    pos: { x: number, y: number })
    : TrackControl
{
    const projTrack = Project.getElem(Project.global.project, state.tracks[trackIndex].projectTrackId, "track")
    if (!projTrack)
        return TrackControl.None

    if (pos.y < state.trackControlY || pos.y > state.trackControlY + state.trackControlSize)
        return TrackControl.None

    const xSlot = Math.floor((pos.x - state.trackControlX) / state.trackControlSize)
    if (xSlot < 0)
        return TrackControl.None

    switch (projTrack.trackType)
    {
        case "notes":
        case "chords":
        {
            switch (xSlot)
            {
                case 0:
                case 1: return TrackControl.Volume
                //case 1: return TrackControl.Pan
                case 7: return TrackControl.Mute
                case 8: return TrackControl.Solo
            }
        }
    }

    return TrackControl.None
}


export function rectForTrack(state: Timeline.State, trackIndex: number): Rect | null
{
    let y = 0
    for (let t = 0; t < state.tracks.length; t++)
    {
        const h = state.tracks[t].renderRect.h

        if (t == trackIndex)
        {
            return new Rect(
                state.trackHeaderW,
                y,
                state.renderRect.w - state.trackHeaderW,
                h)
        }

        y += h
    }

    return null
}


export function pointAt(state: Timeline.State, pos: { x: number, y: number }): Point
{
    const trackIndex = trackAtYClamped(state, pos.y)
    const time = timeAtX(state, pos.x)
    
    const trackPosY = pos.y - trackY(state, state.mouse.point.trackIndex)
    const trackPos = { x: pos.x, y: trackPosY }

    const row = state.tracks[trackIndex].rowAtY(state, trackPosY)

    let originTrackPos = trackPos
    if (state.drag.origin)
    {
        const originTrackPosY = pos.y - trackY(state, state.drag.origin.point.trackIndex)
        originTrackPos = { x: pos.x, y: originTrackPosY }
    }
    
    return {
        pos,
        time,
        trackIndex,
        trackPos,
        row,
        originTrackPos,
    }
}
    

export function selectionClear(state: Timeline.State)
{
    state.selection = state.selection.clear()
}


export function selectionRange(state: Timeline.State): Range | null
{
    return Project.getRangeForElems(Project.global.project, state.selection)
}


export function selectionToggleHover(
    state: Timeline.State,
    hover: HoverData,
    selectMultiple: boolean)
{
    const alreadySelected = state.selection.has(hover.id)

    if (!selectMultiple && !alreadySelected)
        selectionClear(state)

    if (!alreadySelected || !selectMultiple)
        state.selection = state.selection.add(hover.id)
    else
        state.selection = state.selection.remove(hover.id)

    state.drag.origin.range = selectionRange(state)
    state.mouse.action = hover.action
}


export function selectionAdd(state: Timeline.State, id: Project.ID)
{
    state.selection = state.selection.add(id)
}


export function selectionAddAtCursor(state: Timeline.State)
{
    const trackMin = Math.min(state.cursor.trackIndex1, state.cursor.trackIndex2)
    const trackMax = Math.max(state.cursor.trackIndex1, state.cursor.trackIndex2)
    
    const time1 = state.cursor.time1
    const time2 = state.cursor.time2
    if (time1.compare(time2) != 0)
    {
        const range = new Range(time1, time2, false, false).sorted()

        for (let t = trackMin; t <= trackMax; t++)
        {
            for (const id of state.tracks[t].elemsAtRegion(state, range))
                selectionAdd(state, id)
        }
    }
}


export function deleteElems(state: Timeline.State, elemIds: Iterable<Project.ID>)
{
    const range = Project.getRangeForElems(Project.global.project, elemIds) ||
        new Range(state.cursor.time1, state.cursor.time1)

    for (const id of elemIds)
    {
        const elem = Project.global.project.elems.get(id)
        if (!elem)
            continue

        if (elem.type == "track")
            continue

        const removeElem = Project.elemModify(elem, { parentId: -1 })
        Project.global.project = Project.upsertElement(Project.global.project, removeElem)
    }
    
    for (const id of elemIds)
    {
        const track = Project.global.project.elems.get(id)
        if (!track)
            continue

        if (track.type != "track")
            continue

        if (track.id === Project.global.project.keyChangeTrackId ||
            track.id === Project.global.project.meterChangeTrackId ||
            track.id === Project.global.project.chordTrackId)
            continue

        Project.global.project = Project.upsertTrack(Project.global.project, track, true)
    }

    Project.global.project = Project.withRefreshedRange(Project.global.project)
    state.cursor.visible = true
    cursorSetTime(state, range.start, range.start)
    scrollTimeIntoView(state, range.start)
}


export function selectionCopy(state: Timeline.State)
{
    const copiedData: Project.CopiedData =
    {
        project: Project.global.project,
        elemsByTrack: [],
    }

    for (let tr = 0; tr < state.tracks.length; tr++)
        copiedData.elemsByTrack.push([])

    for (const elemId of state.selection)
    {
        const elem = Project.global.project.elems.get(elemId)
        if (!elem || elem.type == "track")
            continue
        
        const trackIndex = state.tracks.findIndex(tr => tr.parentId == elem.parentId)
        if (trackIndex < 0)
            continue

        copiedData.elemsByTrack[trackIndex].push(elem)
    }

    while (copiedData.elemsByTrack.length > 0 && copiedData.elemsByTrack[0].length == 0)
        copiedData.elemsByTrack.shift()

    let copiedRange: Range | null = null
    for (let ctr = 0; ctr < copiedData.elemsByTrack.length; ctr++)
    {
        const copiedTrack = copiedData.elemsByTrack[ctr]

        for (const elem of copiedTrack)
        {
            copiedRange =
                Project.getAbsoluteRange(copiedData.project, elem.parentId, elem.range)
                .merge(copiedRange)
        }
    }

    if (!copiedRange)
        return
        
    cursorSetTime(state, copiedRange.end, copiedRange.end)
    Project.global.copiedData = copiedData

    //console.log("copy", copiedData)
}


export function paste(state: Timeline.State)
{
    const copiedData = Project.global.copiedData
    if (!copiedData)
        return

    const pasteToTime = state.cursor.time1.min(state.cursor.time2)
    const pasteToTrackIndex = Math.min(state.cursor.trackIndex1, state.cursor.trackIndex2)

    let copiedRange: Range | null = null
    for (let ctr = 0; ctr < copiedData.elemsByTrack.length; ctr++)
    {
        const copiedTrack = copiedData.elemsByTrack[ctr]

        for (const elem of copiedTrack)
        {
            copiedRange =
                Project.getAbsoluteRange(copiedData.project, elem.parentId, elem.range)
                .merge(copiedRange)
        }
    }

    if (!copiedRange)
        return
        
    //console.log("paste", copiedData, copiedRange)
    
    selectionClear(state)

    let newProject = Project.global.project
    let maxAffectedTrackIndex = pasteToTrackIndex

    for (let ctr = 0; ctr < copiedData.elemsByTrack.length; ctr++)
    {
        const copiedTrack = copiedData.elemsByTrack[ctr]

        for (const elem of copiedTrack)
        {
            const pasteTrackIndex = state.tracks
                .slice(pasteToTrackIndex + ctr)
                .findIndex(tr => tr.acceptedElemTypes.has(elem.type))

            if (pasteTrackIndex < 0)
                continue

            const copyToTrack = state.tracks[pasteToTrackIndex + ctr + pasteTrackIndex]
            maxAffectedTrackIndex = Math.max(maxAffectedTrackIndex, pasteToTrackIndex + ctr + pasteTrackIndex)

            const absRange = Project.getAbsoluteRange(copiedData.project, elem.parentId, elem.range)
            const newAbsRange = absRange.subtract(copiedRange.start).displace(pasteToTime)
            const newRelRange = Project.getRelativeRange(newProject, copyToTrack.parentId, newAbsRange)

            const newElemId = newProject.nextId
            newProject = Project.cloneElem(copiedData.project, elem, newProject)

            const newElem =
            {
                ...elem,
                id: newElemId,
                parentId: copyToTrack.parentId,
                range: newRelRange,
            }

            //console.log("paste elem", elem, newElem)

            newProject = Project.upsertElement(newProject, newElem)
            selectionAdd(state, newElemId)
        }
    }

    const newCursorTime = pasteToTime.add(copiedRange.duration)
    cursorSetTime(state, newCursorTime, newCursorTime)
    cursorSetTrack(state, pasteToTrackIndex, maxAffectedTrackIndex)
    scrollTimeIntoView(state, newCursorTime)
    
    Project.global.project = Project.withRefreshedRange(newProject)
    Project.global.project = Project.global.project
    selectionRemoveConflictingBehind(state)
}


export function cursorSetTime(
    state: Timeline.State,
    time1: Rational | null,
    time2?: Rational | null)
{
    state.cursor.time1 = time1 || state.cursor.time1
    state.cursor.time2 = time2 || state.cursor.time2
}


export function cursorSetTrack(
    state: Timeline.State,
    trackIndex1: number | null,
    trackIndex2?: number | null)
{
    state.cursor.trackIndex1 =
        Math.max(0, Math.min(state.tracks.length - 1,
            trackIndex1 ?? state.cursor.trackIndex1))

    state.cursor.trackIndex2 = 
        Math.max(0, Math.min(state.tracks.length - 1,
            trackIndex2 ?? state.cursor.trackIndex2))
}


export function cursorSetTrackByParentId(
    state: Timeline.State,
    parentId: Project.ID)
{
    const trackIndex = state.tracks.findIndex(tr => tr.parentId === parentId)
    if (trackIndex < 0)
        return

    state.cursor.trackIndex1 = state.cursor.trackIndex2 = trackIndex
}


export function findPreviousAnchor(
    state: Timeline.State,
    time: Rational,
    trackIndex1: number,
    trackIndex2: number)
    : Rational
{
    let prevAnchor: Rational | null = null
    
    const trackMin = Math.min(trackIndex1, trackIndex2)
    const trackMax = Math.max(trackIndex1, trackIndex2)
    
    for (let tr = Math.max(0, trackMin); tr <= Math.min(state.tracks.length - 1, trackMax); tr++)
    {
        const anchor = state.tracks[tr].findPreviousAnchor(state, time)
        prevAnchor = Rational.max(prevAnchor, anchor)
    }

    if (!prevAnchor)
        return Project.global.project.range.start
    
    return prevAnchor
}


export function deleteRange(
    state: Timeline.State,
    range: Range,
    trackIndex1: number,
    trackIndex2: number)
{
    const trackMin = Math.min(trackIndex1, trackIndex2)
    const trackMax = Math.max(trackIndex1, trackIndex2)
    
    for (let tr = Math.max(0, trackMin); tr <= Math.min(state.tracks.length - 1, trackMax); tr++)
        state.tracks[tr].deleteRange(state, range)
}

	
export function selectionRemoveConflictingBehind(state: Timeline.State)
{
    for (let tr = 0; tr < state.tracks.length; tr++)
        state.tracks[tr].selectionRemoveConflictingBehind(state)
}


export function keyHandlePendingFinish(state: Timeline.State)
{
    if (!state.needsKeyFinish)
        return

    state.needsKeyFinish = false

    selectionRemoveConflictingBehind(state)
}


export function insertNote(state: Timeline.State, time: Rational, chroma: number)
{
    keyHandlePendingFinish(state)

    const track = state.tracks[state.cursor.trackIndex1]
    if (!(track instanceof Timeline.TimelineTrackNotes))
        return

    const noteBlock = Project.getElem(Project.global.project, track.parentId, "noteBlock")
    if (!noteBlock)
        return

    const insertOctave = Math.floor(state.insertion.nearMidiPitch / 12)
    const possiblePitches = [-1, 0, 1].map(offset =>
    {
        const pitch = (insertOctave + offset) * 12 + (MathUtils.mod(chroma, 12))
        const delta = Math.abs(pitch - state.insertion.nearMidiPitch)
        return { pitch, delta }
    })

    possiblePitches.sort((a, b) => a.delta - b.delta)
    const chosenPitch = possiblePitches[0].pitch

    const range = new Range(time, time.add(state.insertion.duration))
    const volumeDb = 0
    const velocity = 1
        
    const note = Project.makeNote(
        noteBlock.id,
        range.subtract(noteBlock.range.start),
        chosenPitch, volumeDb, velocity)

    let project = Project.global.project
    const id = project.nextId
    project = Project.upsertElement(project, note)
    project = Project.withRefreshedRange(project)
    Project.global.project = project

    state.insertion.nearMidiPitch = chosenPitch

    state.cursor.visible = false
    cursorSetTime(state, range.end, range.end)
    scrollTimeIntoView(state, range.end)
    selectionClear(state)
    selectionAdd(state, id)
    Playback.playNotePreview(noteBlock.parentId, chosenPitch, volumeDb, velocity)
    selectionRemoveConflictingBehind(state)
}


export function insertChord(state: Timeline.State, time: Rational, chord: Theory.Chord)
{
    keyHandlePendingFinish(state)

    const track = state.tracks[state.cursor.trackIndex1]
    if (!(track instanceof Timeline.TimelineTrackChords))
        return

    const range = new Range(time, time.add(state.insertion.duration))
    const volumeDb = 0
    const velocity = 1
        
    const projChord = Project.makeChord(
        track.projectTrackId,
        range,
        chord)

    let project = Project.global.project
    const id = project.nextId
    project = Project.upsertElement(project, projChord)
    project = Project.withRefreshedRange(project)
    Project.global.project = project

    state.cursor.visible = false
    cursorSetTime(state, range.end, range.end)
    scrollTimeIntoView(state, range.end)
    selectionClear(state)
    selectionAdd(state, id)
    Playback.playChordPreview(track.projectTrackId, chord, volumeDb, velocity)
    selectionRemoveConflictingBehind(state)
}


export function insertNoteBlock(state: Timeline.State, time: Rational): Project.ID | null
{
    keyHandlePendingFinish(state)

    const track = state.tracks[state.cursor.trackIndex1]
    if (!(track instanceof Timeline.TimelineTrackNoteBlocks))
        return null

    let endTime = time.add(new Rational(4))

    const list = Project.global.project.lists.get(track.projectTrackId)
    if (list)
    {
        for (const elem of list.iterAtRange(new Range(time, endTime)))
            endTime = endTime.min(elem.range.start)
    }

    if (endTime.compare(time) <= 0)
        return null

    const noteBlock = Project.makeNoteBlock(
        track.projectTrackId,
        new Range(time, endTime))

    let project = Project.global.project
    const id = project.nextId
    project = Project.upsertElement(project, noteBlock)
    project = Project.withRefreshedRange(project)
    Project.global.project = project

    scrollTimeIntoView(state, time)
    selectionClear(state)
    selectionAdd(state, id)
    selectionRemoveConflictingBehind(state)
    return id
}


export function visibleTimeRange(state: Timeline.State): Range
{
    return new Range(
        timeAtX(state, state.trackHeaderW).subtract(state.timeSnap),
        timeAtX(state, state.renderRect.w).add(state.timeSnap))
}