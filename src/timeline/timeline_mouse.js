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

	var ctrl      = ev.ctrlKey;
	var shift     = ev.shiftKey;
	var mousePos  = this.mouseToClient(ev);
	var mouseTime = snap(mousePos.xScrolled / this.timeToPixelsScaling, this.timeSnap);

	var lastMouseDate           = this.mouseDownDate;
	this.mouseDownDate          = new Date();
	this.mouseAction            = this.INTERACT_NONE;
	this.mouseDown              = true;
	this.mouseDownPos           = mousePos;
	this.mouseDownScrollTime    = this.scrollTime;
	this.mouseMoveDeltaTime     = 0;
	this.mouseMoveDeltaPitch    = 0;
	this.mouseMoveScrollY       = 0;
	this.mouseStretchTimePivot  = 0;
	this.mouseStretchTimeOrigin = 0;
	
	// Handle scrolling with the middle or right mouse buttons.
	if (ev.which !== 1)
	{
		this.mouseAction = this.INTERACT_SCROLL;
		this.canvas.style.cursor = "default";
	}
	
	else
	{
		// Handle multi-selection with Ctrl.
		if (shift || (!ctrl && (this.hoverElement == null || !this.hoverElement.selected)))
			this.unselectAll();
		
		if (!shift && this.hoverElement != null && this.hoverRegion != null)
		{
			this.cursorVisible = false;
			
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
		
		// Handle cursor.
		else
		{
			var trackIndex = this.getTrackIndexAtY(mousePos.y);
			if (trackIndex != -1)
			{
				this.cursorVisible = true;
				
				// Handle double-click.
				if (new Date().getTime() - lastMouseDate < 300)
				{
					var snapTime = this.getLastElementTimeUpTo(trackIndex, mouseTime);
					this.setCursor(snapTime, trackIndex);
				}
				else
				{
					this.mouseAction = this.INTERACT_CURSOR;
					this.setCursor(mouseTime, trackIndex);
				}
				
				this.canvas.style.cursor = "text";
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
		
		// Handle cursor selection.
		else if (this.mouseAction == this.INTERACT_CURSOR)
		{
			var lastTrack2 = this.cursorTrack2;
			
			var trackIndex = this.getTrackIndexAtY(mousePos.y);
			if (trackIndex != -1)
				this.setCursor2(mouseTime, trackIndex);
			else
				this.setCursor2(mouseTime, this.cursorTrack1);
			
			if (this.cursorTime2 != this.cursorTime1)
			{
				this.unselectAll();
				
				var time1 = Math.min(this.cursorTime1, this.cursorTime2);
				var time2 = Math.max(this.cursorTime1, this.cursorTime2);
				var track1 = Math.min(this.cursorTrack1, this.cursorTrack2);
				var track2 = Math.max(this.cursorTrack1, this.cursorTrack2);
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
			this.canvas.style.cursor = "text";
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