function TrackNotes(timeline)
{
	this.timeline = timeline;
	
	this.y       = 0;
	this.height  = 0;
	this.scrollY = 0;
	
	this.elements = new ListByTimeRange();
	
	this.selectedElements = [];
	this.modifiedElements = [];
}


TrackNotes.prototype = new Track();


TrackNotes.prototype.setSong = function(song)
{
	this.elements.clear();
	this.selectedElements = [];
	
	for (var i = 0; i < song.notes.length; i++)
	{
		this._clipNotes(song.notes[i].timeRange, song.notes[i].pitch);
		this._noteAdd(song.notes[i]);
	}
}


TrackNotes.prototype._noteAdd = function(note)
{
	var elem = new Element();
	elem.track = this;
	elem.note  = note.clone();
	
	this.elementRefresh(elem);
	this.elements.add(elem);
	this.timeline.markDirtyElement(elem);
}


TrackNotes.prototype._clipNotes = function(timeRange, pitch)
{
	// Check for overlapping notes and clip them.
	var overlapping = [];
	
	this.elements.enumerateOverlappingRange(timeRange, function (elem)
	{
		if (elem.note.pitch.midiPitch == pitch.midiPitch)
			overlapping.push(elem);
	});
	
	for (var i = 0; i < overlapping.length; i++)
		this.elements.remove(overlapping[i]);
	
	for (var i = 0; i < overlapping.length; i++)
	{
		var elem = overlapping[i];
		
		var parts = elem.note.timeRange.getClippedParts(timeRange);
		for (var p = 0; p < parts.length; p++)
		{
			var clippedNote = elem.note.clone();
			clippedNote.timeRange = parts[p];
			this._noteAdd(clippedNote);
		}
	}
}


TrackNotes.prototype.handleScroll = function()
{
	this.scrollY = this.getModifiedScrollY();
	this.timeline.markDirtyAll();
}


TrackNotes.prototype.applyModifications = function()
{
	for (var i = 0; i < this.modifiedElements.length; i++)
	{
		var elem = this.modifiedElements[i];
		this._clipNotes(elem.note.timeRange, elem.note.pitch);
	}
		
	for (var i = 0; i < this.modifiedElements.length; i++)
	{
		var elem = this.modifiedElements[i];
		
		this.elementRefresh(elem);
		this.elements.add(elem);
		this.timeline.markDirtyElement(elem);
	}
	
	this.modifiedElements = [];
}


TrackNotes.prototype.elementModify = function(elem)
{
	this.elements.remove(elem);
	
	var modifiedElem = this.getModifiedElement(elem);
	
	elem.note = new Note(
		new TimeRange(modifiedElem.start, modifiedElem.start + modifiedElem.duration),
		new Pitch(modifiedElem.pitch));
	
	this.modifiedElements.push(elem);
}


TrackNotes.prototype.elementRefresh = function(elem)
{
	var toPixels   = this.timeline.timeToPixelsScaling;
	var noteHeight = this.timeline.noteHeight;
	var minPitch   = this.timeline.MIN_VALID_MIDI_PITCH;
	
	elem.timeRange         = elem.note.timeRange.clone();
	elem.interactKind      = this.timeline.INTERACT_MOVE_TIME | this.timeline.INTERACT_MOVE_PITCH;
	elem.interactTimeRange = elem.note.timeRange.clone();
	elem.interactPitch     = elem.note.pitch.clone();
	
	elem.regions = [
		{
			kind:   this.timeline.INTERACT_MOVE_TIME | this.timeline.INTERACT_MOVE_PITCH,
			x:      elem.note.timeRange.start * toPixels,
			y:      this.height - noteHeight * (elem.note.pitch.midiPitch - minPitch) - noteHeight,
			width:  elem.note.timeRange.duration() * toPixels,
			height: noteHeight - 1
		}
	];
}


TrackNotes.prototype.relayout = function()
{
	var that = this;
	
	this.elements.enumerateAll(function (elem)
		{ that.elementRefresh(elem); });
}


TrackNotes.prototype.redraw = function(time1, time2)
{
	var that        = this;
	var ctx         = this.timeline.ctx;
	var toPixels    = this.timeline.timeToPixelsScaling;
	var noteHeight  = this.timeline.noteHeight;
	var minPitch    = this.timeline.MIN_VALID_MIDI_PITCH;
	var maxPitch    = this.timeline.MAX_VALID_MIDI_PITCH;
	var scrollY     = this.getModifiedScrollY();
	
	var xMin = Math.floor(time1 * toPixels);
	var xLen = Math.floor(this.timeline.length * toPixels);
	var xMax = Math.floor(time2 * toPixels);
	
	ctx.save();
	
	ctx.beginPath();
	ctx.rect(xMin - 10, 0, xMax - xMin + 20, this.height + 1);
	ctx.clip();
	
	ctx.translate(0.5, 0.5);
	
	ctx.save();
	ctx.translate(0, scrollY);
	
	// Draw pitch rows.
	for (var i = minPitch; i <= maxPitch; i++)
	{
		ctx.fillStyle = "#cccccc";
		ctx.fillRect(
			xLen,
			this.height - noteHeight * (i - minPitch),
			xMax - xLen,
			noteHeight - 0.5);
			
		ctx.fillStyle = "#e4e4e4";
		ctx.fillRect(
			xMin,
			this.height - noteHeight * (i - minPitch),
			xLen - xMin,
			noteHeight - 0.5);
	}
	
	// Draw notes.
	this.elements.enumerateOverlappingRange(new TimeRange(time1, time2), function (elem)
		{ that.drawNote(elem); });
	
	for (var i = 0; i < this.selectedElements.length; i++)
		this.drawNote(this.selectedElements[i]);
	
	ctx.restore();
	
	// Draw borders.
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
		ctx.moveTo(xMin, 0);
		ctx.lineTo(xMax, 0);
		
		ctx.moveTo(xMin, this.height);
		ctx.lineTo(xMax, this.height);
		
		ctx.moveTo(0, 0);
		ctx.lineTo(0, this.height);
		
		ctx.moveTo(xLen, 0);
		ctx.lineTo(xLen, this.height);
	ctx.stroke();
	
	ctx.restore();
}


TrackNotes.prototype.getModifiedElement = function(elem)
{
	var start    = elem.note.timeRange.start;
	var duration = elem.note.timeRange.duration();
	var pitch    = elem.note.pitch.midiPitch;
	
	if (elem.selected)
	{
		if ((this.timeline.mouseAction & this.timeline.INTERACT_MOVE_TIME) != 0)
			start += this.timeline.mouseMoveDeltaTime;
	
		if ((this.timeline.mouseAction & this.timeline.INTERACT_MOVE_PITCH) != 0)
			pitch += this.timeline.mouseMoveDeltaPitch;
	}
	
	return {
		start:    start,
		duration: duration,
		pitch:    pitch
	};
}


TrackNotes.prototype.getModifiedScrollY = function()
{
	var noteHeight  = this.timeline.noteHeight;
	var minPitch    = this.timeline.MIN_VALID_MIDI_PITCH;
	var maxPitch    = this.timeline.MAX_VALID_MIDI_PITCH;
	
	var scrollY = this.scrollY;
	
	if (this.timeline.mouseDownTrack == this &&
		this.timeline.mouseAction == this.timeline.INTERACT_NONE)
	{
		scrollY += this.timeline.mouseMoveScrollY;
		scrollY =
			Math.max(0,
			Math.min((maxPitch - minPitch) * noteHeight - this.height,
			scrollY));
	}
	
	return scrollY;
}


TrackNotes.prototype.drawNote = function(elem)
{
	var ctx          = this.timeline.ctx;
	var toPixels     = this.timeline.timeToPixelsScaling;
	var noteHeight   = this.timeline.noteHeight;
	var minPitch     = this.timeline.MIN_VALID_MIDI_PITCH;
	var scrollY      = this.getModifiedScrollY();
	var modifiedElem = this.getModifiedElement(elem);
	
	ctx.globalAlpha = 1;
	if (elem == this.timeline.hoverElement || (elem.selected && this.timeline.mouseDown))
		ctx.fillStyle = "#ff8888";
	else
		ctx.fillStyle = "#ff0000";
	
	var x = 0.5 + Math.floor(modifiedElem.start * toPixels);
	var y = 0.5 + this.height - noteHeight * (modifiedElem.pitch - minPitch);
	var w = Math.floor(modifiedElem.duration * toPixels - 1);
	
	y =
		Math.max(-scrollY + 3,
		Math.min(this.height - scrollY + noteHeight - 2,
		y));
	
	ctx.fillRect(x, y - noteHeight, w, noteHeight - 1);
		
	if (elem.selected)
	{
		ctx.fillStyle = "#ffffff"
		ctx.globalAlpha = 0.5;
		
		ctx.fillRect(x, y - noteHeight + 2, w, noteHeight - 1 - 4);
	}
}