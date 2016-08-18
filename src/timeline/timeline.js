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
	
	this.mouseDown      = false;
	this.mouseDownPos   = null;
	this.mouseAction    = this.INTERACT_NONE;
	this.mouseMoveTime  = 0;
	this.mouseMovePitch = 0;
	
	this.hoverElement     = null;
	this.hoverRegion      = null;
	this.selectedElements = [];
	
	// Set up song and song events.
	this.song = null;
	
	this.eventNoteAdded   = new Callback();
	this.eventNoteChanged = new Callback();
	this.eventNoteRemoved = new Callback();
	
	// Set up display metrics.
	this.scrollTime = 0;
	this.timeToPixelsScaling = 100 / 960;
	this.noteHeight = 10;
	
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
		this.song.eventNoteAdded  .add(function (id) { that.eventNoteAdded  .call(function (fn) { fn(id); }); });
		this.song.eventNoteChanged.add(function (id) { that.eventNoteChanged.call(function (fn) { fn(id); }); });
		this.song.eventNoteRemoved.add(function (id) { that.eventNoteRemoved.call(function (fn) { fn(id); }); });
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
	
	if (!ctrl && (this.hoverElement == null || !this.hoverElement.selected))
		this.unselectAll();
	
	if (this.hoverElement != null)
	{
		this.select(this.hoverElement);
		this.unselectAllOfDifferentKind(this.hoverElement.interactKind);
		
		this.mouseAction = this.hoverElement.interactKind;
	}
	else
		this.mouseAction = this.INTERACT_NONE;
	
	this.mouseDown     = true;
	this.mouseDownPos  = mousePos;
	this.mouseMoveTime = 0;
	this.redraw();
}


Timeline.prototype.handleMouseMove = function(ev)
{
	var that = this;
	
	ev.preventDefault();
	
	var mousePos  = mouseToClient(this.canvas, ev);
	var mouseTime = mousePos.x / this.timeToPixelsScaling;
	
	if (this.mouseDown)
	{
		var mouseTimeDelta = (mousePos.x - this.mouseDownPos.x) / this.timeToPixelsScaling;
		
		if (this.selectedElements.length != 0)
		{
			if ((this.mouseAction & this.INTERACT_MOVE_TIME) != 0)
			{
				var allEncompasingTimeRange         = this.selectedElements[0].timeRange.clone();
				var allEncompasingInteractTimeRange = this.selectedElements[0].interactTimeRange.clone();
				
				for (var i = 1; i < this.selectedElements.length; i++)
				{
					allEncompasingTimeRange        .merge(this.selectedElements[i].timeRange);
					allEncompasingInteractTimeRange.merge(this.selectedElements[i].interactTimeRange);
				}
				
				this.markDirty(
					allEncompasingTimeRange.start + this.mouseMoveTime,
					allEncompasingTimeRange.end   + this.mouseMoveTime);
				
				this.mouseMoveTime = 
					Math.max(-allEncompasingInteractTimeRange.start,
					Math.min(this.song.length - allEncompasingInteractTimeRange.end,
					mouseTimeDelta));
					
				this.markDirty(
					allEncompasingTimeRange.start + this.mouseMoveTime,
					allEncompasingTimeRange.end   + this.mouseMoveTime);
			}
		}
	}
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