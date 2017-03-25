function Synth()
{
	this.audioCtx      = new AudioContext();
	this.interval      = null;
	this.globalVolume  = 0.1;
	this.time          = 0;
	this.noteOnEvents  = [];
	this.noteOffEvents = [];
	this.voices        = [];
	this.processCallback = null;
	
	this.instruments = [InstrumentPiano, InstrumentPiano];
}


Synth.prototype.play = function(callback)
{
	if (this.interval != null)
		clearInterval(this.interval);
	
	this.processCallback = callback;
	
	this.sortEvents();
	
	var that = this;
	this.interval = setInterval(function() { that.process(1 / 60); }, 1000 / 60);
}


Synth.prototype.stop = function()
{
	if (this.interval != null)
		clearInterval(this.interval);
	
	this.interval = null;	
}


Synth.prototype.clear = function()
{
	for (var i = this.voices.length - 1; i >= 0; i--)
		this.voiceStop(i);
	
	this.voices        = [];
	this.noteOnEvents  = [];
	this.noteOffEvents = [];
	
	this.time = 0;
}


Synth.prototype.process = function(deltaTime)
{
	this.time += deltaTime;
	
	if (this.processCallback != null)
		this.processCallback(this.time);
	
	// Process note events.
	var noteOnProcessed = 0;
	var noteOffProcessed = 0;
	
	while (true)
	{
		// Handle pending note on events up to the current time.
		if (noteOnProcessed < this.noteOnEvents.length &&
			this.noteOnEvents[noteOnProcessed].time <= this.time)
		{
			var ev = this.noteOnEvents[noteOnProcessed];
			noteOnProcessed++;
			
			this.voiceStart(ev.instrumentIndex, ev.midiPitch, ev.volume);
		}
		
		// Handle pending note off events up to the current time.
		else if (noteOffProcessed < this.noteOffEvents.length &&
			this.noteOffEvents[noteOffProcessed].time <= this.time)
		{
			var ev = this.noteOffEvents[noteOffProcessed];
			noteOffProcessed++;
			
			for (var j = 0; j < this.voices.length; j++)
			{
				var voice = this.voices[j];
				if (voice.instrumentIndex == ev.instrumentIndex &&
					voice.midiPitch == ev.midiPitch)
				{
					this.voiceRelease(j);
				}
			}
		}
		
		// Else, there are no more events up to the current time.
		else
			break;
	}
	
	// Remove processed events.
	this.noteOnEvents.splice(0, noteOnProcessed);
	this.noteOffEvents.splice(0, noteOffProcessed);
	
	// Update audio output.
	for (var i = this.voices.length - 1; i >= 0; i--)
	{
		var voice = this.voices[i];
		
		voice.time += deltaTime;
		if (voice.released)
			voice.timeReleased += deltaTime;
		
		var frequencies = this.instruments[voice.instrumentIndex].generate(
			voice.time, voice.timeReleased, voice.midiPitch);
		
		if (frequencies == null)
		{
			this.voiceStop(i);
			this.voices.splice(i, 1);
		}
		else
		{
			for (var j = 0; j < frequencies.length; j++)
			{
				voice.oscillators[j].frequency.value =
					Math.min(24000, frequencies[j][0] * voice.frequencyInHertz);
				
				voice.gainNodes[j].gain.value = frequencies[j][1] * voice.volume * this.globalVolume;
			}
		}
	}
}


Synth.prototype.addNoteOn = function(time, instrumentIndex, midiPitch, volume)
{
	this.noteOnEvents.push({
		time:            time + this.time,
		instrumentIndex: instrumentIndex,
		midiPitch:       midiPitch,
		volume:          volume
	});
}


Synth.prototype.addNoteOff = function(time, instrumentIndex, midiPitch)
{
	this.noteOffEvents.push({
		time:            time + this.time,
		instrumentIndex: instrumentIndex,
		midiPitch:       midiPitch
	});
}


Synth.prototype.sortEvents = function()
{
	this.noteOnEvents.sort(function (a, b)
		{ return a.time - b.time; });
		
	this.noteOffEvents.sort(function (a, b)
		{ return a.time - b.time; });
}


Synth.prototype.voiceStart = function(instrumentIndex, midiPitch, volume)
{
	for (var i = this.voices.length - 1; i >= 0; i--)
	{
		var otherVoice = this.voices[i];
		if (otherVoice.instrumentIndex == instrumentIndex &&
			otherVoice.midiPitch == midiPitch)
		{
			this.voiceStop(i);
			this.voices.splice(i, 1);
		}
	}
	
	var frequencyInHertz = Math.pow(2, (midiPitch - 69) / 12) * 440;
	
	var voice = {
		instrumentIndex:  instrumentIndex,
		midiPitch:        midiPitch,
		frequencyInHertz: frequencyInHertz,
		volume:           volume,
		time:             0,
		timeReleased:     0,
		released:         false,
		oscillators:      [],
		gainNodes:        []
	};
	
	var frequencies = this.instruments[instrumentIndex].generate(0, 0, midiPitch);
	if (frequencies == null)
		return;
	
	for (var i = 0; i < frequencies.length; i++)
	{
		var oscillator = this.audioCtx.createOscillator();
		oscillator.frequency.value = Math.min(24000, frequencies[i][0] * frequencyInHertz);
		oscillator.type = "sine";
		
		var gainNode = this.audioCtx.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(this.audioCtx.destination);
		gainNode.gain.value = frequencies[i][1] * volume * this.globalVolume;
		
		oscillator.start(0);
		
		voice.oscillators.push(oscillator);
		voice.gainNodes.push(gainNode);
	}
	
	this.voices.push(voice);
}


Synth.prototype.voiceRelease = function(index)
{
	var voice = this.voices[index];
	voice.released = true;
}


Synth.prototype.voiceStop = function(index)
{
	var voice = this.voices[index];
	for (var i = 0; i < voice.oscillators.length; i++)
		voice.oscillators[i].stop(0);
}