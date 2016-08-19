function Timeline(canvas)
{
	var that = this;
	
	// Set up constants.
	this.INTERACT_NONE         = 0x0;
	this.INTERACT_MOVE_TIME    = 0x1;
	this.INTERACT_MOVE_PITCH   = 0x2;
	this.INTERACT_STRETCH_TIME = 0x4;
	
	// Get canvas context.
	this.canvas = canvas;
	this.ctx    = canvas.getContext("2d");
	
	this.canvasWidth  = 0;
	this.canvasHeight = 0;
	
	// Set up mouse/keyboard interaction.
	this.canvas.onmousemove = function(ev) { that.handleMouseMove(ev); };
	this.canvas.onmousedown = function(ev) { that.handleMouseDown(ev); };
	this.canvas.onmouseup   = function(ev) { that.handleMouseUp(ev);   };
	//window.onkeydown        = function(ev) { that.handleKeyDown(ev);   };
	
	this.mouseDown          = false;
	this.mouseDownPos       = null;
	this.mouseAction        = this.INTERACT_NONE;
	this.mouseMoveDeltaTime = 0;
	this.mouseMovePitch     = 0;
	
	this.hoverElement     = null;
	this.hoverRegion      = null;
	this.selectedElements = [];
	
	// Set up song and song events.
	this.song = null;
	
	this.eventNoteAdded    = new Callback();
	this.eventNoteModified = new Callback();
	this.eventNoteRemoved  = new Callback();
	
	// Set up display metrics.
	this.scrollTime          = 0;
	this.timeSnap            = 960 / 16;
	this.timeToPixelsScaling = 100 / 960;
	this.noteHeight          = 5;
	
	this.redrawDirtyTimeMin = -1;
	this.redrawDirtyTimeMax = -1;
	
	// Set up tracks.
	this.trackNotes = new TrackNotes(this);
	
	this.tracks = [];
	this.tracks.push(this.trackNotes);
}


Timeline.prototype.setSong = function(song)
{
	this.unselectAll();
	
	if (this.song != null)
		this.song.raiseAllRemoved();
	
	this.song = song;
	
	if (this.song != null) {
		var that = this;
		this.song.eventNoteAdded   .add(function (id) { that.eventNoteAdded   .call(function (fn) { fn(id); }); });
		this.song.eventNoteModified.add(function (id) { that.eventNoteModified.call(function (fn) { fn(id); }); });
		this.song.eventNoteRemoved .add(function (id) { that.eventNoteRemoved .call(function (fn) { fn(id); }); });
		this.song.raiseAllAdded();
		this.markDirtyAll();
	}
}


Timeline.prototype.handleMouseDown = function(ev)
{
	var that = this;
	
	ev.preventDefault();
	
	var ctrl     = ev.ctrlKey;
	var mousePos = mouseToClient(this.canvas, ev);
	
	// Handle multi-selection with Ctrl.
	if (!ctrl && (this.hoverElement == null || !this.hoverElement.selected))
		this.unselectAll();
	
	if (this.hoverElement != null)
	{
		// Handle selection of element under mouse.
		if (!this.hoverElement.selected)
			this.select(this.hoverElement);
		
		this.unselectAllOfDifferentKind(this.hoverElement.interactKind);
		
		this.mouseAction = this.hoverElement.interactKind;
		this.markDirtyAllSelectedElements(0);
	}
	else
		this.mouseAction = this.INTERACT_NONE;
	
	this.mouseDown           = true;
	this.mouseDownPos        = mousePos;
	this.mouseMoveDeltaTime  = 0;
	this.mouseMoveDeltaPitch = 0;
	this.redraw();
}


Timeline.prototype.handleMouseMove = function(ev)
{
	var that = this;
	
	ev.preventDefault();
	
	var mousePos  = mouseToClient(this.canvas, ev);
	var mouseTime = snap(mousePos.x / this.timeToPixelsScaling, this.timeSnap);
	
	// Handle dragging with the mouse.
	if (this.mouseDown)
	{
		var mouseTimeDelta  = (mousePos.x - this.mouseDownPos.x) / this.timeToPixelsScaling;
		var mousePitchDelta = Math.round((this.mouseDownPos.y - mousePos.y) / this.noteHeight);
		
		if (this.selectedElements.length != 0)
		{
			// Handle time displacement.
			if ((this.mouseAction & this.INTERACT_MOVE_TIME) != 0)
			{
				// Get merged time ranges of all selected elements.
				var allEncompasingInteractTimeRange = this.selectedElements[0].interactTimeRange.clone();
				
				for (var i = 1; i < this.selectedElements.length; i++)
					allEncompasingInteractTimeRange.merge(this.selectedElements[i].interactTimeRange);
				
				// Mark elements' previous positions as dirty,
				// to redraw over when they move away.
				this.markDirtyAllSelectedElements(this.mouseMoveDeltaTime);
				
				// Calculate displacement,
				// ensuring that elements cannot fall out of bounds.
				this.mouseMoveDeltaTime = 
					Math.max(-allEncompasingInteractTimeRange.start,
					Math.min(this.song.length - allEncompasingInteractTimeRange.end,
					mouseTimeDelta));
					
				this.mouseMoveDeltaTime = snap(this.mouseMoveDeltaTime, this.timeSnap);
					
				// Mark elements' new positions as dirty,
				// to redraw them at wherever they move to.
				this.markDirtyAllSelectedElements(this.mouseMoveDeltaTime);
			}
			// If not displacing time, mark elements as dirty in their current positions.
			else
				this.markDirtyAllSelectedElements(0);
			
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
					Math.max(this.song.MIN_VALID_MIDI_PITCH - pitchMin.midiPitch,
					Math.min(this.song.MAX_VALID_MIDI_PITCH - 1 - pitchMax.midiPitch,
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
		
		for (var i = 0; i < this.tracks.length; i++)
		{
			var track = this.tracks[i];
			
			if (mousePos.y < track.y || mousePos.y >= track.y + track.height)
				continue;
			
			track.elements.enumerateOverlappingTime(mouseTime, function (index, elem)
			{
				for (var e = 0; e < elem.regions.length; e++)
				{
					var region = elem.regions[e];
					
					if (mousePos.x >= region.x &&
						mousePos.x <= region.x + region.width &&
						mousePos.y >= region.y + track.y &&
						mousePos.y <= region.y + region.height + track.y)
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
		
		if ((regionKind & this.INTERACT_MOVE_TIME != 0) ||
			(regionKind & this.INTERACT_MOVE_PITCH != 0))
			this.canvas.style.cursor = "pointer";
		else if (regionKind & this.INTERACT_STRETCH_TIME != 0)
			this.canvas.style.cursor = "ew-resize"
		else
			this.canvas.style.cursor = "default";
	}
		
	this.redraw();
}


Timeline.prototype.handleMouseUp = function(ev)
{
	ev.preventDefault();
	
	var mousePos = mouseToClient(this.canvas, ev);
	
	// Handle releasing the mouse after dragging.
	if (this.mouseDown)
	{
		this.markDirtyAllSelectedElements(this.mouseMoveDeltaTime);
		
		for (var i = 0; i < this.selectedElements.length; i++)
			this.selectedElements[i].modify(this.selectedElements[i]);
		
		this.song.applyModifications();
		this.markDirtyAllSelectedElements(0);
	}
	
	this.mouseDown   = false;
	this.mouseAction = this.INTERACT_NONE;
	this.redraw();
}


Timeline.prototype.markDirtyAll = function()
{
	this.redrawDirtyTimeMin = -100;
	this.redrawDirtyTimeMax = this.song.length + 100;
}


Timeline.prototype.markDirty = function(timeStart, timeEnd)
{
	if (this.redrawDirtyTimeMin == -1 || timeStart - 10 < this.redrawDirtyTimeMin)
		this.redrawDirtyTimeMin = timeStart - 10;
	
	if (this.redrawDirtyTimeMax == -1 || timeEnd + 10 > this.redrawDirtyTimeMax)
		this.redrawDirtyTimeMax = timeEnd + 10;
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
		this.selectedElements[i].selected = false;
		this.markDirtyElement(this.selectedElements[i]);
	}
	
	this.selectedElements = [];
}


Timeline.prototype.unselectAllOfDifferentKind = function(kind)
{
	for (var i = this.selectedElements.length - 1; i >= 0; i--)
	{
		if ((this.selectedElements[i].interactKind & kind) == 0)
		{
			this.selectedElements[i].selected = false;
			this.markDirtyElement(this.selectedElements[i]);
			this.selectedElements[i].splice(i, 1);
		}
	}
}


Timeline.prototype.select = function(elem)
{
	elem.selected = true;
	this.selectedElements.push(elem);
	this.markDirtyElement(elem);
}


Timeline.prototype.relayout = function()
{
	this.canvasWidth  = parseFloat(this.canvas.width);
	this.canvasHeight = parseFloat(this.canvas.height);
	
	this.trackNotes.y      = 5;
	this.trackNotes.height = this.canvasHeight - 10;
	
	for (var i = 0; i < this.tracks.length; i++)
		this.tracks[i].relayout();
}


Timeline.prototype.redraw = function()
{
	if (this.redrawDirtyTimeMin == -1 || this.redrawDirtyTimeMax == -1)
		return;
	
	this.ctx.save();
	
	this.ctx.beginPath();
	this.ctx.rect(
		this.redrawDirtyTimeMin * this.timeToPixelsScaling + 1,
		0,
		(this.redrawDirtyTimeMax - this.redrawDirtyTimeMin) * this.timeToPixelsScaling,
		this.canvasHeight);
	this.ctx.clip();
	
	// Clear background.
	this.ctx.fillStyle = "#ffffff";
	this.ctx.fillRect(
		this.redrawDirtyTimeMin * this.timeToPixelsScaling,
		0,
		(this.redrawDirtyTimeMax - this.redrawDirtyTimeMin) * this.timeToPixelsScaling,
		this.canvasHeight);
	
	// Draw tracks.
	for (var i = 0; i < this.tracks.length; i++)
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