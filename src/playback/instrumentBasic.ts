import * as Playback from "./index"
import * as Project from "../project"
import * as MathUtils from "../utils/mathUtils.ts"
import Range from "../utils/range.ts"


interface Sample
{
    frequency: number
    buffer: AudioBuffer | null
}


interface Note
{
    voices: Voice[]
}


interface Voice
{
    nodeSrc: AudioBufferSourceNode
    nodeEnvelope: GainNode
    nodeVolume: GainNode
    endMs: number
}


const releaseDurationMs = 100


const sampleDefs = [
    { frequency:   55.0, src: "audio/piano/a1.mp3" },
    { frequency:  110.0, src: "audio/piano/a2.mp3" },
    { frequency:  220.0, src: "audio/piano/a3.mp3" },
    { frequency:  440.0, src: "audio/piano/a4.mp3" },
    { frequency:  880.0, src: "audio/piano/a5.mp3" },
    { frequency: 1760.0, src: "audio/piano/a6.mp3" },
    //{ frequency: 3520.0, src: "audio/piano/a7.mp3" },
]


export class InstrumentBasic extends Playback.Instrument
{
    samples: (Sample | undefined)[]
    notes: Note[]


    constructor(manager: Playback.Manager)
    {
        super(manager)

        this.samples = []
        for (const _ of sampleDefs)
            this.samples.push(undefined)

        this.notes = []
    }
    

    override async prepare(noteEvent: Playback.NoteEvent)
    {
        const neededSamples = this.getNeededSamples(noteEvent)

        for (const neededSample of neededSamples)
        {
            const index = neededSample.sampleIndex

            if (this.samples[index])
                continue

            this.samples[index] = { frequency: 0, buffer: null }
            this.samples[index] = await this.load(sampleDefs[index])
        }
    }


    async load(sampleDef: typeof sampleDefs[0]): Promise<Sample>
    {
        const sample: Sample = {
            buffer: null,
            frequency: sampleDef.frequency,
        }

        const src = sampleDef.src

        console.log(`load audio <${ src }>...`)

        return new Promise((resolve, reject) => {
            fetch(src)
                .then(res => res.arrayBuffer())
                .then(arrayBuf => {
                    this.manager.audioCtx!.decodeAudioData(
                        arrayBuf,
                        (audioBuf: AudioBuffer) => {
                            sample.buffer = audioBuf
                            resolve(sample)
                        },
                        () => {
                            console.error(`error loading audio <${ src }>`)
                            reject()
                        })
                })
        })
    }


    override isFinished()
    {
        return this.notes.length === 0
    }


    getNeededSamples(noteEvent: Playback.NoteEvent)
    {
        const desiredFreq = MathUtils.midiToHertz(noteEvent.midiPitchSeq[0].value)

        // Find the primary sample whose frequency is nearest to the desired frequency.
        let sampleIndex1 = 0
        let sample1Dist = Math.abs(sampleDefs[0].frequency - desiredFreq)
        for (let i = 1; i < sampleDefs.length; i++)
        {
            const dist = Math.abs(sampleDefs[i].frequency - desiredFreq)
            if (dist < sample1Dist)
            {
                sampleIndex1 = i
                sample1Dist = dist
            }
        }
        
        // Find the sample whose frequency is second nearest to the desired frequency,
        // unless the primary sample is already exactly a match.
        // Then, calculate a cross-fade between the two.
        // TODO: Probably should use an equal-power (logarithmic) cross-fade,
        // but this seems good enough for now.
        let sampleIndex2 = null
        
        let volume1 = 1
        let volume2 = 0
        
        if (sampleDefs[sampleIndex1].frequency < desiredFreq)
        {
            if (sampleIndex1 + 1 < sampleDefs.length)
            {
                sampleIndex2 = sampleIndex1 + 1
            
                const t =
                    (desiredFreq - sampleDefs[sampleIndex1].frequency) /
                    (sampleDefs[sampleIndex2].frequency - sampleDefs[sampleIndex1].frequency)
                    
                volume1 = 1 - t
                volume2 = t
            }
        }
        else if (sampleDefs[sampleIndex1].frequency > desiredFreq)
        {
            if (sampleIndex1 - 1 >= 0)
            {
                sampleIndex2 = sampleIndex1 - 1
                
                const t =
                    (desiredFreq - sampleDefs[sampleIndex2].frequency) /
                    (sampleDefs[sampleIndex1].frequency - sampleDefs[sampleIndex2].frequency)
                    
                volume1 = t
                volume2 = 1 - t
            }
        }

        const samples = [{
            sampleIndex: sampleIndex1,
            volume: volume1,
        }]

        if (sampleIndex2 !== null)
        {
            samples.push({
                sampleIndex: sampleIndex2,
                volume: volume2,
            })
        }

        return samples
    }


    override playNote(
        noteEvent: Playback.NoteEvent,
        audioCtxTimestamp: number,
        outputNode: AudioNode)
    {
        const neededSamples = this.getNeededSamples(noteEvent)

        const voices: Voice[] = []
        for (const neededSample of neededSamples)
        {
            const sample = this.samples[neededSample.sampleIndex]
            if (!sample)
                continue

            voices.push(this.playVoice(
                noteEvent,
                audioCtxTimestamp,
                outputNode,
                sample,
                noteEvent.midiPitchSeq[0].value,
                neededSample.volume *
                    MathUtils.dbToLinearGain(noteEvent.volumeDbSeq[0].value) *
                    noteEvent.velocitySeq[0].value))
        }

        this.notes.push({
            voices,
        })
    }


    playVoice(
        noteEvent: Playback.NoteEvent,
        audioCtxTimestamp: number,
        outputNode: AudioNode,
        sample: Sample,
        midiPitch: number,
        volume: number)
        : Voice
    {
        const sourceNode = this.manager.audioCtx!.createBufferSource()
        sourceNode.buffer = sample.buffer
        sourceNode.playbackRate.value =
            MathUtils.midiToHertz(midiPitch) / sample.frequency
        
        const startMs = noteEvent.startMs + audioCtxTimestamp
        const endMs = noteEvent.endMs + audioCtxTimestamp

        const envelopeNode = this.manager.audioCtx!.createGain()
        envelopeNode.gain.value = 1
        envelopeNode.gain.setValueAtTime(1, endMs / 1000)
        envelopeNode.gain.linearRampToValueAtTime(0, (endMs + 100) / 1000)

        const volumeNode = this.manager.audioCtx!.createGain()
        volumeNode.gain.value = volume
        
        sourceNode.connect(envelopeNode)
        envelopeNode.connect(volumeNode)
        volumeNode.connect(outputNode)
        
        sourceNode.start(startMs / 1000)
        
        return {
            nodeSrc: sourceNode,
            nodeEnvelope: envelopeNode,
            nodeVolume: volumeNode,
            endMs: endMs + 100,
        }
    }


    stopNote(note: Note)
    {
        for (const voice of note.voices)
        {
            voice.nodeEnvelope.gain.cancelScheduledValues(0)
            voice.nodeEnvelope.disconnect()
            voice.nodeVolume.gain.cancelScheduledValues(0)
            voice.nodeVolume.disconnect()
            voice.nodeSrc.stop()
            voice.nodeSrc.disconnect()
            voice.endMs = 0
        }
    }
    

    override stopAll()
    {
        for (const note of this.notes)
            this.stopNote(note)

        this.notes = []
    }


    override process(
        audioCtxTimestampMs: number,
        deltaTimeMs: number)
    {
        for (const note of this.notes)
        {
            if (note.voices.every(v => audioCtxTimestampMs >= v.endMs))
                this.stopNote(note)
        }

        this.notes = this.notes.filter(note =>
            note.voices.some(v => audioCtxTimestampMs < v.endMs))
    }
}