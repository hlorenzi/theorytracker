function Song()
{
	this.CURRENT_TEXT_VERSION = 2;
	this.CURRENT_BINARY_VERSION = 2;
	
	this.length = new Rational(4);
	
	this.title = null;
	this.album = null;
	this.authors = null;
	
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
	this.title = null;
	this.album = null;
	this.authors = null;
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
		this.keyChanges.insert(new SongKeyChange(new Rational(0), 0, 0, 0, { selected: false }));
	
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
		
		var pitches = Theory.getChordPitches(chord);
			
		if (!useChordPatterns)
		{
			for (var j = 0; j < pitches.length; j++)
				addNoteEvent(chord.startTick, chord.endTick.clone().subtract(chord.startTick), 1, pitches[j], chordVolumeMul);
			return;
		}
			
		var meter = that.meterChanges.findPrevious(chord.startTick);
		var meterBeatLength = meter.getBeatLength();
		var measureBreak = that.forcedMeasures.findPrevious(chord.startTick);
		
		var pattern = Theory.getChordStrummingPattern(meter);
		
		var tick = meter.tick.clone();
		if (measureBreak != null)
			tick.max(measureBreak.tick);
		
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
	json += "  \"version\": " + this.CURRENT_TEXT_VERSION.toString() + ",\n";
	json += "  \"length\": " + this.length.toString() + ",\n";
	json += "  \"title\": " + JSON.stringify(this.title) + ",\n";
	json += "  \"album\": " + JSON.stringify(this.album) + ",\n";
	json += "  \"authors\": " + JSON.stringify(this.authors) + ",\n";
	json += "  \"bpm\": " + this.bpm + ",\n";
	
	json += "  \"tracks\": [\n";
	
	var trackNum = 1;
	for (var j = 0; j < trackNum; j++) // For each note track (currently only one is available).
	{
		json += "    {\n";
		json += "      \"notes\": [\n";
		
		for (var i = 0; i < this.notes.items.length; i++)
		{
			var note = this.notes.items[i];
			
			json += "        ";
			json += "[ " + note.startTick.toString() + ", ";
			json += (note.endTick.clone().subtract(note.startTick)).toString() + ", ";
			json += note.midiPitch.toString() + " ]";
			
			if (i < this.notes.items.length - 1)
				json += ",";
			
			json += "\n";
		}
		
		json += "      ]\n";
		
		json += "    }";
		if (j < trackNum - 1)
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
		json += (chord.endTick.clone().subtract(chord.startTick)).toString() + ", ";
		json += chord.chordKindIndex.toString() + ", ";
		json += chord.rootMidiPitch.toString() + ", ";
		json += chord.rootAccidentalOffset.toString() + ", ";
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
		json += keyCh.tonicMidiPitch.toString() + ", ";
		json += keyCh.accidentalOffset.toString() + " ]";
		
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
	
	json += "  ],\n";
	json += "  \"measureBreaks\": [\n";
	
	for (var i = 0; i < this.forcedMeasures.items.length; i++)
	{
		var measureBreak = this.forcedMeasures.items[i];
		
		json += "    ";
		json += "[ " + measureBreak.tick.toString()  + ", ";
		json += measureBreak.isLineBreak.toString()  + " ]";
		
		if (i < this.forcedMeasures.items.length - 1)
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
	
	if (song.version > this.CURRENT_TEXT_VERSION)
		throw "unsupported version";
	
	if (song.version >= 1)
	{
		this.title = song.title;
		this.album = song.album;
		this.authors = song.authors;
	}
	
	this.bpm = song.bpm;
	
	for (var j = 0; j < song.tracks.length; j++)
	{
		var track = song.tracks[j];
		
		for (var i = 0; i < track.notes.length; i++)
		{
			var startTick = Rational.fromArray(track.notes[i][0]);
			
			this.notes.insert(new SongNote(
				startTick,
				Rational.fromArray(track.notes[i][1]).add(startTick),
				j,
				track.notes[i][2]));
		}
	}
	
	for (var i = 0; i < song.chords.length; i++)
	{
		var startTick = Rational.fromArray(song.chords[i][0]);
		
		this.chords.insert(new SongChord(
			startTick,
			Rational.fromArray(song.chords[i][1]).add(startTick),
			song.chords[i][2],
			song.chords[i][3],
			song.chords[i][4],
			[]));
	}
	
	for (var i = 0; i < song.keyChanges.length; i++)
	{
		this.keyChanges.insert(new SongKeyChange(
			Rational.fromArray(song.keyChanges[i][0]),
			song.keyChanges[i][1],
			song.keyChanges[i][2],
			song.keyChanges[i][3]));
	}
	
	for (var i = 0; i < song.meterChanges.length; i++)
	{
		this.meterChanges.insert(new SongMeterChange(
			Rational.fromArray(song.meterChanges[i][0]),
			song.meterChanges[i][1],
			song.meterChanges[i][2]));
	}
	
	if (song.version >= 2)
	{
		for (var i = 0; i < song.measureBreaks.length; i++)
		{
			this.forcedMeasures.insert(new SongMeasureBreak(
				Rational.fromArray(song.measureBreaks[i][0]),
				song.measureBreaks[i][1]));
		}
	}
	
	this.setLengthAuto();
	this.sanitize();
}


// Returns a URL-safe compressed Base-64 string containing the song data.
Song.prototype.saveBinary = function()
{
	this.notes.sort();
	this.chords.sort();
	this.keyChanges.sort();
	this.meterChanges.sort();
	this.forcedMeasures.sort();
	this.setLengthAuto();
	
	var writer = new BinaryWriter();
	
	// Write header.
	writer.writeInteger(this.CURRENT_BINARY_VERSION); // Version.
	writer.writeString(this.title);
	writer.writeString(this.album);
	writer.writeString(this.authors);
	writer.writeRational(this.length);
	writer.writeInteger(this.bpm);
	
	// Write note tracks.
	var trackNum = 1;
	writer.writeInteger(trackNum);
	for (var j = 0; j < trackNum; j++)
	{
		// Write note data as an structure-of-arrays.
		writer.writeInteger(this.notes.items.length);
		
		for (var i = 0; i < this.notes.items.length; i++)
			writer.writeInteger(this.notes.items[i].startTick.integer);
		
		for (var i = 0; i < this.notes.items.length; i++)
			writer.writeInteger(this.notes.items[i].startTick.numerator);
		
		for (var i = 0; i < this.notes.items.length; i++)
		{
			if (this.notes.items[i].startTick.numerator != 0)
				writer.writeInteger(this.notes.items[i].startTick.denominator);
		}
		
		for (var i = 0; i < this.notes.items.length; i++)
			writer.writeInteger(this.notes.items[i].endTick.clone().subtract(this.notes.items[i].startTick).integer);
		
		for (var i = 0; i < this.notes.items.length; i++)
			writer.writeInteger(this.notes.items[i].endTick.clone().subtract(this.notes.items[i].startTick).numerator);
		
		for (var i = 0; i < this.notes.items.length; i++)
		{
			var duration = this.notes.items[i].endTick.clone().subtract(this.notes.items[i].startTick);
			if (duration.numerator != 0)
				writer.writeInteger(duration.denominator);
		}
		
		for (var i = 0; i < this.notes.items.length; i++)
			writer.writeInteger(this.notes.items[i].midiPitch - 60); // Arbitrary bias to save bytes in the most common cases.
	}
	
	// Write chord data as an structure-of-arrays.
	writer.writeInteger(this.chords.items.length);
	
	for (var i = 0; i < this.chords.items.length; i++)
		writer.writeInteger(this.chords.items[i].startTick.integer);
	
	for (var i = 0; i < this.chords.items.length; i++)
		writer.writeInteger(this.chords.items[i].startTick.numerator);
	
	for (var i = 0; i < this.chords.items.length; i++)
	{
		if (this.chords.items[i].startTick.numerator != 0)
			writer.writeInteger(this.chords.items[i].startTick.denominator);
	}
	
	for (var i = 0; i < this.chords.items.length; i++)
		writer.writeInteger(this.chords.items[i].endTick.clone().subtract(this.chords.items[i].startTick).integer);
	
	for (var i = 0; i < this.chords.items.length; i++)
		writer.writeInteger(this.chords.items[i].endTick.clone().subtract(this.chords.items[i].startTick).numerator);
	
	for (var i = 0; i < this.chords.items.length; i++)
	{
		var duration = this.chords.items[i].endTick.clone().subtract(this.chords.items[i].startTick);
		if (duration.numerator != 0)
			writer.writeInteger(duration.denominator);
	}
	
	for (var i = 0; i < this.chords.items.length; i++)
		writer.writeInteger(this.chords.items[i].chordKindIndex);
	
	for (var i = 0; i < this.chords.items.length; i++)
		writer.writeInteger(this.chords.items[i].rootMidiPitch + this.chords.items[i].rootAccidentalOffset * 12);
	
	for (var i = 0; i < this.chords.items.length; i++)
		writer.writeInteger(0); // Embelishment count.
	
	// Write key change data.
	writer.writeInteger(this.keyChanges.items.length);
	for (var i = 0; i < this.keyChanges.items.length; i++)
	{
		var keyCh = this.keyChanges.items[i];
		
		writer.writeRational(keyCh.tick);
		writer.writeInteger(keyCh.scaleIndex);
		writer.writeInteger(keyCh.tonicMidiPitch + keyCh.accidentalOffset * 12);
	}
	
	// Write meter change data.
	writer.writeInteger(this.meterChanges.items.length);
	for (var i = 0; i < this.meterChanges.items.length; i++)
	{
		var meterCh = this.meterChanges.items[i];
		
		writer.writeRational(meterCh.tick);
		writer.writeInteger(meterCh.numerator);
		writer.writeInteger(meterCh.denominator);
	}
	
	// Write measure break data.
	writer.writeInteger(this.forcedMeasures.items.length);
	for (var i = 0; i < this.forcedMeasures.items.length; i++)
	{
		var measureBreak = this.forcedMeasures.items[i];
		
		writer.writeRational(measureBreak.tick);
		writer.writeInteger(measureBreak.isLineBreak ? 1 : 0);
	}
	
	// Compress data.
	var data = writer.data;
	data = pako.deflateRaw(data, { to: "string" });
	data = window.btoa(data);
	data = urlSafeEncodeBase64(data);
	return data;
}


// Loads the song data contained in the given string.
// Will throw an exception on error.
Song.prototype.loadBinary = function(base64str)
{
	this.clear();
	
	// Uncompress data.
	var data = urlSafeDecodeBase64(base64str);
	data = window.atob(data);
	data = pako.inflateRaw(data);
	
	var reader = new BinaryReader(data);
	
	// Read header.
	var version = reader.readInteger();
	
	if (version > this.CURRENT_BINARY_VERSION)
		throw "unsupported version";
	
	if (version >= 1)
	{
		this.title = reader.readString();
		this.album = reader.readString();
		this.authors = reader.readString();
	}
	
	reader.readRational(); // Length.
	this.bpm = reader.readInteger();
	
	// Read note tracks.
	var trackNum = reader.readInteger();
	for (var j = 0; j < trackNum; j++)
	{
		// Read note data as structure-of-arrays.
		var noteNum = reader.readInteger();
		
		var noteData = [];
		
		for (var i = 0; i < noteNum; i++)
			noteData[i] = [ reader.readInteger(), 0, 1, 0, 0, 1 ];
			
		for (var i = 0; i < noteNum; i++)
			noteData[i][1] = reader.readInteger();
		
		for (var i = 0; i < noteNum; i++)
		{
			if (noteData[i][1] != 0)
				noteData[i][2] = reader.readInteger();
		}
		
		for (var i = 0; i < noteNum; i++)
			noteData[i][3] = reader.readInteger();
			
		for (var i = 0; i < noteNum; i++)
			noteData[i][4] = reader.readInteger();
		
		for (var i = 0; i < noteNum; i++)
		{
			if (noteData[i][4] != 0)
				noteData[i][5] = reader.readInteger();
		}
		
		for (var i = 0; i < noteNum; i++)
		{
			var startTick = new Rational(noteData[i][0], noteData[i][1], noteData[i][2]);
			var duration = new Rational(noteData[i][3], noteData[i][4], noteData[i][5]);
			
			this.notes.insert(new SongNote(
				startTick,
				duration.add(startTick),
				j,
				reader.readInteger() + 60));
		}
	}
	
	// Read chord data as structure-of-arrays.
	var chordNum = reader.readInteger();
	
	var chordData = [];
	
	for (var i = 0; i < chordNum; i++)
		chordData[i] = [ reader.readInteger(), 0, 1, 0, 0, 1, 0, 0 ];
		
	for (var i = 0; i < chordNum; i++)
		chordData[i][1] = reader.readInteger();
	
	for (var i = 0; i < chordNum; i++)
	{
		if (chordData[i][1] != 0)
			chordData[i][2] = reader.readInteger();
	}
	
	for (var i = 0; i < chordNum; i++)
		chordData[i][3] = reader.readInteger();
	
	for (var i = 0; i < chordNum; i++)
		chordData[i][4] = reader.readInteger();
	
	for (var i = 0; i < chordNum; i++)
	{
		if (chordData[i][4] != 0)
			chordData[i][5] = reader.readInteger();
	}
	
	for (var i = 0; i < chordNum; i++)
		chordData[i][6] = reader.readInteger();
	
	for (var i = 0; i < chordNum; i++)
		chordData[i][7] = reader.readInteger();
	
	for (var i = 0; i < chordNum; i++)
	{
		var startTick = new Rational(chordData[i][0], chordData[i][1], chordData[i][2]);
		var duration = new Rational(chordData[i][3], chordData[i][4], chordData[i][5]);
		
		reader.readInteger(); // Embelishment count.
		
		this.chords.insert(new SongChord(
			startTick,
			duration.add(startTick),
			chordData[i][6],
			mod(chordData[i][7], 12),
			Math.floor(chordData[i][7] / 12),
			[]));
	}
	
	// Read key change data.
	var keyChNum = reader.readInteger();
	for (var i = 0; i < keyChNum; i++)
	{
		var tick = reader.readRational();
		var scaleIndex = reader.readInteger();
		var tonicMidiPitchAndAccidentalOffset = reader.readInteger();
		
		this.keyChanges.insert(new SongKeyChange(
			tick,
			scaleIndex,
			mod(tonicMidiPitchAndAccidentalOffset, 12),
			Math.floor(tonicMidiPitchAndAccidentalOffset / 12)));
	}
	
	// Read meter change data.
	var meterChNum = reader.readInteger();
	for (var i = 0; i < meterChNum; i++)
	{
		this.meterChanges.insert(new SongMeterChange(
			reader.readRational(),
			reader.readInteger(),
			reader.readInteger()));
	}
	
	// Read meter change data.
	if (version >= 2)
	{
		var measureBreakNum = reader.readInteger();
		for (var i = 0; i < measureBreakNum; i++)
		{
			this.forcedMeasures.insert(new SongMeasureBreak(
				reader.readRational(),
				reader.readInteger() == 1 ? true : false));
		}
	}
	
	this.setLengthAuto();
	this.sanitize();
}