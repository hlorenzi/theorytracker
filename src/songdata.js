function SongData()
{
	this.beatsPerMinute = 120;
	this.ticksPerBeat = 120;
	this.lastTick = 1000;
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


function SongDataKeyChange(tick, key, tonicPitch)
{
	this.tick = tick;
	this.key = key;
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


// Returns whether it is valid for the given note to be added to the data.
SongData.prototype.canAddNote = function(note)
{
	// Check for invalid values.
	if (!this.isValidTick(note.tick) ||
		!this.isValidDuration(note.duration))
		return false;
	
	// Check whether the given note collides with any notes already in data.
	// TODO: Use binary search to avoid iterating through the entire array.
	for (var i = 0; i < this.notes.length; i++)
	{
		var otherNote = this.notes[i];
		
		if (otherNote.pitch == note.pitch &&
			otherNote.tick < note.tick + note.duration &&
			otherNote.tick + otherNote.duration > note.tick)
			return false;
	}
	
	return true;
}


// Returns whether it is valid for the given key change to be added to the data.
SongData.prototype.canAddKeyChange = function(keyChange)
{
	// Check for invalid values.
	if (!this.isValidTick(keyChange.tick))
		return false;
	
	// Check whether the given key change coincides with another already in data.
	// TODO: Use binary search to avoid iterating through the entire array.
	for (var i = 0; i < this.keyChanges.length; i++)
	{
		var otherKeyChange = this.keyChanges[i];
		
		if (otherKeyChange.tick == keyChange.tick)
			return false;
	}
	
	return true;
}


// Returns whether it is valid for the given meter change to be added to the data.
SongData.prototype.canAddMeterChange = function(meterChange)
{
	// Check for invalid values.
	if (!this.isValidTick(meterChange.tick))
		return false;
	
	// Check whether the given meter change coincides with another already in data.
	// TODO: Use binary search to avoid iterating through the entire array.
	for (var i = 0; i < this.meterChanges.length; i++)
	{
		var otherMeterChange = this.meterChanges[i];
		
		if (otherMeterChange.tick == meterChange.tick)
			return false;
	}
	
	return true;
}


// Adds the given note to the data, and returns whether it was successful.
SongData.prototype.addNote = function(note)
{
	if (this.canAddNote(note))
	{
		arrayAddSortedByTick(this.notes, note);
		return true;
	}
	
	return false;
}


// Adds the given key change to the data, and returns whether it was successful.
SongData.prototype.addKeyChange = function(keyChange)
{
	if (this.canAddKeyChange(keyChange))
	{
		arrayAddSortedByTick(this.keyChanges, keyChange);
		return true;
	}
	
	return false;
}


// Adds the given meter change to the data, and returns whether it was successful.
SongData.prototype.addMeterChange = function(meterChange)
{
	if (this.canAddMeterChange(meterChange))
	{
		arrayAddSortedByTick(this.meterChanges, meterChange);
		return true;
	}
	
	return false;
}