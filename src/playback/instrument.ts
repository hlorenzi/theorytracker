import * as Playback from "./index"
import * as Project from "../project"
import * as MathUtils from "../utils/mathUtils.ts"
import Range from "../utils/range.ts"


export class Instrument
{
    manager: Playback.Manager


    constructor(manager: Playback.Manager)
    {
        this.manager = manager
    }


    async prepare(noteEvent: Playback.NoteEvent)
    {

    }


    async destroy()
    {

    }


    isFinished()
    {
        return true
    }


    playNote(
        noteEvent: Playback.NoteEvent,
        audioCtxTimestampMs: number,
        outputNode: AudioNode)
    {
        
    }


    stopAll()
    {

    }


    process(
        audioCtxTimestampMs: number,
        deltaTimeMs: number)
    {
        
    }
}