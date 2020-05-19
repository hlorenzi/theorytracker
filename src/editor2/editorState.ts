import TrackState from "./trackState"
import Project from "../project/project2"
import Rational from "../util/rational"
import Range from "../util/range"


export default interface EditorState
{
    x: number
    y: number
    w: number
    h: number

    trackHeaderW: number

    tracks: TrackState[]

    timeScroll: number
    timeScale: number
    timeSnap: Rational
    timeSnapBase: Rational

    cursor:
    {
        visible: boolean
        time1: Rational
        time2: Rational
        track1: number
        track2: number
    }

    rectCursor:
    {
        track: number
        time1: Rational
        time2: Rational
        y1: number
        y2: number
    }

    keys: { [key: string]: boolean }

    mouse:
    {
        down: boolean
        downDate: Date

        action: number

        pos: { x: number, y: number }
        posPrev: { x: number, y: number }
        time: Rational
        track: number,
        trackPos: { x: number, y: number }
        trackYRaw: number,
        row: number,

        hover: null |
        {
            id: number,
            range: Range,
            action: number,
        }

        drag:
        {
            xLocked: boolean
            yLocked: boolean
            
            posOrigin: { x: number, y: number }
            timeOrigin: Rational
            timeScrollOrigin: number
            rangeOrigin: Range
            trackOrigin: number
            trackPosOrigin: { x: number, y: number }
            trackYRawOrigin: number
            trackYScrollOrigin: number
            rowOrigin: number
            projectOrigin: Project

            posDelta: { x: number, y: number }
            timeDelta: Rational
            trackPosDelta: { x: number, y: number }
            rowDelta: number
        }

        wheelDate: Date
    }
}