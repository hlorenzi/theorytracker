function Synth()
{
	this.audioCtx      = new AudioContext();
	this.globalVolume  = 0.1;
	this.noteOnEvents  = [];
	this.noteOffEvents = [];
	this.voices        = [];
}


Synth.prototype.process = function(deltaTime)
{
	for (var i = this.noteOnEvents.length - 1; i >= 0; i--)
	{
		var ev = this.noteOnEvents[i];
		
		if (ev.time <= 0)
		{
			this.voiceStart(ev.instrument, ev.midiPitch, ev.volume);
			this.noteOnEvents.splice(i, 1);
		}
		else
			ev.time -= deltaTime;
	}
	
	for (var i = this.noteOffEvents.length - 1; i >= 0; i--)
	{
		var ev = this.noteOffEvents[i];
		
		if (ev.time <= 0)
		{
			for (var j = 0; j < this.voices.length; j++)
			{
				var voice = this.voices[j];
				if (voice.instrument == ev.instrument &&
					voice.midiPitch == ev.midiPitch)
				{
					this.voiceOff(j);
				}
			}
			
			this.noteOffEvents.splice(i, 1);
		}
		else
			ev.time -= deltaTime;
	}
	
	for (var i = this.voices.length - 1; i >= 0; i--)
	{
		var voice = this.voices[i];
		
		voice.timer += deltaTime;
		
		var envelope = 1;
		if (voice.off)
			envelope = Math.max(0, 1 - voice.timer / 0.1);
		else
			envelope = Math.max(1, 1.5 - voice.timer / 0.05);
		
		if (voice.off && voice.timer > 0.1)
		{
			this.voiceStop(i);
			this.voices.splice(i, 1);
		}
		else
		{
			for (var j = 0; j < voice.gainNodes.length; j++)
			{
				if (voice.gainNodes[j] != null)
					voice.gainNodes[j].gain.value = voice.amplitudes[j] * voice.volume * envelope * this.globalVolume;
			}
		}
	}
}


Synth.prototype.addNoteOn = function(time, instrument, midiPitch, volume)
{
	this.noteOnEvents.push({
		time:        time,
		instrument:  instrument,
		midiPitch:   midiPitch,
		volume:      volume
	});
}


Synth.prototype.addNoteOff = function(time, instrument, midiPitch)
{
	this.noteOffEvents.push({
		time:        time,
		instrument:  instrument,
		midiPitch:   midiPitch
	});
}


Synth.prototype.voiceStart = function(instrument, midiPitch, volume)
{
	for (var i = this.voices.length - 1; i >= 0; i--)
	{
		var otherVoice = this.voices[i];
		if (otherVoice.instrument == instrument &&
			otherVoice.midiPitch == midiPitch)
		{
			this.voiceStop(i);
			this.voices.splice(i, 1);
		}
	}
			
	var voice = {
		instrument:  instrument,
		midiPitch:   midiPitch,
		volume:      volume,
		timer:       0,
		off:         false,
		amplitudes:  [],
		oscillators: [],
		gainNodes:   []
	};
	
	var frequencyInHertz = Math.pow(2, (midiPitch - 69) / 12) * 440;
	
	switch (instrument)
	{
		case 0:
		{
			// Square wave harmonics.
			voice.amplitudes = [1, 0, 1 / 3, 0, 1 / 5, 0, 1 / 7, 0, 1 / 9];
			break;
		}
		case 1:
		{
			// Triangle wave harmonics.
			voice.amplitudes = [1, 0, 1 / 9, 0, 1 / 25, 0, 1 / 49, 0, 1 / 81];
			break;
		}
	}
	
	for (var i = 0; i < voice.amplitudes.length; i++)
	{
		if (voice.amplitudes[i] == 0)
		{
			voice.oscillators.push(null);
			voice.gainNodes.push(null);
		}
		else
		{		
			var oscillator = this.audioCtx.createOscillator();
			oscillator.frequency.value = frequencyInHertz * (i + 1);
			oscillator.type = "sine";
			
			var gainNode = this.audioCtx.createGain();
			oscillator.connect(gainNode);
			gainNode.connect(this.audioCtx.destination);
			gainNode.gain.value = voice.amplitudes[i] * volume * this.globalVolume;
			
			oscillator.start(0);
			
			voice.oscillators.push(oscillator);
			voice.gainNodes.push(gainNode);
		}
	}
	
	this.voices.push(voice);
}


Synth.prototype.voiceOff = function(index)
{
	var voice   = this.voices[index];
	voice.off   = true;
	voice.timer = 0;
}


Synth.prototype.voiceStop = function(index)
{
	var voice = this.voices[index];
	for (var i = 0; i < voice.oscillators.length; i++)
	{
		if (voice.oscillators[i] != null)
			voice.oscillators[i].stop(0);
	}
}


Synth.prototype.stopAll = function()
{
	for (var i = this.voices.length - 1; i >= 0; i--)
		this.voiceStop(i);
	
	this.voices        = [];
	this.noteOnEvents  = [];
	this.noteOffEvents = [];
}