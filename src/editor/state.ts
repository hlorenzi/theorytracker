import Immutable from "immutable"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Theory from "../theory"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"
import { EditorTrack } from "./track"
import { EditorTrackNoteBlocks } from "./trackNoteBlocks"


export enum EditorAction
{
    None = 0x00,
    Pan = 0x01,
    SelectCursor = 0x02,
    SelectRect = 0x04,
    Draw = 0x08,
    DragTime = 0x10,
    DragRow = 0x20,
    StretchTimeStart = 0x40,
    StretchTimeEnd = 0x80,
}


export interface EditorState
{
    renderRect: Rect

    trackHeaderW: number

    tracks: EditorTrack[]
    trackScroll: number

    timeScroll: number
    timeScale: number
    timeSnap: Rational
    timeSnapBase: Rational

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
            project: Project.Root
        }

        xLocked: boolean
        yLocked: boolean

        posDelta: { x: number, y: number }
        timeDelta: Rational
    }

    hover: EditorHover | null
    selection: Immutable.Set<Project.ID>
}


export interface EditorPoint
{
    pos: { x: number, y: number }
    time: Rational
    trackIndex: number
    trackPos: { x: number, y: number }
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
    ctx: CanvasRenderingContext2D
}


export function init(): EditorState
{
    return {
        renderRect: new Rect(0, 0, 0, 0),

        trackHeaderW: 200,
        
        tracks: [],
        trackScroll: 0,

        timeScroll: -0.5,
        timeScale: 100,
        timeSnap: new Rational(1, 16),
        timeSnapBase: new Rational(1, 16),

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
                trackIndex: 0,
                trackPos: { x: 0, y: 0 },
            },
            
            pointPrev:
            {
                pos: { x: 0, y: 0 },
                time: new Rational(0),
                trackIndex: 0,
                trackPos: { x: 0, y: 0 },
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


export function refreshTracks(data: EditorUpdateData)
{
    const tracks: EditorTrack[] = []

    for (let t = 0; t < data.project.tracks.length; t++)
    {
        const track = data.project.tracks[t]
        if (track.trackType == Project.TrackType.Notes)
        {
            tracks.push(new EditorTrackNoteBlocks(track.id, 120))
        }
    }

    let fixedH = 0
    for (let t = 0; t < tracks.length; t++)
    {
        if (tracks[t].renderRect.h > 0)
            fixedH += tracks[t].renderRect.h
    }

    for (let t = 0; t < tracks.length; t++)
    {
        if (tracks[t].renderRect.h == 0)
            tracks[t].renderRect.h = data.state.renderRect.h - fixedH
    }

    let y = 0
    for (let t = 0; t < tracks.length; t++)
    {
        tracks[t].renderRect.y = y
        y += tracks[t].renderRect.h
    }

    data.state.tracks = tracks
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
    return data.state.tracks[trackIndex].renderRect.y - data.state.trackScroll
}


export function trackAtY(data: EditorUpdateData, y: number): number
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
    const trackIndex = trackAtY(data, pos.y)
    const time = timeAtX(data, pos.x)
    
    const trackPosY = pos.y - trackY(data, data.state.mouse.point.trackIndex)
    const trackPos = { x: pos.x, y: trackPosY }

    return {
        pos,
        time,
        trackIndex,
        trackPos,
    }
}


export function selectionRange(data: EditorUpdateData): Range | null
{
    let range: Range | null = null

    for (const id of data.state.selection)
    {
        const elem = data.project.elems.get(id) as any
        if (!elem)
            continue

        const rangedElem = elem as Project.RangedElement
        range = Range.merge(range, rangedElem.range)
    }

    return range
}


export function visibleTimeRange(data: EditorUpdateData): Range
{
    return new Range(
        timeAtX(data, 0).subtract(data.state.timeSnap),
        timeAtX(data, data.state.renderRect.w).add(data.state.timeSnap))
}