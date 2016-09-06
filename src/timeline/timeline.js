function Timeline(canvas, synth)
{
	var that = this;

	// Set up constants.
	this.MOUSE    = 1;
	this.KEYBOARD = 2;
	
	this.INTERACT_NONE           = 0x00;
	this.INTERACT_SCROLL         = 0x01;
	this.INTERACT_CURSOR         = 0x02;
	this.INTERACT_MOVE_TIME      = 0x04;
	this.INTERACT_MOVE_PITCH     = 0x08;
	this.INTERACT_STRETCH_TIME_L = 0x10;
	this.INTERACT_STRETCH_TIME_R = 0x20;

	this.TIME_PER_WHOLE_NOTE   = 960;
	this.MAX_VALID_LENGTH      = 960 * 1024;
	this.MIN_VALID_MIDI_PITCH  = 3 * 12;
	this.MAX_VALID_MIDI_PITCH  = 8 * 12 - 1;
	this.OFFSET_X              = 30;
	this.REDRAW_TIME_MARGIN    = 50;

	// Get canvas context.
	this.canvas = canvas;
	this.ctx    = canvas.getContext("2d");

	this.canvasWidth  = 0;
	this.canvasHeight = 0;
	
	// Store synth context.
	this.synth = synth;

	// Set up tracks.
	this.length     = 0;
	this.trackLength = new TrackLength(this);
	this.trackKeys   = new TrackKeys(this);
	this.trackMeters = new TrackMeters(this);
	this.trackNotes  = new TrackNotes(this);
	this.trackChords = new TrackChords(this);

	this.tracks = [];
	this.tracks.push(this.trackLength);
	this.tracks.push(this.trackKeys);
	this.tracks.push(this.trackMeters);
	this.tracks.push(this.trackNotes);
	this.tracks.push(this.trackChords);
	
	this.trackNotesIndex  = 3;
	this.trackChordsIndex = 4;
	
	// Set up mouse/keyboard interaction.
	this.canvas.oncontextmenu = function(ev) { that.handleContextMenu(ev); };
	this.canvas.onmousedown   = function(ev) { that.handleMouseDown(ev);   };
	window.onmousemove        = function(ev) { that.handleMouseMove(ev);   };
	window.onmouseup          = function(ev) { that.handleMouseUp(ev);     };
	window.onkeydown          = function(ev) { that.handleKeyDown(ev);     };
	window.onkeyup            = function(ev) { that.handleKeyUp(ev);       };

	this.mouseDownDate           = new Date();
	this.mouseDown               = false;
	this.mouseDownPos            = null;
	this.mouseDownTrack          = null;
	this.mouseDownScrollTime     = 0;
	this.mouseMoveScrollY        = 0;
	
	this.keyboardHoldSpace       = false;
	
	this.action                  = this.INTERACT_NONE;
	this.actionDevice            = 0;
	this.actionMoveDeltaTime     = 0;
	this.actionMovePitch         = 0;
	this.actionStretchTimePivot  = 0;
	this.actionStretchTimeOrigin = 0;
	
	this.createLastPitch    = 12 * 5 + theory.Fs;
	this.createLastDuration = this.TIME_PER_WHOLE_NOTE / 4;
	
	this.cursorVisible = true;
	this.cursorTime1   = 0;
	this.cursorTrack1  = this.trackNotesIndex;
	this.cursorTime2   = 0;
	this.cursorTrack2  = this.trackNotesIndex;

	this.hoverElement     = null;
	this.hoverRegion      = null;
	this.selectedElements = [];

	// Set up display metrics.
	this.scrollTime          = 0;
	this.durationVisible     = 0;
	this.firstTimeVisible    = 0;
	this.lastTimeVisible     = 0;
	this.timeSnap            = 960 / 16;
	this.timeToPixelsScaling = 100 / 960;
	this.noteHeight          = 12;
	this.lastTrackBottomY    = 0;

	this.redrawDirtyTimeMin = -1;
	this.redrawDirtyTimeMax = -1;
}


Timeline.prototype.setSong = function(song)
{
	this.unselectAll();

	this.length = song.length;

	for (var i = 0; i < this.tracks.length; i++)
		this.tracks[i].setSong(song);

	this.markDirtyAll();
}


Timeline.prototype.setScrollTime = function(time)
{
	var newScrollTime =
		Math.max(0,
		Math.min(this.length - this.TIME_PER_WHOLE_NOTE,
		time));
	
	this.scrollTime = newScrollTime;
	
	this.durationVisible  = (this.canvasWidth - this.OFFSET_X) / this.timeToPixelsScaling; 
	this.firstTimeVisible = this.scrollTime - this.OFFSET_X / this.timeToPixelsScaling;
	this.lastTimeVisible  = this.scrollTime + this.canvasWidth / this.timeToPixelsScaling;
	
	this.markDirtyAll();
}


Timeline.prototype.setScrollPitchAtBottom = function(pitch)
{
	this.trackNotes.setScrollPitchAtBottom(pitch);
}


Timeline.prototype.setScrollPitchAtCenter = function(pitch)
{
	this.trackNotes.setScrollPitchAtCenter(pitch);
}


Timeline.prototype.getScrollPitchAtBottom = function()
{
	return this.trackNotes.getScrollPitchAtBottom();
}

	
Timeline.prototype.scrollTimeIntoView = function(time)
{
	if (time < this.firstTimeVisible)
		this.setScrollTime(time - this.TIME_PER_WHOLE_NOTE * 4);
	
	else if (time > this.lastTimeVisible)
		this.setScrollTime(time - this.durationVisible + this.TIME_PER_WHOLE_NOTE * 4);
}


Timeline.prototype.scrollPitchIntoView = function(pitch)
{
	this.trackNotes.scrollPitchIntoView(pitch);
}


Timeline.prototype.hideCursor = function()
{
	if (!this.cursorVisible)
		return;
	
	this.markDirtyPixels(this.cursorTime1, 5);
	this.markDirtyPixels(this.cursorTime2, 5);
	this.markDirty(this.cursorTime1, this.cursorTime2);
	
	this.cursorVisible = false;
}


Timeline.prototype.showCursor = function()
{
	if (this.cursorVisible)
		return;
	
	this.markDirtyPixels(this.cursorTime1, 5);
	this.markDirtyPixels(this.cursorTime2, 5);
	this.markDirty(this.cursorTime1, this.cursorTime2);
	
	this.cursorVisible = true;
}


Timeline.prototype.setCursor = function(time, trackIndex)
{
	this.markDirtyPixels(this.cursorTime1, 5);
	this.markDirtyPixels(this.cursorTime2, 5);
	this.markDirty(this.cursorTime1, this.cursorTime2);
	
	time =
		Math.max(0,
		Math.min(this.length,
		time));
		
	trackIndex =
		Math.max(0,
		Math.min(this.tracks.length - 1,
		trackIndex));
	
	this.cursorTime1  = time;
	this.cursorTime2  = time;
	this.cursorTrack1 = trackIndex;
	this.cursorTrack2 = trackIndex;
	
	if (trackIndex == 0)
		this.cursorTrack2 = this.tracks.length - 1;
	
	this.markDirtyPixels(this.cursorTime1, 5);
}


Timeline.prototype.setCursorBoth = function(time1, time2, track1, track2)
{
	this.markDirtyPixels(this.cursorTime1, 5);
	this.markDirtyPixels(this.cursorTime2, 5);
	this.markDirty(this.cursorTime1, this.cursorTime2);
	
	time1 =
		Math.max(0,
		Math.min(this.length,
		time1));
	
	time2 =
		Math.max(0,
		Math.min(this.length,
		time2));
	
	track1 =
		Math.max(0,
		Math.min(this.tracks.length - 1,
		track1));
		
	track2 =
		Math.max(0,
		Math.min(this.tracks.length - 1,
		track2));
		
	this.cursorTime1  = time1;
	this.cursorTime2  = time2;
	this.cursorTrack1 = track1;
	this.cursorTrack2 = track2;
	
	this.markDirtyPixels(this.cursorTime1, 5);
	this.markDirtyPixels(this.cursorTime2, 5);
	this.markDirty(this.cursorTime1, this.cursorTime2);
}


Timeline.prototype.setCursor2 = function(time, trackIndex)
{
	this.markDirtyPixels(this.cursorTime2, 5);
	this.markDirtyPixels(time, 5);
	this.markDirty(this.cursorTime2, time);
	
	time =
		Math.max(0,
		Math.min(this.length,
		time));
		
	trackIndex =
		Math.max(0,
		Math.min(this.tracks.length - 1,
		trackIndex));
		
	var lastTrack2 = this.cursorTrack2;
	
	this.cursorTime2 = time;
	
	if (this.cursorTrack1 != 0)
		this.cursorTrack2 = trackIndex;
	
	if (this.cursorTrack2 != lastTrack2)
	{
		this.markDirtyPixels(this.cursorTime1, 5);
		this.markDirtyPixels(this.cursorTime2, 5);
		this.markDirty(this.cursorTime1, this.cursorTime2);
	}
	
	if (this.cursorTime2 != this.cursorTime1)
	{
		this.unselectAll();
		
		var that      = this;
		var time1     = Math.min(this.cursorTime1, this.cursorTime2);
		var time2     = Math.max(this.cursorTime1, this.cursorTime2);
		var track1    = Math.min(this.cursorTrack1, this.cursorTrack2);
		var track2    = Math.max(this.cursorTrack1, this.cursorTrack2);
		var timeRange = new TimeRange(time1, time2);
		
		for (var i = track1; i <= track2; i++)
		{
			this.tracks[i].elements.enumerateOverlappingRange(timeRange, function (elem)
				{
					if (elem.interactTimeRange == null)
						return;
					
					if (elem.interactTimeRange.includedInRange(timeRange))
						that.select(elem);
				});
		}
	}
}


Timeline.prototype.markDirtyAll = function()
{
	this.redrawDirtyTimeMin = this.firstTimeVisible - 100;
	this.redrawDirtyTimeMax = this.lastTimeVisible  + 100;
}


Timeline.prototype.markDirty = function(time1, time2)
{
	var start = Math.min(time1, time2);
	var end   = Math.max(time1, time2);
	
	if (this.redrawDirtyTimeMin == -1 ||
		start - this.REDRAW_TIME_MARGIN < this.redrawDirtyTimeMin)
	{
		this.redrawDirtyTimeMin = start - this.REDRAW_TIME_MARGIN;
	}

	if (this.redrawDirtyTimeMax == -1 ||
		end + this.REDRAW_TIME_MARGIN > this.redrawDirtyTimeMax)
	{
		this.redrawDirtyTimeMax = end + this.REDRAW_TIME_MARGIN;
	}
}


Timeline.prototype.markDirtyTimeRange = function(timeRange)
{
	this.markDirty(timeRange.start, timeRange.end);
}


Timeline.prototype.markDirtyPixels = function(time, pixelMargin)
{
	this.markDirty(
		time - pixelMargin / this.timeToPixelsScaling,
		time + pixelMargin / this.timeToPixelsScaling);
}


Timeline.prototype.markDirtyElement = function(elem)
{
	this.markDirty(elem.timeRange.start, elem.timeRange.end);
}


Timeline.prototype.markDirtyAllSelectedElements = function(timeDelta)
{
	for (var i = 0; i < this.selectedElements.length; i++)
	{
		this.markDirty(
			this.selectedElements[i].timeRange.start + timeDelta,
			this.selectedElements[i].timeRange.end   + timeDelta);
	}
}


Timeline.prototype.unselectAll = function()
{
	for (var i = 0; i < this.selectedElements.length; i++)
	{
		this.selectedElements[i].unselect();
		this.markDirtyElement(this.selectedElements[i]);
	}

	this.selectedElements = [];
}


Timeline.prototype.select = function(elem)
{
	if (elem.selected)
		return;
	
	elem.select();
	this.selectedElements.push(elem);
	this.markDirtyElement(elem);
}


Timeline.prototype.unselect = function(elem)
{
	if (!elem.selected)
		return;
	
	elem.unselect();
	this.markDirtyElement(elem);
	
	var indexOf = this.selectedElements.indexOf(elem);
	if (indexOf >= 0)
		this.selectedElements.splice(indexOf, 1);
}


Timeline.prototype.getSelectedElementsTimeRange = function()
{
	var allTimeRange = null;

	for (var i = 0; i < this.selectedElements.length; i++)
	{
		var timeRange = this.selectedElements[i].interactTimeRange;
		if (timeRange == null)
			timeRange = this.selectedElements[i].timeRange;

		if (allTimeRange == null)
			allTimeRange = timeRange.clone();
		else
			allTimeRange.merge(timeRange);
	}
	
	return allTimeRange;
}


Timeline.prototype.getSelectedElementsInteractTimeRange = function()
{
	var allTimeRange = null;

	for (var i = 0; i < this.selectedElements.length; i++)
	{
		var timeRange = this.selectedElements[i].interactTimeRange;
		if (timeRange == null)
			continue;

		if (allTimeRange == null)
			allTimeRange = timeRange.clone();
		else
			allTimeRange.merge(timeRange);
	}
	
	return allTimeRange;
}


Timeline.prototype.getSelectedElementsPitchRange = function()
{
	var pitchMin = null;
	var pitchMax = null;

	for (var i = 0; i < this.selectedElements.length; i++)
	{
		if (this.selectedElements[i].interactPitch == null)
			continue;
		
		var pitch = this.selectedElements[i].interactPitch.midiPitch;

		if (pitchMin == null || pitch < pitchMin.midiPitch)
			pitchMin = new Pitch(pitch);

		if (pitchMax == null || pitch > pitchMax.midiPitch)
			pitchMax = new Pitch(pitch);
	}
	
	return {
		min: pitchMin,
		max: pitchMax
	};
}


Timeline.prototype.getLastElementTimeUpTo = function(trackIndex, time)
{
	var lastTime = 0;
	
	this.tracks[trackIndex].elements.enumerateOverlappingRange(
		new TimeRange(0, time),
		function (elem)
		{
			if (elem.interactTimeRange == null)
				return;
			
			if (elem.interactTimeRange.end > lastTime &&
				elem.interactTimeRange.end <= time)
				lastTime = elem.interactTimeRange.end;
		});
		
	return lastTime;
}


Timeline.prototype.getTrackIndexAtY = function(y)
{
	for (var i = 0; i < this.tracks.length; i++)
	{
		var track = this.tracks[i];

		if (y >= track.y && y < track.y + track.height)
			return i;
	}

	return -1;
}


Timeline.prototype.relayout = function()
{
	this.canvasWidth  = parseFloat(this.canvas.width);
	this.canvasHeight = parseFloat(this.canvas.height);

	this.trackLength.y      = 5;
	this.trackLength.height = 20;

	this.trackKeys.y      = 25;
	this.trackKeys.height = 20;
	
	this.trackMeters.y      = 50;
	this.trackMeters.height = 20;

	this.trackNotes.y      = 75;
	this.trackNotes.height = this.canvasHeight - 80 - 65;
	
	this.trackChords.y      = this.canvasHeight - 60;
	this.trackChords.height = 55;
	
	this.lastTrackBottomY  = this.trackChords.y + this.trackChords.height;

	for (var i = 0; i < this.tracks.length; i++)
		this.tracks[i].relayout();
	
	this.setScrollTime(this.scrollTime);	
	this.markDirtyAll();
}


Timeline.prototype.redraw = function()
{
	// Return early if nothing dirty.
	if (this.redrawDirtyTimeMin == -1 || this.redrawDirtyTimeMax == -1)
		return;
	
	/*
	// Clear background for redraw debug.
	this.ctx.fillStyle = "#ffffff";
	this.ctx.fillRect(
		0,
		0,
		this.canvasWidth,
		this.canvasHeight);
	*/
	
	this.ctx.save();
	this.ctx.translate(
		Math.floor(this.OFFSET_X - this.scrollTime * this.timeToPixelsScaling),
		0);

	// Restrict drawing to dirty region.
	this.ctx.beginPath();
	this.ctx.rect(
		Math.floor((this.redrawDirtyTimeMin + this.REDRAW_TIME_MARGIN) * this.timeToPixelsScaling) + 0.5,
		0,
		(this.redrawDirtyTimeMax - this.redrawDirtyTimeMin - this.REDRAW_TIME_MARGIN * 2) * this.timeToPixelsScaling,
		this.canvasHeight);
	this.ctx.clip();

	// Clear background.
	this.ctx.fillStyle = "#ffffff";
	this.ctx.fillRect(
		Math.floor(this.redrawDirtyTimeMin * this.timeToPixelsScaling) + 0.5,
		0,
		(this.redrawDirtyTimeMax - this.redrawDirtyTimeMin) * this.timeToPixelsScaling,
		this.canvasHeight);
		
	// Draw tracks in reverse order.
	for (var i = this.tracks.length - 1; i >= 0; i--)
	{
		this.ctx.save();
		this.ctx.translate(0, this.tracks[i].y);

		this.tracks[i].redraw(this.redrawDirtyTimeMin, this.redrawDirtyTimeMax);

		this.ctx.restore();
	}
	
	// Draw cursor.
	if (this.cursorVisible)
	{
		var time1  = Math.min(this.cursorTime1, this.cursorTime2);
		var time2  = Math.max(this.cursorTime1, this.cursorTime2);
		var track1 = Math.min(this.cursorTrack1, this.cursorTrack2);
		var track2 = Math.max(this.cursorTrack1, this.cursorTrack2);
		
		var x1  = Math.floor(time1 * this.timeToPixelsScaling) + 0.5;
		var x2  = Math.floor(time2 * this.timeToPixelsScaling) + 0.5;
		var y1 = this.tracks[track1].y;
		var y2 = this.tracks[track2].y + this.tracks[track2].height;
		
		this.ctx.strokeStyle = "#0000ff";
		this.ctx.fillStyle = "#0000ff";
		
		this.ctx.beginPath();
			this.ctx.moveTo(x1, y1);
			this.ctx.lineTo(x1, y2);
			
			this.ctx.moveTo(x2, y1);
			this.ctx.lineTo(x2, y2);
		this.ctx.stroke();
		
		this.ctx.beginPath();
			this.ctx.moveTo(x1, y1);
			this.ctx.lineTo(x1 - 4, y1 - 4);
			this.ctx.lineTo(x1 + 4, y1 - 4);
			this.ctx.lineTo(x1, y1);
			
			this.ctx.moveTo(x2, y1);
			this.ctx.lineTo(x2 - 4, y1 - 4);
			this.ctx.lineTo(x2 + 4, y1 - 4);
			this.ctx.lineTo(x2, y1);
			
			this.ctx.moveTo(x1, y2);
			this.ctx.lineTo(x1 - 4, y2 + 4);
			this.ctx.lineTo(x1 + 4, y2 + 4);
			this.ctx.lineTo(x1, y2);
			
			this.ctx.moveTo(x2, y2);
			this.ctx.lineTo(x2 - 4, y2 + 4);
			this.ctx.lineTo(x2 + 4, y2 + 4);
			this.ctx.lineTo(x2, y2);
		this.ctx.fill();
		
		this.ctx.globalAlpha = 0.25;
		this.ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
	}
	
	this.redrawDirtyTimeMin = -1;
	this.redrawDirtyTimeMax = -1;
	this.ctx.restore();
}
