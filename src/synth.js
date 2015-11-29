function Synth()
{
	this.audioCtx = new AudioContext();
	this.globalVolume = 0.1;
	this.voices = [];
	this.delayedNotes = [];
}


Synth.prototype.process = function(deltaTime)
{
	for (var i = this.delayedNotes.length - 1; i >= 0; i--)
	{
		var note = this.delayedNotes[i];
		note.delay -= deltaTime;
		
		if (note.delay <= 0)
		{
			this.playNote(note.midiPitch, note.duration, note.volume);
			this.delayedNotes.splice(i, 1);
		}
	}
	
	for (var i = this.voices.length - 1; i >= 0; i--)
	{
		var voice = this.voices[i];
		
		voice.time += deltaTime;
		voice.duration -= deltaTime;
		
		if (voice.time >= voice.duration)
		{
			this.stopVoice(i);
			this.voices.splice(i, 1);
		}
		else
		{
			for (var j = 0; j < voice.gainNodes.length; j++)
			{
				voice.gainNodes[j].gain.value = voice.amplitudes[j] * voice.volume * (1 - voice.time / voice.duration) * this.globalVolume;
			}
		}
	}
}


Synth.prototype.playNote = function(midiPitch, duration, volume)
{
	var pitchInHertz = Math.pow(2, (midiPitch - 69) / 12) * 440;
	
	var voice = { };
	voice.oscillators = [];
	voice.gainNodes = [];
	voice.volume = volume;
	
	voice.amplitudes = [
		1.0, 0.399064778, 0.229404484, 0.151836061,
		0.196754229, 0.093742264, 0.060871957,
		0.138605419, 0.010535002, 0.071021868,
		0.029954614, 0.051299684, 0.055948288,
		0.066208224, 0.010067391, 0.00753679,
		0.008196947, 0.012955577, 0.007316738,
		0.006216476, 0.005116215, 0.006243983,
		0.002860679, 0.002558108, 0.0, 0.001650392];
	
	for (var i = 1; i <= voice.amplitudes.length; i++)
	{
		var oscillator = this.audioCtx.createOscillator();
		oscillator.frequency.value = pitchInHertz * i;
		oscillator.type = "sine";
		
		var gainNode = this.audioCtx.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(this.audioCtx.destination);
		gainNode.gain.value = voice.amplitudes[i - 1] * volume * this.globalVolume;
		
		oscillator.start(0);
		
		voice.oscillators.push(oscillator);
		voice.gainNodes.push(gainNode);
	}
	
	voice.time = 0;
	voice.duration = duration;
	this.voices.push(voice);
}


Synth.prototype.playNoteDelayed = function(midiPitch, delay, duration, volume)
{
	this.delayedNotes.push({
		midiPitch: midiPitch,
		delay: delay,
		duration: duration,
		volume: volume
	});
}


Synth.prototype.stopAll = function()
{
	for (var i = this.voices.length - 1; i >= 0; i--)
	{
		this.stopVoice(i);
	}
	
	this.voices = [];
}


Synth.prototype.stopVoice = function(index)
{
	var voice = this.voices[index];
	for (var i = 0; i < voice.oscillators.length; i++)
		voice.oscillators[i].stop(0);
}