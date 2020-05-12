import TrackState from "./trackState"
import Rational from "../util/rational"


export default interface EditorState
{
    w: number
    h: number

    trackHeaderW: number

    tracks: TrackState[]

    timeScroll: number
    timeScale: number
    timeSnap: Rational

    mouse:
    {
        down: boolean
        downDate: Date
        downOrig:
        {
            pos: { x: number, y: number }
            time: Rational
            timeScroll: number
        }

        action: number

        pos: { x: number, y: number }
        posPrev: { x: number, y: number }
        time: Rational

        hover: null |
        {
            id: number,
            range: Range,
            action: number,
        }

        drag:
        {
            posDelta: { x: number, y: number }
            timeDelta: Rational
        }

        wheelDate: Date
    }
}