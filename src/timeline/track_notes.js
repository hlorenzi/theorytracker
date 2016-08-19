function TrackNotes(timeline)
{
	this.timeline = timeline;
	
	var that = this;
	this.timeline.eventNoteAdded   .add(function (id) { that.onNoteAdded   (id); });
	this.timeline.eventNoteModified.add(function (id) { that.onNoteModified(id); });
	this.timeline.eventNoteRemoved .add(function (id) { that.onNoteRemoved (id); });
	
	this.y      = 0;
	this.height = 0;
	
	this.scrollMidiPitch = 0;
	
	this.elements = new MapByTimeRange();
}


TrackNotes.prototype.onNoteAdded = function(id)
{
	var that = this;
	
	var elem = {
		id:        id,
		selected:  false,
		timeRange: null,
		
		modify: function(elem) { that.elementModify(elem); },
		
		regions:           [],
		interactKind:      this.timeline.INTERACT_MOVE_TIME | this.timeline.INTERACT_MOVE_PITCH,
		interactTimeRange: null,
		interactPitch:     null
	};
	
	this.elementRefresh(elem);
	this.elements.add(id, elem);
}


TrackNotes.prototype.onNoteModified = function(id)
{
	var elem = this.elements.get(id);
	this.elementRefresh(elem);
}


TrackNotes.prototype.onNoteRemoved = function(id)
{
	this.elements.remove(id);
}


TrackNotes.prototype.elementModify = function(elem)
{
	var note = this.timeline.song.noteGet(elem.id);
	
	var start    = note.timeRange.start;
	var duration = note.timeRange.duration();
	var pitch    = note.pitch.midiPitch;
	
	if ((this.timeline.mouseAction & this.timeline.INTERACT_MOVE_TIME) != 0)
		start += this.timeline.mouseMoveDeltaTime;

	if ((this.timeline.mouseAction & this.timeline.INTERACT_MOVE_PITCH) != 0)
		pitch += this.timeline.mouseMoveDeltaPitch;
	
	this.timeline.song.noteModify(elem.id,
		new Note(new TimeRange(start, start + duration), new Pitch(pitch)));
}


TrackNotes.prototype.elementRefresh = function(elem)
{
	var toPixels   = this.timeline.timeToPixelsScaling;
	var noteHeight = this.timeline.noteHeight;
	var minPitch   = this.timeline.song.MIN_VALID_MIDI_PITCH;
	
	var note = this.timeline.song.noteGet(elem.id);
	
	elem.timeRange         = note.timeRange.clone();
	elem.interactTimeRange = note.timeRange.clone();
	elem.interactPitch     = note.pitch.clone();
	
	elem.regions = [
		{
			kind:   this.timeline.INTERACT_MOVE_TIME | this.timeline.INTERACT_MOVE_PITCH,
			x:      note.timeRange.start * toPixels,
			y:      this.height - noteHeight * (note.pitch.midiPitch - minPitch) - noteHeight,
			width:  note.timeRange.duration() * toPixels,
			height: noteHeight - 1
		}
	];
}


TrackNotes.prototype.relayout = function()
{
	var that = this;
	
	this.elements.enumerateAll(function (index, elem)
	{
		that.elementRefresh(elem);
	});
}


TrackNotes.prototype.redraw = function(time1, time2)
{
	var that       = this;
	var ctx        = this.timeline.ctx;
	var toPixels   = this.timeline.timeToPixelsScaling;
	var noteHeight = this.timeline.noteHeight;
	var minPitch   = this.timeline.song.MIN_VALID_MIDI_PITCH;
	var maxPitch   = this.timeline.song.MAX_VALID_MIDI_PITCH;
	
	var xMin = time1 * toPixels;
	var xMax = Math.min(time2, this.timeline.song.length) * toPixels;
	
	ctx.save();
	
	ctx.beginPath();
	ctx.rect(xMin, 0, xMax - xMin + 1, this.height + 1);
	ctx.clip();
	
	ctx.translate(0.5, 0.5);
	
	// Draw pitch rows.
	ctx.fillStyle = "#e4e4e4";
	for (var i = minPitch; i <= maxPitch; i++)
	{
		ctx.fillRect(
			xMin,
			this.height - noteHeight * (i - minPitch),
			xMax - xMin,
			noteHeight - 0.5);
	}
	
	// Draw notes.
	this.elements.enumerateOverlappingRangeOrSelected(new TimeRange(time1, time2), function (index, elem)
	{
		that.drawNote(elem);
	});
	
	// Draw borders.
	ctx.strokeStyle = "#000000";
	ctx.strokeRect(0, 0, this.timeline.song.length * toPixels, this.height);
	
	ctx.restore();
}


TrackNotes.prototype.drawNote = function(elem)
{
	var ctx        = this.timeline.ctx;
	var toPixels   = this.timeline.timeToPixelsScaling;
	var noteHeight = this.timeline.noteHeight;
	var minPitch   = this.timeline.song.MIN_VALID_MIDI_PITCH;
	var note       = this.timeline.song.noteGet(elem.id);
	
	var start    = note.timeRange.start;
	var duration = note.timeRange.duration();
	var pitch    = note.pitch.midiPitch;
	
	if (elem.selected)
	{
		if ((this.timeline.mouseAction & this.timeline.INTERACT_MOVE_TIME) != 0)
			start += this.timeline.mouseMoveDeltaTime;
	
		if ((this.timeline.mouseAction & this.timeline.INTERACT_MOVE_PITCH) != 0)
			pitch += this.timeline.mouseMoveDeltaPitch;
	}
	
	ctx.globalAlpha = 1;
	if (elem == this.timeline.hoverElement || (elem.selected && this.timeline.mouseDown))
		ctx.fillStyle = "#ff8888";
	else
		ctx.fillStyle = "#ff0000";
	
	var x = 0.5 + Math.floor(start * toPixels);
	var y = 0.5 + this.height - noteHeight * (pitch - minPitch);
	var w = Math.floor(duration * toPixels);
	
	ctx.fillRect(x, y - noteHeight, w, noteHeight - 1);
		
	if (elem.selected)
	{
		ctx.fillStyle = "#ffffff"
		ctx.globalAlpha = 0.5;
		
		ctx.fillRect(x, y - noteHeight + 1, w, noteHeight - 1 - 2);
	}
}