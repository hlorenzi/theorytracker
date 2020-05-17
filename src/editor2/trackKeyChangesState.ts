import TrackState from "./trackState"
import Rational from "../util/rational"


export default interface TrackKeyChangesState extends TrackState
{
    draw: null |
    {
        time: Rational
    }
}