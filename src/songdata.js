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


// Adds the given note to the data, and returns whether it was successful.
SongData.prototype.addNote = function(note)
{
	if (!this.isValidTick(note.tick) || !this.isValidDuration(note.duration))
		return false;
	
	// Clip notes which collide with the new one.
	// TODO: Split a note into two in case the new one is contained within it.
	for (var i = this.notes.length - 1; i >= 0; i--)
	{
		var otherNote = this.notes[i];
		
		if (otherNote.pitch != note.pitch)
			continue;
		
		if (otherNote.tick >= note.tick && otherNote.tick + otherNote.duration <= note.tick + note.duration)
		{
			this.notes.splice(i, 1);
		}
		else if (otherNote.tick >= note.tick && otherNote.tick < note.tick + note.duration && otherNote.tick + otherNote.duration > note.tick + note.duration)
		{
			var tickEnd = otherNote.tick + otherNote.duration;
			otherNote.tick = note.tick + note.duration;
			otherNote.duration = tickEnd - otherNote.tick;
		}
		else if (otherNote.tick < note.tick && otherNote.tick + otherNote.duration >= note.tick)
		{
			otherNote.duration = note.tick - otherNote.tick;
		}
	}
	
	arrayAddSortedByTick(this.notes, note);
	return true;
}


// Adds the given chord to the data, and returns whether it was successful.
SongData.prototype.addChord = function(chord)
{
	if (!this.isValidTick(chord.tick) || !this.isValidDuration(chord.duration))
		return false;
	
	// Clip chords which collide with the new one.
	// TODO: Split a chord into two in case the new one is contained within it.
	for (var i = this.chords.length - 1; i >= 0; i--)
	{
		var otherChord = this.chords[i];
		
		if (otherChord.tick >= chord.tick && otherChord.tick + otherChord.duration <= chord.tick + chord.duration)
		{
			this.chords.splice(i, 1);
		}
		else if (otherChord.tick >= chord.tick && otherChord.tick < chord.tick + chord.duration && otherChord.tick + otherChord.duration > chord.tick + chord.duration)
		{
			var tickEnd = otherChord.tick + otherChord.duration;
			otherChord.tick = chord.tick + chord.duration;
			otherChord.duration = tickEnd - otherChord.tick;
		}
		else if (otherChord.tick < chord.tick && otherChord.tick + otherChord.duration >= chord.tick)
		{
			otherChord.duration = chord.tick - otherChord.tick;
		}
	}
	
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