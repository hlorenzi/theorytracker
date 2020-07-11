import { SflibInstrument, SflibInstrumentZone } from "./library"


interface AudioWorkletProcessor
{
    readonly port: MessagePort
    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean
}

declare var AudioWorkletProcessor:
{
    prototype: AudioWorkletProcessor
    new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor
}

declare function registerProcessor(
    name: string,
    processorCtor: (new (options?: AudioWorkletNodeOptions) => AudioWorkletProcessor) & { parameterDescriptors?: AudioParamDescriptor[] }
): void

  
function lerp(a: number, b: number, t: number): number
{
    return a + (b - a) * t
}


function sampleEnvelopeStart(envelope: SflibInstrumentZone, time: number): number
{
    const delay = envelope.delayVolEnv || 0
    if (time < delay)
        return 0

    time -= delay
    const attack = envelope.attackVolEnv || 0
    if (time < attack)
        return time / attack

    time -= attack
    const hold = envelope.holdVolEnv || 0
    if (time < hold)
        return 1

    time -= hold
    const decay = envelope.decayVolEnv || 0
    const sustain = envelope.sustainVolEnv || 1
    if (time < decay)
        return lerp(1, sustain, time / decay)

    return sustain
}


function sampleEnvelope(envelope: SflibInstrumentZone, time: number, isOff: boolean, offTime: number): number
{
    const envelopeStart = sampleEnvelopeStart(envelope, time)

    if (!isOff)
    {
        return envelopeStart
    }
    else
    {
        time -= offTime
        const release = envelope.releaseVolEnv || 0
        if (time < release)
            return lerp(envelopeStart, 0, time / release)

        return 0
    }
}


interface Instrument extends SflibInstrument
{
    sampleBuffers: number[][]
}


interface PlayingNote
{
    on: boolean
    offTime: number
    time: number
    sampleHead: number
    midiPitch: number
    zone: SflibInstrumentZone
}


class SflibAudioProcessor extends AudioWorkletProcessor
{
    outputSampleRate: number
    instrument: Instrument | null
    notes: PlayingNote[]


    constructor(options?: AudioWorkletNodeOptions)
    {
        super(options)

        this.outputSampleRate = 1
        this.instrument = null
        this.notes = []

        this.port.onmessage = (e) =>
        {
            //console.log(e.data)

            if (e.data.type == "setInstrument")
            {
                this.outputSampleRate = e.data.outputSampleRate

                this.instrument = e.data.instrument
                this.instrument!.sampleBuffers = []

                for (const sampleRaw of this.instrument!.samples)
                {
                    //console.log(sampleRaw)
                    const buffer = Buffer.from(sampleRaw, "base64")
                    //console.log(buffer)

                    const array = new Array<number>(buffer.length / 2)
                    for (let i = 0; i < buffer.length / 2; i++)
                    {
                        const b0 = buffer[i * 2]
                        const b1 = buffer[i * 2 + 1]
                        let uint16 = (b0 << 8) | b1
                        if ((uint16 & 0x8000) != 0)
                            uint16 = -(0x10000 - uint16)

                        array[i] = uint16 / 0x8000
                    }

                    //console.log(array)
                    this.instrument!.sampleBuffers.push(array)
                }
            }

            else if (e.data.type == "noteOn")
            {
                for (const oldNote of this.notes)
                {
                    if (oldNote.on && oldNote.midiPitch == e.data.midiPitch)
                    {
                        oldNote.on = false
                        oldNote.offTime = oldNote.time
                    }
                }

                const zone = this.instrument!.zones.find(
                    z => e.data.midiPitch >= z.minPitch && e.data.midiPitch <= z.maxPitch)

                if (zone)
                {
                    const note: PlayingNote =
                    {
                        on: true,
                        offTime: 0,
                        time: 0,
                        sampleHead: 0,
                        midiPitch: e.data.midiPitch,
                        zone,
                    }

                    this.notes.push(note)
                }
            }

            else if (e.data.type == "noteOff")
            {
                for (const note of this.notes)
                {
                    if (note.on && note.midiPitch == e.data.midiPitch)
                    {
                        note.on = false
                        note.offTime = note.time
                    }
                }
            }

            else if (e.data.type == "stopAll")
            {
                for (const note of this.notes)
                {
                    if (note.on)
                    {
                        note.on = false
                        note.offTime = note.time
                    }
                }
            }

            //delete this.instrument.samples
        }
    }


    process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean
    {
        for (let n = this.notes.length - 1; n >= 0; n--)
        {
            const note = this.notes[n]
            const output = outputs[0]
            const zone = note.zone
            const sampleData = this.instrument!.sampleBuffers[zone.sampleIndex]
            const rateConversion = zone.sampleRate / this.outputSampleRate
            const pitchConversion = midiToHertz(note.midiPitch) / midiToHertz(zone.basePitch)

            const getSampleAt = (index: number): number =>
            {
                const indexBefore = Math.floor(index)
                const indexAfter = Math.ceil(index)

                const indexFraction = (index - indexBefore)

                const sampleBefore = sampleData[indexBefore % sampleData.length]
                const sampleAfter = sampleData[indexAfter % sampleData.length]

                const sampleInterp = sampleBefore + (sampleAfter - sampleBefore) * indexFraction
                //console.log(index, indexFraction, sampleBefore, sampleAfter, sampleInterp)

                return sampleInterp
            }

            for (let i = 0; i < output[0].length; i++)
            {
                const envelope = sampleEnvelope(zone, note.time, !note.on, note.offTime)
                const sample = Math.pow(envelope, 4) * getSampleAt(note.sampleHead * rateConversion * pitchConversion)

                for (let c = 0; c < output.length; c++)
                {
                    output[c][i] += sample * 0.25
                }

                note.time += 1 / this.outputSampleRate

                if (zone.loopMode == "noLoop")
                {
                    if (note.sampleHead * rateConversion * pitchConversion < sampleData.length - 1)
                        note.sampleHead += 1
                }
                else
                {
                    note.sampleHead += 1
                    if (note.sampleHead * rateConversion * pitchConversion >= zone.endLoop - 1)
                        note.sampleHead -= (zone.endLoop - zone.startLoop - 1) / rateConversion / pitchConversion
                }
            }

            if (!note.on && note.time - note.offTime > (zone.releaseVolEnv || 0))
                this.notes = [...this.notes.slice(0, n), ...this.notes.slice(n + 1)]
        }

        return true
    }
}


function midiToHertz(midi: number): number
{
	return Math.pow(2, (midi - 69) / 12) * 440
}


registerProcessor("SflibAudioProcessor", SflibAudioProcessor)
console.log("registered SflibAudioProcessor")