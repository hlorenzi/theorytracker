import { Synth } from "./synth"
import Project from "../project/project2"
import { SflibInstrument, SflibMeta } from "./library"
import { sflibGetInstrument } from "./libraryCache"


export class InstrumentSflib
{
    synth: Synth
    trackId: number
    audioWorklet?: AudioWorkletNode


	constructor(synth: Synth, trackId: number)
	{
        this.synth = synth
        this.trackId = trackId
	}


	async prepare(sflibMeta: SflibMeta, trackInstrument: Project.TrackInstrumentSflib)
	{
        const instrument = await sflibGetInstrument(sflibMeta, trackInstrument.collectionId, trackInstrument.instrumentId)
        if (!instrument)
            throw "missing sflib instrument"

        this.audioWorklet = new AudioWorkletNode(this.synth.audioCtx, "SflibAudioProcessor")
        this.audioWorklet.connect(this.synth.audioCtxOutput)
        this.audioWorklet.port.postMessage({
            type: "setInstrument",
            outputSampleRate: this.synth.audioCtx.sampleRate,
            instrument
        })
    }
    

    destroy()
    {
        this.audioWorklet!.disconnect()
        this.audioWorklet = undefined
    }


    noteOn(midiPitch: number)
    {
        this.audioWorklet!.port.postMessage({ type: "noteOn", midiPitch })
    }
    
    
    noteOff(midiPitch: number)
    {
        this.audioWorklet!.port.postMessage({ type: "noteOff", midiPitch })
    }


	stop()
	{
        this.audioWorklet!.port.postMessage({ type: "stopAll" })
	}
}