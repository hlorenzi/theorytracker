import * as Playback from "./index"
import * as Project from "../project"


interface Sample
{
    frequency: number
    buffer: AudioBuffer | null
}


interface Note
{
    released: boolean
    releasedTimerMs: number
    voices: Voice[]
}


interface Voice
{
    nodeSrc: AudioBufferSourceNode
    nodeEnvelope: GainNode
    nodeVolume: GainNode
}


const releaseDurationMs = 100


export class InstrumentBasic extends Playback.Instrument
{
    samples: Sample[]
    notes: Map<Project.ID, Note>


	constructor(synth: Playback.SynthManager)
	{
        super(synth)
        this.samples = []
        this.notes = new Map<Project.ID, Note>()
    }
    

    async prepare()
    {
        if (this.samples.length > 0)
            return
        
        const sampleDefs: [number, string][] =
        [
			[  55.0, "audio/piano/a1.mp3"],
			[ 110.0, "audio/piano/a2.mp3"],
			[ 220.0, "audio/piano/a3.mp3"],
			[ 440.0, "audio/piano/a4.mp3"],
			[ 880.0, "audio/piano/a5.mp3"],
			[1760.0, "audio/piano/a6.mp3"],
			//[3520.0, "audio/piano/a7.mp3"]
        ]
        
        this.samples = []
		this.samples = await Promise.all(sampleDefs.map(s => this.load(s[0], s[1])))
    }


	async load(frequency: number, url: string): Promise<Sample>
	{
		const sample: Sample =
		{
			buffer: null,
			frequency
        }

        return new Promise((resolve, reject) =>
        {
            fetch(url)
                .then(res => res.arrayBuffer())
                .then(arrayBuf => 
                {
                    this.synth.audioCtx.decodeAudioData(
                        arrayBuf,
                        (audioBuf: AudioBuffer) =>
                        {
                            sample.buffer = audioBuf
                            resolve(sample)
                        },
                        () =>
                        {
                            console.log("Error loading audio <" + url + ">")
                            reject()
                        })
                })
        })
	}


	isFinished()
	{
		return this.notes.size == 0
	}


	playNote(noteId: Project.ID, desiredFreq: number, desiredVolume: number)
	{
        if (this.notes.has(noteId))
            return

		// Find the primary sample whose frequency is nearest to the desired frequency.
		let sample1 = 0
		let sample1Dist = Math.abs(this.samples[0].frequency - desiredFreq)
		for (let i = 1; i < this.samples.length; i++)
		{
			const dist = Math.abs(this.samples[i].frequency - desiredFreq)
			if (dist < sample1Dist)
			{
				sample1 = i
				sample1Dist = dist
			}
		}
		
		// Find the sample whose frequency is second nearest to the desired frequency,
		// unless the primary sample is already exactly a match.
		// Then, calculate a cross-fade between the two.
		// TODO: Probably should use an equal-power (logarithmic) cross-fade,
		// but this seems good enough for now.
		let sample2 = null
		
		let volume1 = 1
		let volume2 = 0
		
		if (this.samples[sample1].frequency < desiredFreq)
		{
			if (sample1 + 1 < this.samples.length)
			{
				sample2 = sample1 + 1
			
				const t =
					(desiredFreq - this.samples[sample1].frequency) /
					(this.samples[sample2].frequency - this.samples[sample1].frequency)
					
				volume1 = 1 - t
				volume2 = t
			}
		}
		else if (this.samples[sample1].frequency > desiredFreq)
		{
			if (sample1 - 1 >= 0)
			{
				sample2 = sample1 - 1
				
				const t =
					(desiredFreq - this.samples[sample2].frequency) /
					(this.samples[sample1].frequency - this.samples[sample2].frequency)
					
				volume1 = t
				volume2 = 1 - t
			}
		}
		
		// Play the samples.
		const voices = [ this.playVoice(this.samples[sample1], desiredFreq, desiredVolume * volume1) ]
		if (sample2 != null)
			voices.push(this.playVoice(this.samples[sample2], desiredFreq, desiredVolume * volume2))
		
		const note: Note =
		{
            released: false,
            releasedTimerMs: 0,
            voices,
        }
        
        this.notes.set(noteId, note)
    }


	playVoice(sample: Sample, frequency: number, volume: number): Voice
	{
		let sourceNode = this.synth.audioCtx.createBufferSource()
		sourceNode.playbackRate.value = frequency / sample.frequency
		sourceNode.buffer = sample.buffer
		
		let envelopeNode = this.synth.audioCtx.createGain()
		envelopeNode.gain.value = 1
		
		let volumeNode = this.synth.audioCtx.createGain()
		volumeNode.gain.value = volume
		
		sourceNode.connect(envelopeNode)
		envelopeNode.connect(volumeNode)
        volumeNode.connect(this.synth.nodeGain)
        
		sourceNode.start(0)
		
		return {
            nodeSrc: sourceNode,
            nodeEnvelope: envelopeNode,
            nodeVolume: volumeNode,
        }
	}
    

    releaseNote(noteId: Project.ID)
    {
        const note = this.notes.get(noteId)
        if (!note)
            return
        
		if (!note.released)
		{
			note.released = true
			for (let i = 0; i < note.voices.length; i++)
			{
				note.voices[i].nodeEnvelope.gain.setValueAtTime(
                    1, this.synth.audioCtx.currentTime)

                note.voices[i].nodeEnvelope.gain.linearRampToValueAtTime(
                    0, this.synth.audioCtx.currentTime + releaseDurationMs / 1000)
			}
        }
    }


	stopNote(noteId: Project.ID)
	{
        const note = this.notes.get(noteId)
        if (!note)
            return
        
        note.released = true
        note.releasedTimerMs = releaseDurationMs * 100

		for (let i = 0; i < note.voices.length; i++)
            note.voices[i].nodeSrc.stop()

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
            
                if (note.releasedTimerMs > releaseDurationMs * 2)
                    this.stopNote(noteId)
            }
        }
	}
}