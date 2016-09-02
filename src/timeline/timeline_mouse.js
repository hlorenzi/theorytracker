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
	
	if (this.actionDevice != 0)
		this.interactionEnd();

	var ctrl      = ev.ctrlKey;
	var shift     = ev.shiftKey;
	var alt       = ev.altKey;
	var mousePos  = this.mouseToClient(ev);
	var mouseTime = snap(mousePos.xScrolled / this.timeToPixelsScaling, this.timeSnap);

	var lastMouseDate        = this.mouseDownDate;
	this.mouseDownDate       = new Date();
	this.action              = this.INTERACT_NONE;
	this.actionDevice        = this.MOUSE;
	this.mouseDown           = true;
	this.mouseDownPos        = mousePos;
	this.mouseDownScrollTime = this.scrollTime;
	this.mouseMoveScrollY    = 0;
	
	// Handle scrolling with the middle or right mouse buttons.
	if (ev.which !== 1 || this.keyboardHoldSpace)
	{
		this.action = this.INTERACT_SCROLL;
		this.canvas.style.cursor = "default";
	}
	
	else
	{
		// Handle multi-selection with Ctrl.
		if (shift || (!ctrl && (this.hoverElement == null || !this.hoverElement.selected)))
			this.unselectAll();
		
		if (!shift && this.hoverElement != null && this.hoverRegion != null)
		{
			this.hideCursor();
			
			// Select element under mouse.
			this.select(this.hoverElement);
			
			// Set action to a common action of
			// all selected elements.
			this.action = this.hoverRegion.kind;
			for (var i = 0; i < this.selectedElements.length; i++)
				this.action &= this.selectedElements[i].interactKind;
			
			// Redraw all selected elements to
			// indicate multiple modification.
			this.markDirtyAllSelectedElements(0);
			
			// Set up interaction variables.
			if ((this.action & this.INTERACT_MOVE_TIME) != 0)
				this.interactionBeginMoveTime();
			
			if ((this.action & this.INTERACT_MOVE_PITCH) != 0)
				this.interactionBeginMovePitch();
			
			if ((this.action & this.INTERACT_STRETCH_TIME_L) != 0)
				this.interactionBeginStretchTimeL(this.hoverElement.interactTimeRange.start);
			
			if ((this.action & this.INTERACT_STRETCH_TIME_R) != 0)
				this.interactionBeginStretchTimeR(this.hoverElement.interactTimeRange.end);
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
					this.action = this.INTERACT_CURSOR;
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
	if (this.actionDevice == this.MOUSE && this.mouseDown)
	{
		var mouseTimeDelta  = (mousePos.xScrolled - this.mouseDownPos.xScrolled) / this.timeToPixelsScaling;
		var mousePitchDelta = Math.round((this.mouseDownPos.y - mousePos.y) / this.noteHeight);

		// Handle scrolling.
		if (this.action == this.INTERACT_SCROLL)
		{
			var scrollTimeDelta = (this.mouseDownPos.x - mousePos.x) / this.timeToPixelsScaling;
			this.setScrollTime(this.mouseDownScrollTime + scrollTimeDelta);
			
			this.mouseMoveScrollY = (mousePos.y - this.mouseDownPos.y);
			
			this.markDirtyAll();
		}
		
		// Handle cursor selection.
		else if (this.action == this.INTERACT_CURSOR)
		{
			var lastTrack2 = this.cursorTrack2;
			
			var trackIndex = this.getTrackIndexAtY(mousePos.y);
			if (trackIndex != -1)
				this.setCursor2(mouseTime, trackIndex);
			else
				this.setCursor2(mouseTime, this.cursorTrack1);
		}

		else if (this.selectedElements.length != 0)
		{
			// Handle time displacement.
			if ((this.action & this.INTERACT_MOVE_TIME) != 0)
				this.interactionUpdateMoveTime(mouseTimeDelta);

			// Handle pitch displacement.
			if ((this.action & this.INTERACT_MOVE_PITCH) != 0)
				this.interactionUpdateMovePitch(mousePitchDelta);

			// Handle time stretching.
			if ((this.action & this.INTERACT_STRETCH_TIME_L) != 0 ||
				(this.action & this.INTERACT_STRETCH_TIME_R) != 0)
				this.interactionUpdateStretchTime(mouseTimeDelta);
		}
	}

	// If mouse is not down, just handle hovering.
	else if (this.actionDevice == 0)
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
	if (this.actionDevice == this.MOUSE && this.mouseDown)
	{
		if (this.action == this.INTERACT_SCROLL)
		{
			if (this.mouseDownTrack != null)
				this.mouseDownTrack.handleScroll();
		}
		else
			this.interactionEnd();
		
		this.actionDevice = 0;
	}

	this.mouseDown      = false;
	this.mouseDownTrack = null;
	this.redraw();
}