function SongData()
{
	this.clear();
}


function SongDataNote(tick, duration, pitch)
{
	this.tick = tick;
	this.duration = duration;
	this.pitch = pitch;
}


function SongDataChord(tick, duration, chord, rootPitch)
{
	this.tick = tick;
	this.duration = duration;
	this.chord = chord;
	this.rootPitch = rootPitch;
}


function SongDataKeyChange(tick, scale, tonicPitch)
{
	this.tick = tick;
	this.scale = scale;
	this.tonicPitch = tonicPitch;
}


function SongDataMeterChange(tick, numerator, denominator)
{
	this.tick = tick;
	this.numerator = numerator;
	this.denominator = denominator;
}


function arrayAddSortedByTick(arr, obj)
{
	// TODO: Use binary search to avoid iterating through the entire array.
	for (var i = 0; i < arr.length; i++)
	{
		var otherObj = arr[i];
		
		if (otherObj.tick > obj.tick)
		{
			arr.splice(i, 0, obj);
			return;
		}
	}
	
	arr.push(obj);
}


// Clears song data.
SongData.prototype.clear = function()
{
	this.beatsPerMinute = 120;
	this.ticksPerBeat = 960;
	this.lastTick = 9600;
	this.notes = [];
	this.chords = [];
	this.keyChanges = [];
	this.meterChanges = [];
	
	this.addKeyChange(new SongDataKeyChange(0, theory.scales[0], theory.C));
	this.addMeterChange(new SongDataMeterChange(0, 4, 4));
}


// Returns whether the given tick value is valid.
SongData.prototype.isValidTick = function(tick)
{
	// Arbitrary upper limit.
	return (tick >= 0 && tick < 1000000 && (tick % 1) == 0);
}


// Returns whether the given duration value is valid.
SongData.prototype.isValidDuration = function(duration)
{
	// Arbitrary upper limit.
	return (duration > 0 && duration < 10000 && (duration % 1) == 0);
}


// Returns whether the given pitch value is valid.
SongData.prototype.isValidPitch = function(pitch)
{
	return (pitch >= theory.getMinPitch() && pitch <= theory.getMaxPitch() && (pitch % 1) == 0)
}


// Adds the given note to the data, and returns whether it was successful.
SongData.prototype.addNote = function(note)
{
	if (!this.isValidTick(note.tick) || !this.isValidDuration(note.duration) || !this.isValidPitch(note.pitch))
		return false;
	
	// Clip notes which were at the same range.
	this.removeNotesByTickRange(note.tick, note.tick + note.duration, note.pitch);
	arrayAddSortedByTick(this.notes, note);
	return true;
}


// Adds the given chord to the data, and returns whether it was successful.
SongData.prototype.addChord = function(chord)
{
	if (!this.isValidTick(chord.tick) || !this.isValidDuration(chord.duration))
		return false;
	
	// Clip chords which were at the same range.
	this.removeChordsByTickRange(chord.tick, chord.tick + chord.duration);	
	arrayAddSortedByTick(this.chords, chord);
	return true;
}


// Adds the given key change to the data, and returns whether it was successful.
SongData.prototype.addKeyChange = function(keyChange)
{
	if (!this.isValidTick(keyChange.tick))
		return false;
	
	// Remove key changes which were at the same tick.
	for (var i = this.keyChanges.length - 1; i >= 0; i--)
	{
		if (this.keyChanges[i].tick == keyChange.tick)
		{
			this.keyChanges.splice(i, 1);
		}
	}
	
	arrayAddSortedByTick(this.keyChanges, keyChange);
	return true;
}


// Adds the given meter change to the data, and returns whether it was successful.
SongData.prototype.addMeterChange = function(meterChange)
{
	if (!this.isValidTick(meterChange.tick))
		return false;
	
	// Remove meter changes which were at the same tick.
	for (var i = this.meterChanges.length - 1; i >= 0; i--)
	{
		if (this.meterChanges[i].tick == meterChange.tick)
		{
			this.meterChanges.splice(i, 1);
		}
	}
	
	arrayAddSortedByTick(this.meterChanges, meterChange);
	return true;
}


// Remove or truncate notes that fall between tickBegin and tickEnd, optionally only if
// their pitches match the given pitch. Pass null for pitch to not consider pitches.
SongData.prototype.removeNotesByTickRange = function(tickBegin, tickEnd, pitch)
{
	for (var i = this.notes.length - 1; i >= 0; i--)
	{
		var otherNote = this.notes[i];
		
		if (pitch != null && otherNote.pitch != pitch)
			continue;
		
		if (otherNote.tick >= tickBegin && otherNote.tick + otherNote.duration <= tickEnd)
		{
			this.notes.splice(i, 1);
		}
		else if (otherNote.tick >= tickBegin && otherNote.tick < tickEnd && otherNote.tick + otherNote.duration > tickEnd)
		{
			var otherNoteEndTick = otherNote.tick + otherNote.duration;
			otherNote.tick = tickEnd;
			otherNote.duration = otherNoteEndTick - otherNote.tick;
		}
		else if (otherNote.tick < tickBegin && otherNote.tick + otherNote.duration >= tickBegin)
		{
			otherNote.duration = tickBegin - otherNote.tick;
		}
	}
}


// Remove or truncate chords that fall between tickBegin and tickEnd.
SongData.prototype.removeChordsByTickRange = function(tickBegin, tickEnd)
{
	for (var i = this.chords.length - 1; i >= 0; i--)
	{
		var otherChord = this.chords[i];
		
		if (otherChord.tick >= tickBegin && otherChord.tick + otherChord.duration <= tickEnd)
		{
			this.chords.splice(i, 1);
		}
		else if (otherChord.tick >= tickBegin && otherChord.tick < tickEnd && otherChord.tick + otherChord.duration > tickEnd)
		{
			var otherNoteEndTick = otherChord.tick + otherChord.duration;
			otherChord.tick = tickEnd;
			otherChord.duration = otherNoteEndTick - otherChord.tick;
		}
		else if (otherChord.tick < tickBegin && otherChord.tick + otherChord.duration >= tickBegin)
		{
			otherChord.duration = tickBegin - otherChord.tick;
		}
	}
}


// Returns a JSON string containing the song data.
SongData.prototype.save = function()
{
	var noteIndex = 0;
	var chordIndex = 0;
	var keyChangeIndex = 0;
	var meterChangeIndex = 0;
	
	var json = "{\n";
	
	json += "  \"bpm\": " + this.beatsPerMinute + ",\n";
	json += "  \"notes\": [\n";
	
	for (var i = 0; i < this.notes.length; i++)
	{
		json += "    ";
		json += "[ " + this.notes[i].tick + ", ";
		json += this.notes[i].duration + ", ";
		json += this.notes[i].pitch + " ]";
		
		if (i < this.notes.length - 1)
			json += ",";
		
		json += "\n";
	}
	
	json += "  ],\n  \"chords\": [\n";
	
	for (var i = 0; i < this.chords.length; i++)
	{
		json += "    ";
		json += "[ " + this.chords[i].tick + ", ";
		json += this.chords[i].duration + ", ";
		json += this.chords[i].rootPitch + ", ";
		json += "{ \"chordId\": " + theory.getIdForChord(this.chords[i].chord) + " } ]";
		
		if (i < this.chords.length - 1)
			json += ",";
		
		json += "\n";
	}
	
	json += "  ],\n  \"keyChanges\": [\n";
	
	for (var i = 0; i < this.keyChanges.length; i++)
	{
		json += "    ";
		json += "[ " + this.keyChanges[i].tick + ", ";
		json += this.keyChanges[i].tonicPitch + ", ";
		json += theory.getIdForScale(this.keyChanges[i].scale) + " ]";
		
		if (i < this.keyChanges.length - 1)
			json += ",";
		
		json += "\n";
	}
	
	json += "  ],\n  \"meterChanges\": [\n";
	
	for (var i = 0; i < this.meterChanges.length; i++)
	{
		json += "    ";
		json += "[ " + this.meterChanges[i].tick + ", ";
		json += this.meterChanges[i].numerator + ", ";
		json += this.meterChanges[i].denominator + " ]";
		
		if (i < this.meterChanges.length - 1)
			json += ",";
		
		json += "\n";
	}
	
	json += "  ]\n}";
	
	return json;
}


// Loads the song data contained in the given string.
// Will throw an exception on error.
SongData.prototype.load = function(jsonStr)
{
	this.clear();
	
	var song = JSON.parse(jsonStr);
	this.beatsPerMinute = song.bpm;
	
	for (var i = 0; i < song.notes.length; i++)
	{
		this.addNote(new SongDataNote(song.notes[i][0], song.notes[i][1], song.notes[i][2]));
	}
	
	for (var i = 0; i < song.chords.length; i++)
	{
		this.addChord(new SongDataChord(song.chords[i][0], song.chords[i][1], theory.getChordForId(song.chords[i][3].chordId), song.chords[i][2]));
	}
	
	for (var i = 0; i < song.keyChanges.length; i++)
	{
		this.addKeyChange(new SongDataKeyChange(song.keyChanges[i][0], theory.getScaleForId(song.keyChanges[i][2]), song.keyChanges[i][1]));
	}
	
	for (var i = 0; i < song.meterChanges.length; i++)
	{
		this.addMeterChange(new SongDataMeterChange(song.meterChanges[i][0], song.meterChanges[i][1], song.meterChanges[i][2]));
	}
}