Timeline.prototype.playbackToggle = function()
{
	if (this.playing)
		this.playbackStop();
	else
		this.playbackStart();
}


Timeline.prototype.playbackStart = function()
{
	this.playing = true;
	
	var playbackStartTime  = this.cursorTime1;
	var timeToSecondsScale = 60 / this.bpm / (this.TIME_PER_WHOLE_NOTE / 4);
	
	this.playingTime    = playbackStartTime;
	this.playingTimeEnd = playbackStartTime;
	this.scrollTimeIntoView(playbackStartTime);
	
	var that = this;
	this.trackNotes.elements.enumerateAll(function (elem)
	{
		if (elem.note == null)
			return;
		
		if (elem.note.timeRange.end <= playbackStartTime)
			return;
		
		that.playingTimeEnd = Math.max(
			elem.note.timeRange.end,
			that.playingTimeEnd);
		
		var startSecond = Math.max(0, (elem.note.timeRange.start - playbackStartTime) * timeToSecondsScale);
		var endSecond   = Math.max(0, (elem.note.timeRange.end   - playbackStartTime) * timeToSecondsScale);
		that.synth.addNoteOn (startSecond, 0, elem.note.pitch.midiPitch, 1);
		that.synth.addNoteOff(endSecond,   0, elem.note.pitch.midiPitch);
	});
	
	this.synth.sortEvents();
	this.markDirtyAll();
	
	this.playbackInterval = setInterval(function() { that.playbackRefresh(1 / 60); }, 1000 / 60);
}


Timeline.prototype.playbackStop = function()
{
	this.playing = false;
	
	clearInterval(this.playbackInterval);
	this.playbackInterval = null;
	
	this.synth.stopAll();
	this.markDirtyAll();
	this.scrollTimeIntoView(this.cursorTime1);
}


Timeline.prototype.playbackRefresh = function(deltaSeconds)
{
	if (!this.playing)
		return;
	
	var timeToSecondsScale = 60 / this.bpm / (this.TIME_PER_WHOLE_NOTE / 4);
	
	this.markDirtyPixels(this.playingTime, 5);
	this.markDirtyPixels(this.playingTime + deltaSeconds / timeToSecondsScale, 5);
	this.markDirty(this.playingTime, this.playingTime + deltaSeconds / timeToSecondsScale);
	
	this.playingTime += deltaSeconds / timeToSecondsScale;
	
	if (this.playingTime >= this.playingTimeEnd)
		this.playbackStop();
	
	this.redraw();
}