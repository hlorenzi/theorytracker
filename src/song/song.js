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


Song.prototype.feedSynth = function(synth, startTick, useChordPatterns = true)
{
	var that = this;
	var chordVolumeMul = 0.5;
	
	var addNoteEvent = function(tickStart, duration, instrument, midiPitch, volume)
	{
		var offsetStart = tickStart.clone().subtract(startTick);
		
		var timeStart = offsetStart.asFloat() * (1000 / that.bpm / 4);
		var timeDuration = duration.asFloat() * (1000 / that.bpm / 4);
		
		if (timeStart <= 0)
		{
			timeDuration += timeStart;
			timeStart = 0;
		}
		
		if (timeDuration <= 0)
			return;
		
		synth.addNoteEvent(timeStart, instrument, midiPitchToHertz(midiPitch), volume, timeDuration);
	}
	
	// Register notes.
	this.notes.enumerateAll(function (note)
	{
		if (note.endTick.compare(startTick) <= 0)
			return;
		
		addNoteEvent(note.startTick, note.endTick.clone().subtract(note.startTick), 0, note.midiPitch, 1);
	});
	
	// Register chords.
	this.chords.enumerateAll(function (chord)
	{
		if (chord.endTick.compare(startTick) <= 0)
			return;
		
		var pitches = Theory.calculateChordPitches(
			chord.chordKindIndex, chord.rootMidiPitch, chord.embelishments);
			
		if (!useChordPatterns)
		{
			for (var j = 0; j < pitches.length; j++)
				addNoteEvent(chord.startTick, chord.endTick.clone().subtract(chord.startTick), 1, pitches[j], chordVolumeMul);
			return;
		}
			
		var meter = that.meterChanges.findPrevious(chord.startTick);
		var meterBeatLength = meter.getBeatLength();
		
		var pattern = Theory.calculateChordStrummingPattern(
			meter.numerator, meter.denominator);
		
		var tick = meter.tick.clone();
		var skipTick = new Rational(0);
		var patternIndex = 0;
		var mustPlayFirstBeat = false;
		
		while (tick.compare(chord.endTick) < 0)
		{
			var patternBeat = pattern[patternIndex];
			var patternBeatKind = patternBeat[0];
			var patternBeatLength = patternBeat[1].clone().multiply(meterBeatLength);
			patternIndex = (patternIndex + 1) % pattern.length;
			
			var nextTick = tick.clone().add(patternBeatLength);
			if (nextTick.compare(chord.endTick) > 0)
			{
				nextTick = chord.endTick.clone();
				patternBeatLength = nextTick.clone().subtract(tick);
			}
			
			// Handle beats after the first one.
			if (tick.compare(chord.startTick) > 0 && skipTick.compare(new Rational(0)) <= 0)
			{
				if (mustPlayFirstBeat)
				{
					mustPlayFirstBeat = false;
					for (var j = 0; j < pitches.length; j++)
						addNoteEvent(chord.startTick, tick.clone().subtract(chord.startTick), 1, pitches[j], chordVolumeMul);
				}
				
				switch (patternBeatKind)
				{
					case 0:
					{
						for (var j = 0; j < pitches.length; j++)
							addNoteEvent(tick, patternBeatLength, 1, pitches[j], 0.9 * chordVolumeMul);
						break;
					}
					case 1:
					{
						for (var j = 1; j < pitches.length; j++)
							addNoteEvent(tick, patternBeatLength, 1, pitches[j], 0.5 * chordVolumeMul);
						break;
					}
					case 2:
					{
						addNoteEvent(tick, patternBeatLength, 1, pitches[0], 0.5 * chordVolumeMul);
						break;
					}
				}
			}
			
			skipTick.subtract(patternBeatLength);
			
			// Mark first beat occurred; will register notes on next beat, to account
			// for longer starting beats due to off-beat chords.
			if (tick.compare(chord.startTick) <= 0 && nextTick.compare(chord.startTick) > 0)
			{
				mustPlayFirstBeat = true;
				
				if (!(tick.compare(chord.startTick) == 0 && patternBeatKind == 0))
					skipTick = pattern[0][1].clone().multiply(meterBeatLength);
			}
			
			tick = nextTick;
		}
		
		if (mustPlayFirstBeat)
		{
			mustPlayFirstBeat = false;
			for (var j = 0; j < pitches.length; j++)
				addNoteEvent(chord.startTick, tick.clone().subtract(chord.startTick), 1, pitches[j], 0.7);
		}
	});
}

// Returns a JSON string containing the song data.
Song.prototype.saveJSON = function()
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
Song.prototype.loadJSON = function(jsonStr)
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


// Returns a compressed Base-64 string containing the song data.
Song.prototype.saveBinary = function()
{
	this.notes.sort();
	this.chords.sort();
	this.keyChanges.sort();
	this.meterChanges.sort();
	this.forcedMeasures.sort();
	this.setLengthAuto();
	
	var writer = new BinaryWriter();
	
	writer.writeInteger(0); // Version.
	writer.writeRational(this.length)
	writer.writeInteger(this.bpm);
	
	writer.writeInteger(this.notes.items.length);
	for (var i = 0; i < this.notes.items.length; i++)
	{
		var note = this.notes.items[i];
		
		writer.writeRational(note.startTick);
		writer.writeRational(note.endTick);
		writer.writeInteger(note.trackIndex);
		writer.writeInteger(note.midiPitch - 60); // Arbitrary bias to save bytes in the most common cases.
	}
	
	writer.writeInteger(this.chords.items.length);
	for (var i = 0; i < this.chords.items.length; i++)
	{
		var chord = this.chords.items[i];
		
		writer.writeRational(chord.startTick);
		writer.writeRational(chord.endTick);
		writer.writeInteger(chord.chordKindIndex);
		writer.writeInteger(chord.rootMidiPitch);
		writer.writeInteger(0); // Embelishment count.
	}
	
	writer.writeInteger(this.keyChanges.items.length);
	for (var i = 0; i < this.keyChanges.items.length; i++)
	{
		var keyCh = this.keyChanges.items[i];
		
		writer.writeRational(keyCh.tick);
		writer.writeInteger(keyCh.scaleIndex);
		writer.writeInteger(keyCh.tonicMidiPitch);
	}
	
	writer.writeInteger(this.meterChanges.items.length);
	for (var i = 0; i < this.meterChanges.items.length; i++)
	{
		var meterCh = this.meterChanges.items[i];
		
		writer.writeRational(meterCh.tick);
		writer.writeInteger(meterCh.numerator);
		writer.writeInteger(meterCh.denominator);
	}
	
	var data = writer.data;
	data = pako.deflateRaw(data, { to: "string" });
	data = window.btoa(data);
	return data;
}


// Loads the song data contained in the given string.
// Will throw an exception on error.
Song.prototype.loadBinary = function(base64str)
{
	this.clear();
	
	var data = window.atob(base64str);
	data = pako.inflateRaw(data);
	
	var reader = new BinaryReader(data);
	
	reader.readInteger(); // Version.
	reader.readRational(); // Length.
	this.bpm = reader.readInteger();
	
	var noteNum = reader.readInteger();
	for (var i = 0; i < noteNum; i++)
	{
		this.notes.insert(new SongNote(
			reader.readRational(),
			reader.readRational(),
			reader.readInteger(),
			reader.readInteger() + 60));
	}
	
	var chordNum = reader.readInteger();
	for (var i = 0; i < chordNum; i++)
	{
		this.chords.insert(new SongChord(
			reader.readRational(),
			reader.readRational(),
			reader.readInteger(),
			reader.readInteger(),
			[]));
			
		reader.readInteger(); // Embelishment count.
	}
	
	var keyChNum = reader.readInteger();
	for (var i = 0; i < keyChNum; i++)
	{
		this.keyChanges.insert(new SongKeyChange(
			reader.readRational(),
			reader.readInteger(),
			reader.readInteger()));
	}
	
	var meterChNum = reader.readInteger();
	for (var i = 0; i < meterChNum; i++)
	{
		this.meterChanges.insert(new SongMeterChange(
			reader.readRational(),
			reader.readInteger(),
			reader.readInteger()));
	}
	
	this.setLengthAuto();
	this.sanitize();
}