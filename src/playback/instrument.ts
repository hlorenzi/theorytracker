import * as Playback from "./index"
import * as Project from "../project"
import * as MathUtils from "../utils/mathUtils.ts"
import Range from "../utils/range.ts"


export class Instrument
{
    manager: Playback.Manager
    gainNode: GainNode


    constructor(manager: Playback.Manager)
    {
        this.manager = manager
        
        this.gainNode = this.manager.audioCtx!.createGain()
        this.gainNode.gain.value = 1//trackIsMuted ? 0 : MathUtils.dbToLinearGain(0)
        this.gainNode.connect(this.manager.nodeGlobalVolume!)
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
        audioCtxTimestampMs: number)
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