import TrackState from "./trackState"
import Rational from "../util/rational"


export default interface TrackMeterChangesState extends TrackState
{
    draw: null |
    {
        time: Rational
    }
}