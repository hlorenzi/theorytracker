// `sampleDefs` is an array containing each sample's
// URL and frequency, sorted by frequency, like so:
//   [
//     [440, "piano/a4.mp3"],
//     [880, "piano/a5.mp3"]
//   ]
export class Instrument
{
	constructor(synth, sampleDefs)
	{
		this.synth = synth
		
		this.samples = []
		for (let i = 0; i < sampleDefs.length; i++)
			this.samples.push(this.load(synth, sampleDefs[i][1], sampleDefs[i][0]))
	}


	load(synth, url, frequency)
	{
		let sample =
		{
			buffer: null,
			frequency
		}
		
		let request = new XMLHttpRequest()
		request.open("GET", url, true)
		request.responseType = "arraybuffer"

		request.onload = () =>
		{
			synth.audioCtx.decodeAudioData(
				request.response,
				(buffer) => { sample.buffer = buffer },
				() => { console.log("Error loading audio <" + url + ">") })
		}
		
		request.send()
		return sample
	}


	playNote(desiredFreq, desiredVolume, duration)
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
		
		const data =
		{
			duration,
			released: false,
			voices
		}
		
		return data
	}


	playVoice(sample, frequency, volume)
	{
		let sourceNode = this.synth.audioCtx.createBufferSource()
		sourceNode.playbackRate.value = frequency / sample.frequency
		sourceNode.buffer = sample.buffer
		sourceNode.start(0)
		
		let envelopeNode = this.synth.audioCtx.createGain()
		envelopeNode.gain.setValueAtTime(1, this.synth.audioCtx.currentTime)
		
		let volumeNode = this.synth.audioCtx.createGain()
		volumeNode.gain.value = volume
		
		sourceNode.connect(envelopeNode)
		envelopeNode.connect(volumeNode)
		volumeNode.connect(this.synth.audioCtxOutput)
		
		return { source: sourceNode, envelope: envelopeNode, volume: volumeNode }
	}


	processNote(noteData, deltaTime)
	{
		noteData.duration -= deltaTime

		const releaseFalloffDuration = 0.1
		
		if (noteData.duration <= 0 && !noteData.released)
		{
			noteData.released = true
			for (let i = 0; i < noteData.voices.length; i++)
			{
				noteData.voices[i].envelope.gain.setValueAtTime(1, this.synth.audioCtx.currentTime)
				noteData.voices[i].envelope.gain.linearRampToValueAtTime(0, this.synth.audioCtx.currentTime + releaseFalloffDuration)
			}
		}
		
		if (noteData.duration <= -releaseFalloffDuration * 2)
		{
			for (let i = 0; i < noteData.voices.length; i++)
				noteData.voices[i].source.stop()
			
			return true
		}
		
		return false
	}


	stopNote(noteData)
	{
		for (let i = 0; i < noteData.voices.length; i++)
			noteData.voices[i].source.stop()
	}
}