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
	
	this.playingTime    = playbackStartTime;
	this.playingTimeEnd = playbackStartTime;
	this.scrollTimeIntoView(playbackStartTime);
	
	var that = this;
	this.trackNotes.elements.enumerateAll(function (elem)
	{
		if (elem.note == null)
			return;
		
		that.playNote(
			elem.note.timeRange.start,
			elem.note.timeRange.end,
			0,
			elem.note.pitch.midiPitch,
			1);
	});
	
	this.trackChords.elements.enumerateAll(function (elemChord)
	{
		if (elemChord.chord == null)
			return;
		
		var bassPitch = theory.chordBassPitch(elemChord.chord.chordIndex, elemChord.chord.rootMidiPitch);
		var mainPitches = theory.chordMainPitches(elemChord.chord.chordIndex, elemChord.chord.rootMidiPitch);
		
		that.trackMeters.enumerateMetersAtRange(elemChord.chord.timeRange, function (meter, start, end)
		{
			var bassVoicing = theory.chordBassVoicingInMeter(meter);
			var mainVoicing = theory.chordMainVoicingInMeter(meter);
			var beatDuration = that.TIME_PER_WHOLE_NOTE / meter.denominator;
			
			for (var t = meter.time; t < end; t += beatDuration * meter.numerator)
			{
				for (var v = 0; v < bassVoicing.length; v++)
				{
					var noteStart = t + bassVoicing[v][0] * beatDuration;
					var noteEnd   = Math.min(end, t + bassVoicing[v][1] * beatDuration);
					
					if (noteStart < start ||
						noteStart >= end)
						continue;
					
					that.playNote(
						noteStart,
						noteEnd,
						1,
						bassPitch,
						bassVoicing[v][2]);
				}
				
				for (var v = 0; v < mainVoicing.length; v++)
				{
					var noteStart = t + mainVoicing[v][0] * beatDuration;
					var noteEnd   = Math.min(end, t + mainVoicing[v][1] * beatDuration);
					
					if (noteStart < start ||
						noteStart >= end)
						continue;
					
					for (var p = 0; p < mainPitches.length; p++)
					{
						that.playNote(
							noteStart,
							noteEnd,
							1,
							mainPitches[p],
							mainVoicing[v][2]);
					}
				}
			}
		});
	});
	
	this.synth.sortEvents();
	this.markDirtyAll();
	
	this.playbackInterval = setInterval(function() { that.playbackRefresh(1 / 60); }, 1000 / 60);
}


Timeline.prototype.playNote = function(start, end, instrument, midiPitch, volume)
{
	if (end < this.playingTime)
		return;
	
	var timeToSecondsScale = 60 / this.bpm / (this.TIME_PER_WHOLE_NOTE / 4);
	
	this.playingTimeEnd = Math.max(
		end,
		this.playingTimeEnd);
		
	var startSecond = Math.max(0, (start - this.playingTime      ) * timeToSecondsScale);
	var endSecond   = Math.max(0, (end   - this.playingTime - 0.5) * timeToSecondsScale);
	this.synth.addNoteOn (startSecond, instrument, midiPitch, volume);
	this.synth.addNoteOff(endSecond,   instrument, midiPitch);
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