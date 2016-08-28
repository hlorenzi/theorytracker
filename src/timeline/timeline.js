function Timeline(canvas)
{
	var that = this;

	// Set up constants.
	this.INTERACT_NONE           = 0x0;
	this.INTERACT_SCROLL         = 0x1;
	this.INTERACT_MOVE_TIME      = 0x2;
	this.INTERACT_MOVE_PITCH     = 0x4;
	this.INTERACT_STRETCH_TIME_L = 0x8;
	this.INTERACT_STRETCH_TIME_R = 0x10;

	this.TIME_PER_WHOLE_NOTE   = 960;
	this.MAX_VALID_LENGTH      = 960 * 1024;
	this.MIN_VALID_MIDI_PITCH  = 3 * 12;
	this.MAX_VALID_MIDI_PITCH  = 8 * 12 - 1;
	this.OFFSET_X              = 10;
	this.REDRAW_TIME_MARGIN    = 50;

	// Get canvas context.
	this.canvas = canvas;
	this.ctx    = canvas.getContext("2d");

	this.canvasWidth  = 0;
	this.canvasHeight = 0;

	// Set up mouse/keyboard interaction.
	this.canvas.oncontextmenu = function(ev) { that.handleContextMenu(ev); };
	this.canvas.onmousedown   = function(ev) { that.handleMouseDown(ev);   };
	window.onmousemove        = function(ev) { that.handleMouseMove(ev);   };
	window.onmouseup          = function(ev) { that.handleMouseUp(ev);     };
	//window.onkeydown        = function(ev) { that.handleKeyDown(ev);     };

	this.mouseDown              = false;
	this.mouseDownPos           = null;
	this.mouseDownTrack         = null;
	this.mouseDownScrollTime    = 0;
	this.mouseAction            = this.INTERACT_NONE;
	this.mouseMoveDeltaTime     = 0;
	this.mouseMovePitch         = 0;
	this.mouseMoveScrollY       = 0;
	this.mouseStretchTimePivot  = 0;
	this.mouseStretchTimeOrigin = 0;

	this.hoverElement     = null;
	this.hoverRegion      = null;
	this.selectedElements = [];

	// Set up display metrics.
	this.scrollTime          = 0;
	this.firstTimeVisible    = 0;
	this.lastTimeVisible     = 0;
	this.timeSnap            = 960 / 16;
	this.timeToPixelsScaling = 100 / 960;
	this.noteHeight          = 12;
	this.lastTrackBottomY    = 0;

	this.redrawDirtyTimeMin = -1;
	this.redrawDirtyTimeMax = -1;

	// Set up tracks.
	this.length     = 0;
	this.trackLength = new TrackLength(this);
	this.trackKeys   = new TrackKeys(this);
	this.trackMeters = new TrackMeters(this);
	this.trackNotes  = new TrackNotes(this);

	this.tracks = [];
	this.tracks.push(this.trackLength);
	this.tracks.push(this.trackKeys);
	this.tracks.push(this.trackMeters);
	this.tracks.push(this.trackNotes);
}


Timeline.prototype.setSong = function(song)
{
	this.unselectAll();

	this.length = song.length;

	for (var i = 0; i < this.tracks.length; i++)
		this.tracks[i].setSong(song);

	this.markDirtyAll();
}


Timeline.prototype.mouseToClient = function(ev)
{
	var rect = this.canvas.getBoundingClientRect();
	
	return {
		x:         ev.clientX - rect.left - this.OFFSET_X,
		xScrolled: ev.clientX - rect.left - this.OFFSET_X + this.scrollTime * this.timeToPixelsScaling,
		y:         ev.clientY - rect.top
	};
}


Timeline.prototype.handleContextMenu = function(ev)
{
	ev.preventDefault();
	return false;
}


Timeline.prototype.handleMouseDown = function(ev)
{
	var that = this;

	ev.preventDefault();

	var ctrl     = ev.ctrlKey;
	var mousePos = this.mouseToClient(ev);

	this.mouseAction            = this.INTERACT_NONE;
	this.mouseDown              = true;
	this.mouseDownPos           = mousePos;
	this.mouseDownScrollTime    = this.scrollTime;
	this.mouseMoveDeltaTime     = 0;
	this.mouseMoveDeltaPitch    = 0;
	this.mouseMoveScrollY       = 0;
	this.mouseStretchTimePivot  = 0;
	this.mouseStretchTimeOrigin = 0;
	

	if (ev.which !== 1)
		this.mouseAction = this.INTERACT_SCROLL;
	else
	{
		// Handle multi-selection with Ctrl.
		if (!ctrl && (this.hoverElement == null || !this.hoverElement.selected))
			this.unselectAll();
		
		if (this.hoverElement != null && this.hoverRegion != null)
		{
			// Handle selection of element under mouse.
			if (!this.hoverElement.selected)
				this.select(this.hoverElement);
			
			// Set mouse action to a common action of
			// all selected elements.
			this.mouseAction = this.hoverRegion.kind;
			for (var i = 0; i < this.selectedElements.length; i++)
				this.mouseAction &= this.selectedElements[i].interactKind;
			
			// Redraw all selected elements to
			// indicate multiple modification.
			this.markDirtyAllSelectedElements(0);
			
			// Set up stretch values, if applicable.
			if ((this.mouseAction & this.INTERACT_STRETCH_TIME_L) != 0)
			{
				this.mouseStretchTimePivot  = this.getSelectedElementsTimeRange().end;
				this.mouseStretchTimeOrigin = this.hoverElement.interactTimeRange.start;
			}
			else if ((this.mouseAction & this.INTERACT_STRETCH_TIME_R) != 0)
			{
				this.mouseStretchTimePivot  = this.getSelectedElementsTimeRange().start;
				this.mouseStretchTimeOrigin = this.hoverElement.interactTimeRange.end;
			}
		}
	}

	var trackIndex = this.getTrackIndexAtY(mousePos.y);
	this.mouseDownTrack = (trackIndex == -1 ? null : this.tracks[trackIndex]);

	this.redraw();
}


Timeline.prototype.handleMouseMove = function(ev)
{
	var that = this;

	ev.preventDefault();

	var mousePos  = this.mouseToClient(ev);
	var mouseTime = snap(mousePos.xScrolled / this.timeToPixelsScaling, this.timeSnap);

	// Handle dragging with the mouse.
	if (this.mouseDown)
	{
		var mouseTimeDelta  = (mousePos.xScrolled - this.mouseDownPos.xScrolled) / this.timeToPixelsScaling;
		var mousePitchDelta = Math.round((this.mouseDownPos.y - mousePos.y) / this.noteHeight);

		// Handle scrolling.
		if (this.mouseAction == this.INTERACT_SCROLL)
		{
			var scrollTimeDelta = (this.mouseDownPos.x - mousePos.x) / this.timeToPixelsScaling;
			this.scrollTime =
				Math.max(0,
				Math.min(this.length - 960,
				this.mouseDownScrollTime + scrollTimeDelta));
			
			this.firstTimeVisible = this.scrollTime - this.OFFSET_X / this.timeToPixelsScaling;
			this.lastTimeVisible  = this.scrollTime + this.canvasWidth / this.timeToPixelsScaling;
		
			this.mouseMoveScrollY = (mousePos.y - this.mouseDownPos.y);
			this.markDirtyAll();
		}

		else if (this.selectedElements.length != 0)
		{
			// Handle time displacement.
			if ((this.mouseAction & this.INTERACT_MOVE_TIME) != 0)
			{
				// Get merged time ranges of all selected elements.
				var allTimeRange = this.getSelectedElementsTimeRange();

				// Mark elements' previous positions as dirty,
				// to redraw over when they move away.
				this.markDirtyAllSelectedElements(this.mouseMoveDeltaTime);

				// Calculate displacement,
				// ensuring that elements cannot fall out of bounds.
				if (allTimeRange == null)
					this.mouseMoveDeltaTime = mouseTimeDelta;
				else
					this.mouseMoveDeltaTime =
						Math.max(-allTimeRange.start,
						Math.min(this.length - allTimeRange.end,
						mouseTimeDelta));

				this.mouseMoveDeltaTime = snap(this.mouseMoveDeltaTime, this.timeSnap);

				// Mark elements' new positions as dirty,
				// to redraw them at wherever they move to.
				this.markDirtyAllSelectedElements(this.mouseMoveDeltaTime);
			}
			// If not displacing time, mark elements as dirty in their current positions.
			else
				this.markDirtyAllSelectedElements(0);

			// Handle time stretching.
			if ((this.mouseAction & this.INTERACT_STRETCH_TIME_L) != 0 ||
				(this.mouseAction & this.INTERACT_STRETCH_TIME_R) != 0)
			{
				// Get merged time ranges of all selected elements.
				var allTimeRange = this.getSelectedElementsTimeRange();
				
				// Mark elements' previous positions as dirty,
				// to redraw over when they stretch away.
				var prevStretchedAllTimeRange = allTimeRange.clone();
				prevStretchedAllTimeRange.stretch(
					this.mouseStretchTimePivot,
					this.mouseStretchTimeOrigin,
					this.mouseMoveDeltaTime);
					
				this.markDirtyTimeRange(prevStretchedAllTimeRange);

				// FIXME: Calculate stretch,
				// ensuring that elements cannot stretch out of bounds.
				this.mouseMoveDeltaTime = mouseTimeDelta;
				this.mouseMoveDeltaTime = snap(this.mouseMoveDeltaTime, this.timeSnap);

				// Mark elements' new positions as dirty,
				// to redraw them at wherever they stretch to.
				var newStretchedAllTimeRange = allTimeRange.clone();
				newStretchedAllTimeRange.stretch(
					this.mouseStretchTimePivot,
					this.mouseStretchTimeOrigin,
					this.mouseMoveDeltaTime);
					
				this.markDirtyTimeRange(newStretchedAllTimeRange);
			}

			// Handle pitch displacement.
			if ((this.mouseAction & this.INTERACT_MOVE_PITCH) != 0)
			{
				// Get the pitch range of all selected elements.
				var pitchMin = this.selectedElements[0].interactPitch.clone();
				var pitchMax = this.selectedElements[0].interactPitch.clone();

				for (var i = 1; i < this.selectedElements.length; i++)
				{
					var pitch = this.selectedElements[i].interactPitch.midiPitch;

					if (pitch < pitchMin.midiPitch)
						pitchMin = new Pitch(pitch);

					if (pitch > pitchMax.midiPitch)
						pitchMax = new Pitch(pitch);
				}

				// Calculate displacement,
				// ensuring that pitches cannot fall out of bounds.
				this.mouseMoveDeltaPitch =
					Math.max(this.MIN_VALID_MIDI_PITCH - pitchMin.midiPitch,
					Math.min(this.MAX_VALID_MIDI_PITCH - 1 - pitchMax.midiPitch,
					mousePitchDelta));
			}
		}
	}

	// If mouse is not down, just handle hovering.
	else
	{
		if (this.hoverElement != null)
			this.markDirtyElement(this.hoverElement);

		this.hoverElement = null;
		this.hoverRegion  = null;

		var trackIndex = this.getTrackIndexAtY(mousePos.y);
		if (trackIndex != -1)
		{
			var track = this.tracks[trackIndex];

			track.elements.enumerateOverlappingRange(
				new TimeRange(mouseTime - 10 * this.timeToPixelsScaling, mouseTime + 10 * this.timeToPixelsScaling),
				function (elem)
				{
					for (var e = 0; e < elem.regions.length; e++)
					{
						var region = elem.regions[e];

						if (mousePos.xScrolled >= region.x &&
							mousePos.xScrolled <= region.x + region.width &&
							mousePos.y         >= region.y + track.y + track.scrollY &&
							mousePos.y         <= region.y + region.height + track.y + track.scrollY)
						{
							that.hoverElement = elem;
							that.hoverRegion  = region;
						}
					}
				});
		}

		if (this.hoverElement != null)
			this.markDirtyElement(this.hoverElement);

		var regionKind = this.INTERACT_NONE;
		if (this.hoverRegion != null)
			regionKind = this.hoverRegion.kind;

		if (((regionKind & this.INTERACT_MOVE_TIME) != 0) ||
			((regionKind & this.INTERACT_MOVE_PITCH) != 0))
			this.canvas.style.cursor = "pointer";
		else if ((regionKind & this.INTERACT_STRETCH_TIME_L) != 0 ||
			(regionKind & this.INTERACT_STRETCH_TIME_R) != 0)
			this.canvas.style.cursor = "ew-resize"
		else
			this.canvas.style.cursor = "default";
	}

	this.redraw();
}


Timeline.prototype.handleMouseUp = function(ev)
{
	ev.preventDefault();

	// Handle releasing the mouse after dragging.
	if (this.mouseDown)
	{
		if (this.mouseAction == this.INTERACT_SCROLL)
		{
			if (this.mouseDownTrack != null)
				this.mouseDownTrack.handleScroll();
		}
		else
		{
			this.markDirtyAllSelectedElements(this.mouseMoveDeltaTime);

			for (var i = 0; i < this.selectedElements.length; i++)
				this.selectedElements[i].modify();

			for (var i = 0; i < this.tracks.length; i++)
				this.tracks[i].applyModifications();

			this.markDirtyAllSelectedElements(0);
		}
	}

	this.mouseDown      = false;
	this.mouseAction    = this.INTERACT_NONE;
	this.mouseDownTrack = null;
	this.redraw();
}


Timeline.prototype.markDirtyAll = function()
{
	this.redrawDirtyTimeMin = this.firstTimeVisible - 100;
	this.redrawDirtyTimeMax = this.lastTimeVisible  + 100;
}


Timeline.prototype.markDirty = function(timeStart, timeEnd)
{
	if (this.redrawDirtyTimeMin == -1 ||
		timeStart - this.REDRAW_TIME_MARGIN < this.redrawDirtyTimeMin)
	{
		this.redrawDirtyTimeMin = timeStart - this.REDRAW_TIME_MARGIN;
	}

	if (this.redrawDirtyTimeMax == -1 ||
		timeEnd + this.REDRAW_TIME_MARGIN > this.redrawDirtyTimeMax)
	{
		this.redrawDirtyTimeMax = timeEnd + this.REDRAW_TIME_MARGIN;
	}
}


Timeline.prototype.markDirtyTimeRange = function(timeRange)
{
	this.markDirty(timeRange.start, timeRange.end);
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
	elem.select();
	this.selectedElements.push(elem);
	this.markDirtyElement(elem);
}


Timeline.prototype.getSelectedElementsTimeRange = function()
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
	this.trackNotes.height = this.canvasHeight - 80;
	
	this.lastTrackBottomY  = this.trackNotes.y + this.trackNotes.height;

	for (var i = 0; i < this.tracks.length; i++)
		this.tracks[i].relayout();
	
	this.firstTimeVisible = this.scrollTime - this.OFFSET_X / this.timeToPixelsScaling;
	this.lastTimeVisible  = this.scrollTime + this.canvasWidth / this.timeToPixelsScaling;
	
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

	this.redrawDirtyTimeMin = -1;
	this.redrawDirtyTimeMax = -1;
	this.ctx.restore();
}
