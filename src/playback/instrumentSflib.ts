import * as Playback from "./index"
import * as Project from "../project"
import MathUtils from "../util/mathUtils"
import { timeStamp } from "console"


interface Note
{
    zone: Playback.SflibInstrumentZone
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
    notes: Map<Project.ID, Note>


	constructor(synth: Playback.SynthManager, collectionId: string, instrumentId: string)
	{
        super(synth)
        this.collectionId = collectionId
        this.instrumentId = instrumentId
        this.sflibInstrument = null
        this.notes = new Map<Project.ID, Note>()
	}


	async prepare()
	{
        this.sflibInstrument = await Playback.sflibGetInstrument(
            this.collectionId, this.instrumentId, this.synth.audioCtx)
    
        if (!this.sflibInstrument)
        {
            console.error("could not load sflib " + this.collectionId + "/" + this.instrumentId)
            return
        }
    }


	async destroy()
	{

	}


	isFinished()
	{
		return !this.sflibInstrument || this.notes.size == 0
	}


	playNote(noteId: Project.ID, desiredFreq: number, desiredVolume: number)
	{
        if (!this.sflibInstrument)
            return
		
        if (this.notes.has(noteId))
            return

        const zone = this.sflibInstrument.zones.find(z =>
            desiredFreq >= MathUtils.midiToHertz(z.midiPitchMin) &&
            desiredFreq <= MathUtils.midiToHertz(z.midiPitchMax))

        if (!zone)
            return

        const audioBuffer = this.sflibInstrument.audioBuffers[zone.sampleIndex]

        let sourceNode = this.synth.audioCtx.createBufferSource()
        sourceNode.playbackRate.value = desiredFreq / MathUtils.midiToHertz(zone.midiPitchBase)
        sourceNode.buffer = audioBuffer
        sourceNode.loop = zone.loopMode == "loop"
        sourceNode.loopStart = zone.loopStartIndex / audioBuffer.sampleRate
        sourceNode.loopEnd = zone.loopEndIndex / audioBuffer.sampleRate

        const time = this.synth.audioCtx.currentTime
        const delayTime = time + zone.volEnvDelaySec
        const attackTime = delayTime + (zone.volEnvAttackSec || 0.005)
        const holdTime = attackTime + zone.volEnvHoldSec
        const decayTime = holdTime + zone.volEnvDecaySec
        const sustainLevel = zone.volEnvSustain
        
        let envelopeNode = this.synth.audioCtx.createGain()
        envelopeNode.gain.value = 0
        envelopeNode.gain.setValueAtTime(0, delayTime)
        envelopeNode.gain.linearRampToValueAtTime(1, attackTime)
        envelopeNode.gain.setValueAtTime(1, holdTime)
        envelopeNode.gain.exponentialRampToValueAtTime(sustainLevel || 0.0001, decayTime)

        let volumeNode = this.synth.audioCtx.createGain()
        volumeNode.gain.value = desiredVolume
        
        sourceNode.connect(envelopeNode)
        envelopeNode.connect(volumeNode)
        volumeNode.connect(this.synth.nodeGain)
        
        sourceNode.start(0)
        
		const note: Note =
		{
            zone,
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
            
            const time = this.synth.audioCtx.currentTime
            const releaseTime = time + Math.max(note.zone.volEnvReleaseSec, 0.05)

            note.nodeEnvelope.gain.cancelScheduledValues(time)
            note.nodeEnvelope.gain.setValueAtTime(note.nodeEnvelope.gain.value, time)
            note.nodeEnvelope.gain.exponentialRampToValueAtTime(0.0001, releaseTime)
        }
    }


	stopNote(noteId: Project.ID)
	{
        const note = this.notes.get(noteId)
        if (!note)
            return
        
        note.released = true
        note.releasedTimerMs = note.zone.volEnvReleaseSec * 1000
        note.nodeSrc.stop()
	}


	stopAll()
	{
        for (const [noteId,] of this.notes)
            this.stopNote(noteId)

        this.notes.clear()
	}


	process(deltaTimeMs: number)
	{
        const notesToDelete: Project.ID[] = []

        for (const [noteId, note] of this.notes)
        {
            if (note.released)
            {
                note.releasedTimerMs += deltaTimeMs
            
                if (note.zone.loopMode != "loop")
                {
                    const sample = this.sflibInstrument!.audioBuffers[note.zone.sampleIndex]
                    if (note.releasedTimerMs > sample.length / sample.sampleRate * 1000)
                    {
                        this.stopNote(noteId)
                        notesToDelete.push(noteId)
                    }
                }
                else if (note.releasedTimerMs > note.zone.volEnvReleaseSec * 1000)
                {
                    this.stopNote(noteId)
                    notesToDelete.push(noteId)
                }
            }
        }

        for (const id of notesToDelete)
            this.notes.delete(id)
	}
}