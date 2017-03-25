function Song()
{
	this.length = new Rational(1);
	
	this.notes        = new ListByRange(function(item) { return { start: item.startTick, end: item.endTick }; });
	this.chords       = new ListByRange(function(item) { return { start: item.startTick, end: item.endTick }; });
	this.keyChanges   = new ListByPoint(function(item) { return item.tick; });
	this.meterChanges = new ListByPoint(function(item) { return item.tick; });
	this.measures     = new ListByPoint(function(item) { return item.tick; });
	
	// TODO: Should be changeable
	// throughout the music.
	this.bpm = 120;
	
	this.sanitize();
}


Song.prototype.sanitize = function()
{
	if (this.length.compare(new Rational(1)) <= 0)
		this.length = new Rational(1);
	
	if (this.keyChanges.findPrevious(new Rational(0)) == null)
		this.keyChanges.insert(new SongKeyChange(new Rational(0), null, 0));
	
	if (this.meterChanges.findPrevious(new Rational(0)) == null)
		this.meterChanges.insert(new SongMeterChange(new Rational(0), 4, 4));
}


Song.prototype.feedSynth = function(synth, startTick)
{
	var that = this;
	
	// Register notes.
	this.notes.enumerateAll(function (note)
	{
		if (note.endTick.compare(startTick) <= 0)
			return;
		
		var offsetStart = note.startTick.clone().subtract(startTick);
		var offsetEnd = note.endTick.clone().subtract(startTick);
		
		var timeStart = offsetStart.asFloat() * (1000 / that.bpm / 4);
		var timeEnd = offsetEnd.asFloat() * (1000 / that.bpm / 4);
		
		synth.addNoteOn(timeStart, 0, note.midiPitch, 1);
		synth.addNoteOff(timeEnd - 0.01, 0, note.midiPitch);
	});
	
	// Register chords.
	this.chords.enumerateAll(function (chord)
	{
		if (chord.endTick.compare(startTick) <= 0)
			return;
		
		var pitches = Theory.calculateChordPitches(
			chord.chordKindIndex, chord.rootMidiPitch, chord.embelishments);
		
		for (var j = 0; j < pitches.length; j++)
		{
			var offsetStart = chord.startTick.clone().subtract(startTick);
			var offsetEnd = chord.endTick.clone().subtract(startTick);
			
			var timeStart = offsetStart.asFloat() * (1000 / that.bpm / 4);
			var timeEnd = offsetEnd.asFloat() * (1000 / that.bpm / 4);
			
			synth.addNoteOn(timeStart, 1, pitches[j], 1);
			synth.addNoteOff(timeEnd - 0.01, 1, pitches[j], 1);
		}
	});
}