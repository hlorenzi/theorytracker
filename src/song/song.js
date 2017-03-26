function Song()
{
	this.length = new Rational(4);
	
	this.notes          = new ListByRange(function(item) { return { start: item.startTick, end: item.endTick }; });
	this.chords         = new ListByRange(function(item) { return { start: item.startTick, end: item.endTick }; });
	this.keyChanges     = new ListByPoint(function(item) { return item.tick; });
	this.meterChanges   = new ListByPoint(function(item) { return item.tick; });
	this.forcedMeasures = new ListByPoint(function(item) { return item.tick; });
	
	// TODO: Should be changeable
	// throughout the music.
	this.bpm = 120;
	
	this.sanitize();
}


Song.prototype.clear = function()
{
	this.length = new Rational(4);	
	this.notes.clear();
	this.chords.clear();
	this.keyChanges.clear();
	this.meterChanges.clear();
	this.forcedMeasures.clear();
	this.bpm = 120;
}


Song.prototype.setLengthAuto = function()
{
	this.length = new Rational(1);
	this.length.max(this.notes.getTotalRange().end);
	this.length.max(this.chords.getTotalRange().end);
	this.length.max(this.keyChanges.getTotalRange().end);
	this.length.max(this.meterChanges.getTotalRange().end);
	this.length.max(this.forcedMeasures.getTotalRange().end);
}


Song.prototype.sanitize = function()
{
	if (this.length.compare(new Rational(1)) <= 0)
		this.length = new Rational(1);
	
	if (this.keyChanges.findAt(new Rational(0)) == null)
		this.keyChanges.insert(new SongKeyChange(new Rational(0), 0, 0, { selected: false }));
	
	if (this.meterChanges.findAt(new Rational(0)) == null)
		this.meterChanges.insert(new SongMeterChange(new Rational(0), 4, 4, { selected: false }));
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

// Returns a JSON string containing the song data.
Song.prototype.save = function()
{
	this.notes.sort();
	this.chords.sort();
	this.keyChanges.sort();
	this.meterChanges.sort();
	this.forcedMeasures.sort();
	
	this.setLengthAuto();
	
	var json = "{\n";
	json += "  \"version\": 0,\n";
	json += "  \"length\": " + this.length.toString() + ",\n";
	json += "  \"bpm\": " + this.bpm + ",\n";
	
	json += "  \"notes\": [\n";
	
	for (var i = 0; i < this.notes.items.length; i++)
	{
		var note = this.notes.items[i];
		
		json += "    ";
		json += "[ " + note.startTick.toString() + ", ";
		json += note.endTick.toString() + ", ";
		json += note.trackIndex.toString() + ", ";
		json += note.midiPitch.toString() + " ]";
		
		if (i < this.notes.items.length - 1)
			json += ",";
		
		json += "\n";
	}
	
	json += "  ],\n";
	json += "  \"chords\": [\n";
	
	for (var i = 0; i < this.chords.items.length; i++)
	{
		var chord = this.chords.items[i];
		
		json += "    ";
		json += "[ " + chord.startTick.toString() + ", ";
		json += chord.endTick.toString() + ", ";
		json += chord.chordKindIndex.toString() + ", ";
		json += chord.rootMidiPitch.toString() + ", ";
		json += "[] ]";//chord.embelishments.toString() + " ]";
		
		if (i < this.chords.items.length - 1)
			json += ",";
		
		json += "\n";
	}
	
	json += "  ],\n";
	json += "  \"keyChanges\": [\n";
	
	for (var i = 0; i < this.keyChanges.items.length; i++)
	{
		var keyCh = this.keyChanges.items[i];
		
		json += "    ";
		json += "[ " + keyCh.tick.toString() + ", ";
		json += keyCh.scaleIndex.toString() + ", ";
		json += keyCh.tonicMidiPitch.toString() + " ]";
		
		if (i < this.keyChanges.items.length - 1)
			json += ",";
		
		json += "\n";
	}
	
	json += "  ],\n";
	json += "  \"meterChanges\": [\n";
	
	for (var i = 0; i < this.meterChanges.items.length; i++)
	{
		var meterCh = this.meterChanges.items[i];
		
		json += "    ";
		json += "[ " + meterCh.tick.toString()  + ", ";
		json += meterCh.numerator.toString()  + ", ";
		json += meterCh.denominator.toString()  + " ]";
		
		if (i < this.meterChanges.items.length - 1)
			json += ",";
		
		json += "\n";
	}
	
	json += "  ]\n}";
	
	return json;
}


// Loads the song data contained in the given string.
// Will throw an exception on error.
Song.prototype.load = function(jsonStr)
{
	this.clear();
	
	var song = JSON.parse(jsonStr);
	this.bpm = song.bpm;
	
	for (var i = 0; i < song.notes.length; i++)
	{
		this.notes.insert(new SongNote(
			Rational.fromArray(song.notes[i][0]),
			Rational.fromArray(song.notes[i][1]),
			song.notes[i][2],
			song.notes[i][3]));
	}
	
	for (var i = 0; i < song.chords.length; i++)
	{
		this.chords.insert(new SongChord(
			Rational.fromArray(song.chords[i][0]),
			Rational.fromArray(song.chords[i][1]),
			song.chords[i][2],
			song.chords[i][3],
			[]));
	}
	
	for (var i = 0; i < song.keyChanges.length; i++)
	{
		this.keyChanges.insert(new SongKeyChange(
			Rational.fromArray(song.keyChanges[i][0]),
			song.keyChanges[i][1],
			song.keyChanges[i][2]));
	}
	
	for (var i = 0; i < song.meterChanges.length; i++)
	{
		this.meterChanges.insert(new SongMeterChange(
			Rational.fromArray(song.meterChanges[i][0]),
			song.meterChanges[i][1],
			song.meterChanges[i][2]));
	}
	
	this.setLengthAuto();
	this.sanitize();
}