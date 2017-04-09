function Synth()
{
	this.audioCtx     = new AudioContext();
	this.interval     = null;
	this.time         = 0;
	this.noteEvents   = [];
	this.playingNotes = [];
	this.processCallback = null;
	
	this.audioCtxOutput = this.audioCtx.createGain();
	this.audioCtxOutput.connect(this.audioCtx.destination);
	this.audioCtxOutput.gain.value = 0.5;
	
	var piano = new Instrument(this,
	[
		[  55.0, "audio/piano/a1.mp3"],
		[ 110.0, "audio/piano/a2.mp3"],
		[ 220.0, "audio/piano/a3.mp3"],
		[ 440.0, "audio/piano/a4.mp3"],
		[ 880.0, "audio/piano/a5.mp3"],
		[1760.0, "audio/piano/a6.mp3"],
		[3520.0, "audio/piano/a7.mp3"]
	]);
	
	this.instruments = [piano, piano];
}


Synth.prototype.play = function(callback)
{
	if (this.interval != null)
		clearInterval(this.interval);
	
	this.processCallback = callback;
	
	this.noteEvents.sort(function (a, b) { return a.time - b.time; });
	
	var that = this;
	this.interval = setInterval(function() { that.process(1 / 60); }, 1000 / 60);
}


Synth.prototype.stop = function()
{
	this.time = 0;
	this.noteEvents = [];
	
	if (this.interval != null)
		clearInterval(this.interval);
	
	this.interval = null;
	
	for (var i = 0; i < this.playingNotes.length; i++)
		this.playingNotes[i].stop();
	
	this.playingNotes = [];
}


Synth.prototype.process = function(deltaTime)
{
	this.time += deltaTime;
	
	if (this.processCallback != null)
		this.processCallback(this.time);
	
	// Process pending note events up to the current time.
	var noteEventsProcessed = 0;
	while (noteEventsProcessed < this.noteEvents.length &&
		this.noteEvents[noteEventsProcessed].time <= this.time)
	{
		var ev = this.noteEvents[noteEventsProcessed];
		noteEventsProcessed++;
		
		var noteData =
			this.instruments[ev.instrumentIndex].playNote(ev.frequency, ev.volume, ev.duration);
			
		var that = this;
		noteData.process = function(deltaTime)
		{
			that.instruments[ev.instrumentIndex].processNote(this, deltaTime);
		};
		
		noteData.stop = function()
		{
			that.instruments[ev.instrumentIndex].stopNote(this);
		};
			
		this.playingNotes.push(noteData);
	}
	
	// Remove processed events.
	this.noteEvents.splice(0, noteEventsProcessed);
	
	// Update audio output.
	for (var i = this.playingNotes.length - 1; i >= 0; i--)
	{
		if (this.playingNotes[i].process(deltaTime))
			this.playingNotes.splice(i, 1);
	}
}


Synth.prototype.addNoteEvent = function(time, instrumentIndex, frequency, volume, duration)
{
	this.noteEvents.push({
		time:            time + this.time,
		instrumentIndex: instrumentIndex,
		frequency:       frequency,
		volume:          volume,
		duration:        duration
	});
}