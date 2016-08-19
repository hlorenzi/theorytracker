function Song()
{
	this.timePerWholeNote = 960;
	this.length           = 960 * 4;
	
	this.MIN_VALID_MIDI_PITCH = 3 * 12;
	this.MAX_VALID_MIDI_PITCH = 8 * 12;
	
	this.notesById     = [];
	this.notesModified = [];
	this.metersById    = [];
	
	this.eventNoteAdded    = new Callback();
	this.eventNoteModified = new Callback();
	this.eventNoteRemoved  = new Callback();
	
	this.eventMeterAdded    = new Callback();
	this.eventMeterModified = new Callback();
	this.eventMeterRemoved  = new Callback();
	
	this.sanitize();
}


Song.prototype.sanitize = function()
{
	this.meterAdd(new Meter(0, 4, 4));
}


Song.prototype.raiseAllAdded = function()
{
	for (var i = 0; i < this.notesById.length; i++)
	{
		if (this.notesById[i] != null)
			this.eventNoteAdded.call(function (fn) { fn(i); });
	}
	
	for (var i = 0; i < this.metersById.length; i++)
	{
		if (this.metersById[i] != null)
			this.eventMeterAdded.call(function (fn) { fn(i); });
	}
}


Song.prototype.raiseAllRemoved = function()
{
	for (var i = 0; i < this.notesById.length; i++)
	{
		if (this.notesById[i] != null)
			this.eventNoteRemoved.call(function (fn) { fn(i); });
	}
	
	for (var i = 0; i < this.metersById.length; i++)
	{
		if (this.metersById[i] != null)
			this.eventMeterRemoved.call(function (fn) { fn(i); });
	}
}


Song.prototype.applyModifications = function()
{
	var that = this;
	
	for (var i = 0; i < this.notesModified.length; i++)
		this.eventNoteModified.call(function (fn) { fn(that.notesModified[i]); });
	
	this.notesModified = [];
}


Song.prototype.noteAdd = function(note)
{
	var id = this.notesById.length;
	this.notesById[id] = note;
	
	this.eventNoteAdded.call(function (fn) { fn(id); });
	return id;
}


Song.prototype.noteRemove = function(id)
{
	this.eventNoteRemoved.call(function (fn) { fn(id); });
	this.notesById[id] = null;
}


Song.prototype.noteModify = function(id, note)
{
	this.notesById[id] = note;
	this.notesModified.push(id);
}


Song.prototype.noteGet = function(id)
{
	return this.notesById[id];
}


Song.prototype.meterAdd = function(meter)
{
	var id = this.metersById.length;
	this.metersById[id] = meter;
	
	this.eventMeterAdded.call(function (fn) { fn(id); });
	return id;
}


Song.prototype.meterRemove = function(id)
{
	this.eventMeterRemoved.call(function (fn) { fn(id); });
	this.metersById[id] = null;
}


Song.prototype.meterGet = function(id)
{
	return this.metersById[id];
}