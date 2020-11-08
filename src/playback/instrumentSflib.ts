import * as Playback from "./index"
import * as Project from "../project"
import MathUtils from "../util/mathUtils"
import { timeStamp } from "console"


interface Note
{
    released: boolean
    releasedTimerMs: number
    nodeSrc: AudioBufferSourceNode
    nodeEnvelope: GainNode
    nodeVolume: GainNode
}


export class InstrumentSflib extends Playback.Instrument
{
    collectionId: string
    instrumentId: string
    sflibInstrument: Playback.SflibInstrument | null
    sampleBuffers: AudioBuffer[]
    notes: Map<Project.ID, Note>


	constructor(synth: Playback.SynthManager, collectionId: string, instrumentId: string)
	{
        super(synth)
        this.collectionId = collectionId
        this.instrumentId = instrumentId
        this.sflibInstrument = null
        this.sampleBuffers = []
        this.notes = new Map<Project.ID, Note>()
	}


	async prepare()
	{
        this.sflibInstrument = await Playback.sflibGetInstrument(this.collectionId, this.instrumentId)
        this.sampleBuffers = []
    
        if (!this.sflibInstrument)
        {
            console.error("could not load sflib " + this.collectionId + "/" + this.instrumentId)
            return
        }
        
        const sampleRate = this.sflibInstrument.zones[0].sampleRate
        for (const sampleRaw of this.sflibInstrument.samples)
        {
            //console.log(sampleRaw)
            const bytes = Uint8Array.from(atob(sampleRaw), c => c.charCodeAt(0))
            //console.log(buffer)

            const audioBuffer = this.synth.audioCtx.createBuffer(1, bytes.length / 2, sampleRate)
            const audioBufferData = audioBuffer.getChannelData(0)
            for (let i = 0; i < bytes.length / 2; i++)
            {
                const b0 = bytes[i * 2]
                const b1 = bytes[i * 2 + 1]
                let uint16 = (b0 << 8) | b1
                if ((uint16 & 0x8000) != 0)
                    uint16 = -(0x10000 - uint16)

                audioBufferData[i] = (uint16 / 0x8000) * 2 - 1
            }

            //console.log(array)

            this.sampleBuffers.push(audioBuffer)
        }
    }


	async destroy()
	{

	}


	playNote(noteId: Project.ID, desiredFreq: number, desiredVolume: number)
	{
        if (!this.sflibInstrument)
            return
		
        if (this.notes.has(noteId))
            return

        const zone = this.sflibInstrument.zones.find(z =>
            desiredFreq >= MathUtils.midiToHertz(z.minPitch) &&
            desiredFreq <= MathUtils.midiToHertz(z.maxPitch))

        if (!zone)
            return

        const audioBuffer = this.sampleBuffers[zone.sampleIndex]

        let sourceNode = this.synth.audioCtx.createBufferSource()
        sourceNode.playbackRate.value = desiredFreq / MathUtils.midiToHertz(zone.basePitch)
        sourceNode.buffer = audioBuffer
        sourceNode.loop = zone.loopMode == "loop"
        sourceNode.loopStart = zone.startLoop / audioBuffer.sampleRate
        sourceNode.loopEnd = zone.endLoop / audioBuffer.sampleRate
        
        let envelopeNode = this.synth.audioCtx.createGain()
        envelopeNode.gain.value = 1
        
        let volumeNode = this.synth.audioCtx.createGain()
        volumeNode.gain.value = 0.1 * desiredVolume
        
        sourceNode.connect(envelopeNode)
        envelopeNode.connect(volumeNode)
        volumeNode.connect(this.synth.audioCtxOutput)
        
        sourceNode.start(0)
        
		const note: Note =
		{
            released: false,
            releasedTimerMs: 0,
            nodeSrc: sourceNode,
            nodeEnvelope: envelopeNode,
            nodeVolume: volumeNode,
        }

        this.notes.set(noteId, note)
    }
    

    releaseNote(noteId: Project.ID)
    {
        const note = this.notes.get(noteId)
        if (!note)
            return
        
		if (!note.released)
		{
			note.released = true
            note.nodeEnvelope.gain.setValueAtTime(
                1, this.synth.audioCtx.currentTime)

            note.nodeEnvelope.gain.linearRampToValueAtTime(
                0, this.synth.audioCtx.currentTime + 0.1)
        }
    }


	stopNote(noteId: Project.ID)
	{
        const note = this.notes.get(noteId)
        if (!note)
            return
        
        note.released = true
        note.releasedTimerMs = 100

        note.nodeSrc.stop()

        this.notes.delete(noteId)
	}


	stopAll()
	{
        for (const noteId of [...this.notes.keys()])
            this.stopNote(noteId)
	}


	process(deltaTimeMs: number)
	{
        for (const [noteId, note] of [...this.notes.entries()])
        {
            if (note.released)
            {
                note.releasedTimerMs += deltaTimeMs
            
                if (note.releasedTimerMs > 200)
                    this.stopNote(noteId)
            }
        }
	}
}