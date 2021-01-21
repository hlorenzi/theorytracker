import * as Playback from "./index"
import * as Project from "../project"
import * as MathUtils from "../util/mathUtils"


interface Note
{
    request: Playback.NoteRequest
    zone: Playback.SflibInstrumentZone
    timePassedMs: number
    endTimeMs: number
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


	playNote(request: Playback.NoteRequest)
	{
        if (!this.sflibInstrument)
            return
		
        //if (this.notes.has(request.noteId))
        //    return

        const midiPitch = request.midiPitchSeq[0].value

        let zone = this.sflibInstrument.zones.find(z =>
            midiPitch >= z.midiPitchMin &&
            midiPitch <= z.midiPitchMax)

        if (!zone)
        {
            let nearestMidiPitchDistance = Infinity

            for (const z of this.sflibInstrument.zones)
            {
                const distance = Math.min(
                    Math.abs(z.midiPitchMin - midiPitch),
                    Math.abs(z.midiPitchMax - midiPitch))

                if (distance < nearestMidiPitchDistance)
                {
                    nearestMidiPitchDistance = distance
                    zone = z
                }
            }
        }

        if (!zone)
            return

        const freq = MathUtils.midiToHertz(midiPitch)

        const audioBuffer = this.sflibInstrument.audioBuffers[zone.sampleIndex]


        const sourceNode = this.synth.audioCtx.createBufferSource()
        sourceNode.playbackRate.value = freq / MathUtils.midiToHertz(zone.midiPitchBase)
        sourceNode.buffer = audioBuffer
        sourceNode.loop = (zone.loopMode == "loop")
        sourceNode.loopStart = zone.loopStartIndex / audioBuffer.sampleRate
        sourceNode.loopEnd = zone.loopEndIndex / audioBuffer.sampleRate


        const time = 0.05 + Math.max(0, request.startMs / 1000)
        const delayTime = time + zone.volEnvDelaySec
        const attackTime = delayTime + (zone.volEnvAttackSec || 0.005)
        const holdTime = attackTime + zone.volEnvHoldSec
        const decayTime = holdTime + zone.volEnvDecaySec
        const sustainLevel = zone.volEnvSustain || 0.0001
        const releaseTime = time + request.durationMs / 1000
        const endTime = releaseTime + Math.max(zone.volEnvReleaseSec, 0.05)

        /*

          Envelope parameters:

          |          100% level
          |          ______
          |         /|    |\
          |        / |    | \   sustainLevel
          |       /  |    |  \____________
          |      /   |    |   |          |\
          |     /    |    |   |          | \
          |    /     |    |   |          |  \
        --+-------------------------------------------
          ^   ^      ^    ^   ^          ^   ^ endTime
          |   |      |    |   |          + releaseTime
          |   |      |    |   + decayTime
          |   |      |    + holdTime
          |   |      + attackTime
          |   + delayTime
          + time

        */

        const releaseTimeCap = releaseTime - 0.001
        const cappedDelayTime = Math.min(delayTime, releaseTimeCap)
        const cappedAttackTime = Math.min(attackTime, releaseTimeCap)
        const cappedHoldTime = Math.min(holdTime, releaseTimeCap)

        const releaseF = (releaseTime - cappedHoldTime) / (decayTime - cappedHoldTime)
        const releaseLevel = releaseF >= 1 ? sustainLevel : Math.pow(sustainLevel, releaseF)

        const envelopeNode = this.synth.audioCtx.createGain()
        envelopeNode.gain.value = 0
        envelopeNode.gain.setValueAtTime(0.0001, cappedDelayTime)
        envelopeNode.gain.exponentialRampToValueAtTime(1, cappedAttackTime)
        envelopeNode.gain.setValueAtTime(1, cappedHoldTime)

        if (decayTime < releaseTime)
        {
            envelopeNode.gain.exponentialRampToValueAtTime(sustainLevel, decayTime)
            envelopeNode.gain.setValueAtTime(sustainLevel, releaseTime)
            envelopeNode.gain.exponentialRampToValueAtTime(0.0001, endTime)
        }
        else
        {
            envelopeNode.gain.exponentialRampToValueAtTime(releaseLevel, releaseTime)
            envelopeNode.gain.setValueAtTime(releaseLevel, releaseTime)
            envelopeNode.gain.exponentialRampToValueAtTime(0.0001, endTime)
        }

        /*console.log("playNote", this.synth.audioCtx.currentTime, request)
        console.log("envelope",
            "del", (delayTime - time).toFixed(3),
            "atk", (attackTime - time).toFixed(3),
            "hld", (holdTime - time).toFixed(3),
            "dec", (decayTime - time).toFixed(3),
            "::",
            sustainLevel.toFixed(3),
            releaseLevel.toFixed(3),
            "::",
            "rel", (releaseTimeCap - time).toFixed(3),
            "end", (endTime - time).toFixed(3))*/

        const volumeNode = this.synth.audioCtx.createGain()
        volumeNode.gain.value = request.volumeSeq[0].value
        

        sourceNode.connect(envelopeNode)
        envelopeNode.connect(volumeNode)
        volumeNode.connect(this.synth.nodeGain)
        
        sourceNode.start(time)
        
		const note: Note =
		{
            request,
            zone,
            timePassedMs: -(time - this.synth.audioCtx.currentTime) * 1000,
            endTimeMs: (endTime - time) * 1000,
            nodeSrc: sourceNode,
            nodeEnvelope: envelopeNode,
            nodeVolume: volumeNode,
        }

        this.notes.set(request.noteId, note)
    }


	stopNote(noteId: Project.ID)
	{
        const note = this.notes.get(noteId)
        if (!note)
            return
            
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
            note.timePassedMs += deltaTimeMs
        
            if (note.timePassedMs > note.endTimeMs)
            {
                this.stopNote(noteId)
                notesToDelete.push(noteId)
            }
            else if (note.zone.loopMode != "loop")
            {
                const sample = this.sflibInstrument!.audioBuffers[note.zone.sampleIndex]
                if (note.timePassedMs > sample.length / sample.sampleRate * 1000)
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