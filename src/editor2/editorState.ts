import TrackState from "./trackState"
import Project from "../project/project2"
import Rational from "../util/rational"
import Range from "../util/range"


export default interface EditorState
{
    w: number
    h: number

    trackHeaderW: number

    tracks: TrackState[]

    timeScroll: number
    timeScale: number
    timeSnap: Rational
    timeSnapBase: Rational

    mouse:
    {
        down: boolean
        downDate: Date

        action: number

        pos: { x: number, y: number }
        posPrev: { x: number, y: number }
        time: Rational
        track: number,
        trackY: number,
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
            trackYOrigin: number
            rowOrigin: number
            projectOrigin: Project

            posDelta: { x: number, y: number }
            timeDelta: Rational
            trackYDelta: number
            rowDelta: number
        }

        wheelDate: Date
    }
}