import Immutable from "immutable"
import * as Project from "../project"
import * as Playback from "../playback"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Theory from "../theory"
import * as Dockable from "../dockable"
import Rational from "../util/rational"
import { RefState } from "../util/refState"
import Range from "../util/range"
import Rect from "../util/rect"
import { EditorTrack } from "./track"
import { EditorTrackKeyChanges } from "./trackKeyChanges"
import { EditorTrackMeterChanges } from "./trackMeterChanges"
import { EditorTrackNoteBlocks } from "./trackNoteBlocks"
import { EditorTrackNotes } from "./trackNotes"
import { EditorTrackNoteVelocities } from "./trackNoteVelocities"


export enum EditorAction
{
    None = 0x00,
    Pan = 0x01,
    SelectCursor = 0x02,
    SelectRect = 0x04,
    Pencil = 0x08,
    DragTime = 0x10,
    DragRow = 0x20,
    DragTrack = 0x40,
    DragTrackHeader = 0x80,
    StretchTimeStart = 0x100,
    StretchTimeEnd = 0x200,
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


export interface EditorState
{
    modeStack: ModeStack[]
    mode: Mode
    modeNoteBlockId: Project.ID

    renderRect: Rect

    trackHeaderW: number

    tracks: EditorTrack[]
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

        action: EditorAction

        point: EditorPoint
        pointPrev: EditorPoint

        wheelDate: Date
    }

    drag:
    {
        origin:
        {
            point: EditorPoint
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

    hover: EditorHover | null
    selection: Immutable.Set<Project.ID>
}


export interface EditorPoint
{
    pos: { x: number, y: number }
    time: Rational
    row: number
    trackIndex: number
    trackPos: { x: number, y: number }
    originTrackPos: { x: number, y: number }
}


export interface EditorHover
{
    id: Project.ID
    range: Range
    action: EditorAction
}


export interface EditorUpdateData
{
    state: EditorState
    prefs: Prefs.Prefs
    project: Project.Root
    playback: Playback.PlaybackContextProps,
    ctx: CanvasRenderingContext2D
    popup: RefState<Popup.PopupContextProps>
    dockable: RefState<Dockable.DockableContextProps>
}


export function init(): EditorState
{
    return {
        modeStack: [],
        mode: Mode.Project,
        modeNoteBlockId: -1,

        renderRect: new Rect(0, 0, 0, 0),

        trackHeaderW: 200,
        
        tracks: [],
        trackScroll: 0,
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

            action: EditorAction.None,
            
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
        
        hover: null,

        selection: Immutable.Set<Project.ID>()
    }
}


export function resize(data: EditorUpdateData, rect: Rect)
{
    data.state.renderRect = rect
    refreshTracks(data)
}


export function rewind(data: EditorUpdateData)
{
    data.state.cursor.visible = true
    data.state.cursor.time1 = data.state.cursor.time2 = new Rational(0)
    data.playback.setStartTime(new Rational(0))
    scrollTimeIntoView(data, data.state.cursor.time1)
}


export function refreshTracks(data: EditorUpdateData)
{
    const tracks: EditorTrack[] = []

    for (let t = 0; t < data.project.tracks.length; t++)
    {
        const track = data.project.tracks[t]
        if (track.trackType == "notes")
        {
            if (data.state.mode == Mode.NoteBlock)
            {
                const noteBlock = data.project.elems.get(data.state.modeNoteBlockId)
                if (noteBlock && track.id == noteBlock.parentId)
                {
                    tracks.push(new EditorTrackNotes(track.id, data.state.modeNoteBlockId, track.name, 0))
                    tracks.push(new EditorTrackNoteVelocities(track.id, data.state.modeNoteBlockId, 80))
                }
            }
            else
                tracks.push(new EditorTrackNoteBlocks(track.id, track.name, 60))
        }
        else if (track.trackType == "keyChanges")
        {
            tracks.push(new EditorTrackKeyChanges(track.id, track.name, 25))
        }
        else if (track.trackType == "meterChanges")
        {
            tracks.push(new EditorTrackMeterChanges(track.id, track.name, 25))
        }
    }

    for (let t = 0; t < tracks.length; t++)
        tracks[t].copyState(data)

    data.state.trackScrollLocked = false

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
            tracks[t].renderRect.h = data.state.renderRect.h - fixedH
            data.state.trackScroll = 0
            data.state.trackScrollLocked = true
        }
    }

    let y = 0
    for (let t = 0; t < tracks.length; t++)
    {
        tracks[t].renderRect.y = y
        y += tracks[t].renderRect.h
    }

    data.state.tracks = tracks
}


export function modeStackPush(data: EditorUpdateData)
{
    const newStack =
    {
        mode: data.state.mode,
        modeNoteBlockId: data.state.modeNoteBlockId,
        trackScroll: data.state.trackScroll,
    }

    data.state.modeStack.push(newStack)
    selectionClear(data)
}


export function modeStackPop(data: EditorUpdateData, index?: number)
{
    if (data.state.modeStack.length == 0)
        return

    if (index !== undefined)
    {
        if (index >= data.state.modeStack.length)
            return

        while (data.state.modeStack.length > index + 1)
            data.state.modeStack.pop()
    }
    
    const stackElem = data.state.modeStack.pop()!

    data.state.mode = stackElem.mode
    data.state.modeNoteBlockId = stackElem.modeNoteBlockId
    data.state.trackScroll = stackElem.trackScroll

    selectionClear(data)
}


export function scrollTimeIntoView(data: EditorUpdateData, time: Rational)
{
    const range = visibleTimeRange(data)
    const marginPixels = 100
    const marginTime = Rational.fromFloat(marginPixels / data.state.timeScale, 10000)
    if (time.compare(range.end.subtract(marginTime)) >= 0)
    {
        data.state.timeScroll =
            time.asFloat() -
            (data.state.renderRect.w - data.state.trackHeaderW + marginPixels) / data.state.timeScale
    }
    else if (time.compare(range.start.add(marginTime)) <= 0)
    {
        data.state.timeScroll =
            time.asFloat() -
            (data.state.trackHeaderW + marginPixels) / data.state.timeScale
    }
}


export function scrollPlaybackTimeIntoView(data: EditorUpdateData)
{
    if (!data.playback.playing) 
        return

    if (data.state.mouse.down)
        return

    const range = visibleTimeRange(data)
    const marginPixels = 100
    const marginTime = Rational.fromFloat(marginPixels / data.state.timeScale, 10000)
    if (data.playback.playTime.compare(range.end.subtract(marginTime)) >= 0 ||
        data.playback.playTime.compare(range.start.add(marginTime)) <= 0)
    {
        data.state.timeScroll =
            data.playback.playTime.asFloat() -
            (data.state.trackHeaderW + marginPixels) / data.state.timeScale
    }
}


export function xAtTime(data: EditorUpdateData, time: Rational): number
{
    return (time.asFloat() - data.state.timeScroll) * data.state.timeScale
}


export function timeAtX(data: EditorUpdateData, x: number, timeSnap?: Rational): Rational
{
    timeSnap = timeSnap || data.state.timeSnap
    const time = x / data.state.timeScale + data.state.timeScroll
    return Rational.fromFloat(time, timeSnap.denominator)
}


export function timeRangeAtX(data: EditorUpdateData, x1: number, x2: number, timeSnap?: Rational)
{
    timeSnap = timeSnap || data.state.timeSnap
    return new Range(
        timeAtX(data, x1, timeSnap).subtract(timeSnap),
        timeAtX(data, x2, timeSnap).add(timeSnap))
}


export function trackY(data: EditorUpdateData, trackIndex: number): number
{
    if (trackIndex < 0 || trackIndex >= data.state.tracks.length)
        return 0
    
    return data.state.tracks[trackIndex].renderRect.y - data.state.trackScroll
}


export function trackAtY(data: EditorUpdateData, y: number): number | null
{
    y += data.state.trackScroll

    if (y < 0)
        return null

    for (let t = 0; t < data.state.tracks.length; t++)
    {
        const track = data.state.tracks[t]

        if (y >= track.renderRect.y && y <= track.renderRect.y + track.renderRect.h)
            return t
    }

    return null
}


export function trackAtYClamped(data: EditorUpdateData, y: number): number
{
    y += data.state.trackScroll

    if (y < 0)
        return 0

    for (let t = 0; t < data.state.tracks.length; t++)
    {
        const track = data.state.tracks[t]

        if (y >= track.renderRect.y && y <= track.renderRect.y + track.renderRect.h)
            return t
    }

    return data.state.tracks.length - 1
}


export function trackInsertionAtY(data: EditorUpdateData, y: number): number
{
    y += data.state.trackScroll

    if (y < 0)
        return 0

    for (let t = 0; t < data.state.tracks.length; t++)
    {
        const track = data.state.tracks[t]

        if (y <= track.renderRect.y + track.renderRect.h / 2)
            return t
    }

    return data.state.tracks.length
}


export function rectForTrack(data: EditorUpdateData, trackIndex: number): Rect | null
{
    let y = 0
    for (let t = 0; t < data.state.tracks.length; t++)
    {
        const h = data.state.tracks[t].renderRect.h

        if (t == trackIndex)
        {
            return new Rect(
                data.state.trackHeaderW,
                y,
                data.state.renderRect.w - data.state.trackHeaderW,
                h)
        }

        y += h
    }

    return null
}


export function pointAt(data: EditorUpdateData, pos: { x: number, y: number }): EditorPoint
{
    const trackIndex = trackAtYClamped(data, pos.y)
    const time = timeAtX(data, pos.x)
    
    const trackPosY = pos.y - trackY(data, data.state.mouse.point.trackIndex)
    const trackPos = { x: pos.x, y: trackPosY }

    const row = data.state.tracks[trackIndex].rowAtY(data, trackPosY)

    let originTrackPos = trackPos
    if (data.state.drag.origin)
    {
        const originTrackPosY = pos.y - trackY(data, data.state.drag.origin.point.trackIndex)
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
    

export function keyAt(data: EditorUpdateData, trackId: Project.ID, time: Rational): Theory.Key
{
    const keyChangeTrackId = Project.keyChangeTrackId(data.project)
    const keyChangeTrackTimedElems = data.project.lists.get(keyChangeTrackId)
    if (!keyChangeTrackTimedElems)
        return defaultKey()
        
    const keyCh = keyChangeTrackTimedElems.findActiveAt(time)
    if (keyCh)
        return (keyCh as Project.KeyChange).key

    const firstKeyCh = keyChangeTrackTimedElems.findFirst()
    if (firstKeyCh)
        return (firstKeyCh as Project.KeyChange).key
        
    return defaultKey()
}


export function meterAt(data: EditorUpdateData, trackId: Project.ID, time: Rational): Theory.Meter
{
    const meterChangeTrackId = Project.meterChangeTrackId(data.project)
    const meterChangeTrackTimedElems = data.project.lists.get(meterChangeTrackId)
    if (!meterChangeTrackTimedElems)
        return defaultMeter()
        
    const meterCh = meterChangeTrackTimedElems.findActiveAt(time)
    if (meterCh)
        return (meterCh as Project.MeterChange).meter

    const firstMeterCh = meterChangeTrackTimedElems.findFirst()
    if (firstMeterCh)
        return (firstMeterCh as Project.MeterChange).meter
        
    return defaultMeter()
}


export function selectionClear(data: EditorUpdateData)
{
    data.state.selection = data.state.selection.clear()
}


export function selectionRange(data: EditorUpdateData): Range | null
{
    let range: Range | null = null

    for (const id of data.state.selection)
    {
        const elem = data.project.elems.get(id) as Project.Element
        if (!elem)
            continue

        if (elem.type == "track")
            continue

        range = Range.merge(range, elem.range)
    }

    return range
}


export function selectionToggleHover(
    data: EditorUpdateData,
    hover: EditorHover,
    selectMultiple: boolean)
{
    const alreadySelected = data.state.selection.has(hover.id)

    if (!selectMultiple && !alreadySelected)
        selectionClear(data)

    if (!alreadySelected || !selectMultiple)
        data.state.selection = data.state.selection.add(hover.id)
    else
        data.state.selection = data.state.selection.remove(hover.id)

    data.state.drag.origin.range = selectionRange(data)
    data.state.mouse.action = hover.action
}


export function selectionAdd(data: EditorUpdateData, id: Project.ID)
{
    data.state.selection = data.state.selection.add(id)
}


export function selectionAddAtCursor(data: EditorUpdateData)
{
    const trackMin = Math.min(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)
    const trackMax = Math.max(data.state.cursor.trackIndex1, data.state.cursor.trackIndex2)
    
    const time1 = data.state.cursor.time1
    const time2 = data.state.cursor.time2
    if (time1.compare(time2) != 0)
    {
        const range = new Range(time1, time2, false, false).sorted()

        for (let t = trackMin; t <= trackMax; t++)
        {
            for (const id of data.state.tracks[t].elemsAtRegion(data, range))
                selectionAdd(data, id)
        }
    }
}


export function visibleTimeRange(data: EditorUpdateData): Range
{
    return new Range(
        timeAtX(data, data.state.trackHeaderW).subtract(data.state.timeSnap),
        timeAtX(data, data.state.renderRect.w).add(data.state.timeSnap))
}


export function defaultKey(): Theory.Key
{
    return Theory.Key.parse("C Major")
}


export function defaultMeter(): Theory.Meter
{
    return new Theory.Meter(4, 4)
}