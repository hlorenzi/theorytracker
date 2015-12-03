function SongData()
{
	this.beatsPerMinute = 120;
	this.ticksPerBeat = 960;
	this.lastTick = 9600;
	this.notes = [];
	this.chords = [];
	this.keyChanges = [];
	this.meterChanges = [];
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


// Returns whether the given tick value is valid.
SongData.prototype.isValidTick = function(tick)
{
	// Arbitrary upper limit.
	return (tick >= 0 && tick < 1000000);
}


// Returns whether the given duration value is valid.
SongData.prototype.isValidDuration = function(duration)
{
	// Arbitrary upper limit.
	return (duration > 0 && duration < 10000);
}


// Returns whether the given pitch value is valid.
SongData.prototype.isValidPitch = function(pitch)
{
	return (pitch >= theory.getMinPitch() && pitch <= theory.getMaxPitch())
}


// Adds the given note to the data, and returns whether it was successful.
SongData.prototype.addNote = function(note)
{
	if (!this.isValidTick(note.tick) || !this.isValidDuration(note.duration) || !this.isValidPitch(note.pitch))
		return false;
	
	this.removeNotesByTickRange(note.tick, note.tick + note.duration, note.pitch);
	arrayAddSortedByTick(this.notes, note);
	return true;
}


// Adds the given chord to the data, and returns whether it was successful.
SongData.prototype.addChord = function(chord)
{
	if (!this.isValidTick(chord.tick) || !this.isValidDuration(chord.duration))
		return false;
	
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