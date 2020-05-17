import TrackState from "./trackState"
import Rational from "../util/rational"


export default interface TrackNotesPreviewState extends TrackState
{
    rowScale: number

    draw: null |
    {
        time1: Rational
        time2: Rational
        pitch: number
    }
}