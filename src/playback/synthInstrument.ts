import * as Playback from "./index"


export interface NoteVoice
{
    nodeSrc: AudioBufferSourceNode
    nodeEnvelope: GainNode
    nodeVolume: GainNode
}


export interface NotePlayback
{
    released: boolean
    releasedTimerMs: number
    voices: NoteVoice[]

    process: (deltaTimeMs: number) => boolean
    release: () => void
    stop: () => void
}


export interface Sample
{
    frequency: number
    buffer: AudioBuffer | null
}


const releaseDurationMs = 100


// `sampleDefs` is an array containing each sample's
// URL and frequency, sorted by frequency, like so:
//   [
//     [440, "piano/a4.mp3"],
//     [880, "piano/a5.mp3"]
//   ]
export class Instrument
{
    synth: Playback.SynthManager
    samples: Sample[]


	constructor(synth: Playback.SynthManager, sampleDefs: [number, string][])
	{
		this.synth = synth
		
		this.samples = []
		for (let i = 0; i < sampleDefs.length; i++)
			this.samples.push(this.load(synth, sampleDefs[i][1], sampleDefs[i][0]))
	}


	load(synth: Playback.SynthManager, url: string, frequency: number): Sample
	{
		let sample: Sample =
		{
			buffer: null,
			frequency
        }
        
        fetch(url)
            .then(res => res.arrayBuffer())
            .then(arrayBuf => 
            {
                synth.audioCtx.decodeAudioData(
                    arrayBuf,
                    (audioBuf: AudioBuffer) => { sample.buffer = audioBuf },
                    () => { console.log("Error loading audio <" + url + ">") })
            })
		
		return sample
	}


	playNote(desiredFreq: number, desiredVolume: number): NotePlayback
	{
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
		
		const data: NotePlayback =
		{
            released: false,
            releasedTimerMs: 0,
            voices,
            process: null!,
            release: null!,
            stop: null!,
		}
            
        data.process = (deltaTimeMs: number) => this.processNote(data, deltaTimeMs)
        data.release = () => this.releaseNote(data)
        data.stop = () => this.stopNote(data)
		
		return data
    }
    

    releaseNote(noteData: NotePlayback)
    {
		if (!noteData.released)
		{
			noteData.released = true
			for (let i = 0; i < noteData.voices.length; i++)
			{
				noteData.voices[i].nodeEnvelope.gain.setValueAtTime(
                    1, this.synth.audioCtx.currentTime)

				noteData.voices[i].nodeEnvelope.gain.linearRampToValueAtTime(
                    0, this.synth.audioCtx.currentTime + releaseDurationMs / 1000)
			}
        }
    }


	stopNote(noteData: NotePlayback)
	{
        noteData.released = true
        noteData.releasedTimerMs = releaseDurationMs * 100

		for (let i = 0; i < noteData.voices.length; i++)
			noteData.voices[i].nodeSrc.stop()
	}


	playVoice(sample: Sample, frequency: number, volume: number): NoteVoice
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
        volumeNode.connect(this.synth.audioCtxOutput)
        
		sourceNode.start(0)
		
		return {
            nodeSrc: sourceNode,
            nodeEnvelope: envelopeNode,
            nodeVolume: volumeNode,
        }
	}


	processNote(noteData: NotePlayback, deltaTimeMs: number): boolean
	{
		if (noteData.released)
        {
            noteData.releasedTimerMs += deltaTimeMs
		
            if (noteData.releasedTimerMs > releaseDurationMs * 2)
            {
                this.stopNote(noteData)
                return true
            }
        }
		
		return false
	}
}