// `sampleDefs` is an array containing each sample's
// URL and frequency, like so:
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


Instrument.prototype.playNote = function(frequency, volume, duration)
{
	var bestFitSample = this.samples[0];
	var bestFitDistance = Math.abs(this.samples[0].frequency - frequency);
	for (var i = 1; i < this.samples.length; i++)
	{
		var dist = Math.abs(this.samples[i].frequency - frequency);
		if (dist < bestFitDistance)
		{
			bestFitSample = this.samples[i];
			bestFitDistance = dist;
		}
	}
	
	var data =
	{
		duration: duration,
		released: false,
		voices:
		[
			this.playVoice(bestFitSample, frequency, volume)
		]
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