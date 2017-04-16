// `sampleDefs` is an array containing each sample's
// URL and frequency, sorted by frequency, like so:
//   [
//     [440, "piano/a4.mp3"],
//     [880, "piano/a5.mp3"]
//   ]
function Instrument(synth, sampleDefs)
{
	this.synth = synth;
	
	this.samples = [];
	for (var i = 0; i < sampleDefs.length; i++)
	{
		this.samples.push(this.load(synth, sampleDefs[i][1], sampleDefs[i][0]));
	}
}


Instrument.prototype.load = function(synth, url, frequency)
{
	var sample =
	{
		buffer: null,
		frequency: frequency
	};
	
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	request.onload = function()
	{
		synth.audioCtx.decodeAudioData(
			request.response,
			function(buffer)
			{
				sample.buffer = buffer;
			},
			function()
			{
				console.log("Error loading audio <" + url + ">");
			});
	};
	
	request.send();
	return sample;
}


Instrument.prototype.playNote = function(desiredFreq, desiredVolume, duration)
{
	// Find the primary sample whose frequency is nearest to the desired frequency.
	var sample1 = 0;
	var sample1Dist = Math.abs(this.samples[0].frequency - desiredFreq);
	for (var i = 1; i < this.samples.length; i++)
	{
		var dist = Math.abs(this.samples[i].frequency - desiredFreq);
		if (dist < sample1Dist)
		{
			sample1 = i;
			sample1Dist = dist;
		}
	}
	
	// Find the sample whose frequency is second nearest to the desired frequency,
	// unless the primary sample is already exactly a match.
	// Then, calculate a cross-fade between the two.
	// TODO: Probably should use an equal-power (logarithmic) cross-fade,
	// but this seems good enough for now.
	var sample2 = null;
	
	var volume1 = 1;
	var volume2 = 0;
	
	if (this.samples[sample1].frequency < desiredFreq)
	{
		if (sample1 + 1 < this.samples.length)
		{
			sample2 = sample1 + 1;
		
			var t =
				(desiredFreq - this.samples[sample1].frequency) /
				(this.samples[sample2].frequency - this.samples[sample1].frequency);
				
			volume1 = 1 - t;
			volume2 = t;
		}
	}
	else if (this.samples[sample1].frequency > desiredFreq)
	{
		if (sample1 - 1 >= 0)
		{
			sample2 = sample1 - 1;
			
			var t =
				(desiredFreq - this.samples[sample2].frequency) /
				(this.samples[sample1].frequency - this.samples[sample2].frequency);
				
			volume1 = t;
			volume2 = 1 - t;
		}
	}
	
	// Play the samples.
	var voices = [ this.playVoice(this.samples[sample1], desiredFreq, desiredVolume * volume1) ];
	if (sample2 != null)
		voices.push(this.playVoice(this.samples[sample2], desiredFreq, desiredVolume * volume2));
	
	var data =
	{
		duration: duration,
		released: false,
		voices: voices
	};
	
	return data;
}


Instrument.prototype.playVoice = function(sample, frequency, volume)
{
	var sourceNode = this.synth.audioCtx.createBufferSource();
	sourceNode.playbackRate.value = frequency / sample.frequency;
	sourceNode.buffer = sample.buffer;
	sourceNode.start(0);
	
	var envelopeNode = this.synth.audioCtx.createGain();
	envelopeNode.gain.value = 1;
	
	var volumeNode = this.synth.audioCtx.createGain();
	volumeNode.gain.value = volume;
	
	sourceNode.connect(envelopeNode);
	envelopeNode.connect(volumeNode);
	volumeNode.connect(this.synth.audioCtxOutput);
	
	return { source: sourceNode, envelope: envelopeNode, volume: volumeNode };
}


Instrument.prototype.processNote = function(noteData, deltaTime)
{
	noteData.duration -= deltaTime;
	
	if (noteData.duration <= 0 && !noteData.released)
	{
		noteData.released = true;
		for (var i = 0; i < noteData.voices.length; i++)
			noteData.voices[i].envelope.gain.linearRampToValueAtTime(0, this.synth.audioCtx.currentTime + 0.1);
	}
	
	if (noteData.duration <= -0.1)
	{
		for (var i = 0; i < noteData.voices.length; i++)
			noteData.voices[i].source.stop();
		
		return true;
	}
	
	return false;
}


Instrument.prototype.stopNote = function(noteData)
{
	for (var i = 0; i < noteData.voices.length; i++)
		noteData.voices[i].source.stop();
}