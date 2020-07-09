import TrackState from "./trackState"
import Rational from "../util/rational"


export default interface TrackNotesState extends TrackState
{
    rowScale: number

    draw: null |
    {
        time1: Rational
        time2: Rational
        pitch: number
    }
}