function Synth()
{
	this.audioCtx      = new AudioContext();
	this.globalVolume  = 0.1;
	this.time          = 0;
	this.noteOnEvents  = [];
	this.noteOffEvents = [];
	this.voices        = [];
}


Synth.prototype.process = function(deltaTime)
{
	this.time += deltaTime;
	
	// Process note events.
	var noteOnProcessed = 0;
	var noteOffProcessed = 0;
	
	while (true)
	{
		var processWhichKind = -1;
		var nextEventTime = this.time;
		
		// Determine which event is next up.
		if (noteOnProcessed < this.noteOnEvents.length &&
			this.noteOnEvents[noteOnProcessed].time < nextEventTime)
		{
			processWhichKind = 0;
			nextEventTime = this.noteOnEvents[noteOnProcessed].time;
		}
		
		if (noteOffProcessed < this.noteOffEvents.length &&
			this.noteOffEvents[noteOffProcessed].time < nextEventTime)
		{
			processWhichKind = 1;
			nextEventTime = this.noteOffEvents[noteOffProcessed].time;
		}
		
		if (processWhichKind == -1)
			break;
		
		// Process next event.
		switch (processWhichKind)
		{
			case 0:
			{
				var ev = this.noteOnEvents[noteOnProcessed];
				noteOnProcessed++;
				this.voiceStart(ev.instrument, ev.midiPitch, ev.volume);
				break;
			}
			case 1:
			{
				var ev = this.noteOffEvents[noteOffProcessed];
				
				noteOffProcessed++;
				processedEvent = true;
				
				for (var j = 0; j < this.voices.length; j++)
				{
					var voice = this.voices[j];
					if (voice.instrument == ev.instrument &&
						voice.midiPitch == ev.midiPitch)
					{
						this.voiceOff(j);
					}
				}
				break;
			}
		}
	}
	
	// Remove processed events.
	this.noteOnEvents.splice(0, noteOnProcessed);
	this.noteOffEvents.splice(0, noteOffProcessed);
	
	// Update audio output.
	for (var i = this.voices.length - 1; i >= 0; i--)
	{
		var voice = this.voices[i];
		
		voice.timer += deltaTime;
		
		var envelope = 1;
		if (voice.off)
			envelope = Math.max(0, 1 - voice.timer / 0.1);
		else
		{
			if (voice.timer < 0.1)
				envelope = Math.max(1, 1.75 - voice.timer / 0.2);
			else
				envelope = Math.max(0.5, 1 - voice.timer / 0.5);
		}
		
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
		time:       time + this.time,
		instrument: instrument,
		midiPitch:  midiPitch,
		volume:     volume
	});
}


Synth.prototype.addNoteOff = function(time, instrument, midiPitch)
{
	this.noteOffEvents.push({
		time:       time + this.time,
		instrument: instrument,
		midiPitch:  midiPitch
	});
}


Synth.prototype.sortEvents = function()
{
	this.noteOnEvents.sort(function (a, b)
		{ return a.time - b.time; });
		
	this.noteOffEvents.sort(function (a, b)
		{ return a.time - b.time; });
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
	
	this.time = 0;
}