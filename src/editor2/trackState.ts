export default interface TrackState
{
    type: string,
    trackIndex: number,
    trackId: number,

    h: number,
    yScroll: number,

    pinned: boolean,
}