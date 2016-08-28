function TrackKeys(timeline)
{
	this.timeline = timeline;
	this.elements = new ListByTimeRange();
	this.keys     = new ListByTime();
	
	this.KNOB_WIDTH = 10;
	this.TEXT_MAX_WIDTH = 180;
}


TrackKeys.prototype = new Track();


TrackKeys.prototype.setSong = function(song)
{
	this.elements.clear();
	this.keys.clear();
	this.selectedElements = [];
	
	for (var i = 0; i < song.keys.length; i++)
	{
		this._clipKeys(song.keys[i].time);
		this._keyAdd(song.keys[i]);
	}
	
	this.sanitize();
}


TrackKeys.prototype.enumerateKeysAtRange = function(timeRange, callback)
{
	var that = this;
	this.keys.enumerateAffectingRange(timeRange, function (elem, start, end)
	{
		if (elem == null)
			return;
		
		callback(elem.key, start, end);
	});
}


TrackKeys.prototype.sanitize = function()
{
	if (this.keys.getItemAffectingTime(0) == null)
		this._keyAdd(new Key(0, 0, theory.C));
}


TrackKeys.prototype._keyAdd = function(key)
{
	var elem = new Element();
	elem.track = this;
	elem.key = key.clone();
	
	this.elementRefresh(elem);
	this.elements.add(elem);
	this.keys.add(elem);
	this.timeline.markDirtyElement(elem);
}


TrackKeys.prototype._clipKeys = function(time)
{
	// Check for overlapping key changes and clip them.
	var overlapping = [];
	
	this.elements.enumerateOverlappingTime(time, function (elem)
	{
		if (elem.key.time == time)
			overlapping.push(elem);
	});
	
	for (var i = 0; i < overlapping.length; i++)
	{
		this.elements.remove(overlapping[i]);
		this.keys.remove(overlapping[i]);
	}
}


TrackKeys.prototype.applyModifications = function()
{
	for (var i = 0; i < this.modifiedElements.length; i++)
	{
		var elem = this.modifiedElements[i];
		
		this._clipKeys(elem.key.time);
		this.elementRefresh(elem);
		this.elements.add(elem);
		this.keys.add(elem);
	}
	
	this.sanitize();
	
	this.modifiedElements = [];
	this.timeline.markDirtyAll();
}


TrackKeys.prototype.elementModify = function(elem)
{
	this.elements.remove(elem);
	this.keys.remove(elem);
	
	var modifiedElem = this.getModifiedElement(elem);
	
	elem.key = new Key(
		modifiedElem.time,
		elem.key.scaleIndex,
		elem.key.rootMidiPitch);
	
	this.modifiedElements.push(elem);
}


TrackKeys.prototype.elementRefresh = function(elem)
{
	var toPixels   = this.timeline.timeToPixelsScaling;
	
	elem.time      = elem.key.time;
	elem.timeRange = new TimeRange(
		elem.key.time - this.KNOB_WIDTH / 2 / toPixels,
		elem.key.time + (this.KNOB_WIDTH / 2 + this.TEXT_MAX_WIDTH) / toPixels);
	
	elem.interactTimeRange = new TimeRange(elem.key.time, elem.key.time);
	elem.interactKind      = this.timeline.INTERACT_MOVE_TIME |
		this.timeline.INTERACT_STRETCH_TIME_L | this.timeline.INTERACT_STRETCH_TIME_R;
	
	elem.regions = [
		{
			kind:   this.timeline.INTERACT_MOVE_TIME,
			x:      elem.key.time * toPixels - this.KNOB_WIDTH / 2,
			y:      0,
			width:  this.KNOB_WIDTH,
			height: this.height
		}
	];
}


TrackKeys.prototype.relayout = function()
{
	var that = this;
	
	this.elements.enumerateAll(function (elem)
		{ that.elementRefresh(elem); });
}


TrackKeys.prototype.redraw = function(time1, time2)
{
	var that     = this;
	var ctx      = this.timeline.ctx;
	var toPixels = this.timeline.timeToPixelsScaling;
	
	ctx.save();
	
	ctx.translate(0.5, 0.5);
	
	// Draw meter changes.
	this.elements.enumerateOverlappingRange(new TimeRange(time1, time2), function (elem)
		{ that.drawKey(elem); });
	
	for (var i = 0; i < this.selectedElements.length; i++)
		this.drawKey(this.selectedElements[i]);
	
	ctx.restore();
}


TrackKeys.prototype.getModifiedElement = function(elem)
{
	var time = elem.key.time;

	if (elem.selected)
	{
		if ((this.timeline.mouseAction & this.timeline.INTERACT_MOVE_TIME) != 0)
			time += this.timeline.mouseMoveDeltaTime;
		
		if ((this.timeline.mouseAction & this.timeline.INTERACT_STRETCH_TIME_L) != 0 ||
			(this.timeline.mouseAction & this.timeline.INTERACT_STRETCH_TIME_R) != 0)
		{
			time = stretch(
				time,
				this.timeline.mouseStretchTimePivot,
				this.timeline.mouseStretchTimeOrigin,
				this.timeline.mouseMoveDeltaTime);
		}
	}

	return {
		time: time
	};
}


TrackKeys.prototype.drawKey = function(elem)
{
	var ctx      = this.timeline.ctx;
	var toPixels = this.timeline.timeToPixelsScaling;

	var modifiedElem = this.getModifiedElement(elem);

	var col = "#ff0088";
	if (elem.selected)
		col = "#880022";
	else if (this.timeline.hoverElement == elem)
		col = "#ff00cc";

	ctx.fillStyle   = col;
	ctx.strokeStyle = col;
	
	var x = Math.floor(modifiedElem.time * toPixels);

	ctx.fillRect(
		Math.floor(x - this.KNOB_WIDTH / 2) - 0.5,
		0.5,
		this.KNOB_WIDTH,
		this.height - 1);
		
	ctx.beginPath();
		ctx.moveTo(x, this.height / 2);
		ctx.lineTo(x, this.timeline.lastTrackBottomY - this.y);
	ctx.stroke();
	
	ctx.font         = "12px Verdana";
	ctx.textAlign    = "start";
	ctx.textBaseline = "middle";
	
	ctx.fillText(
		theory.pitchNameInScale(elem.key.scaleIndex, elem.key.rootMidiPitch) +
			" " + theory.scales[elem.key.scaleIndex].name,
		x + 10,
		this.height / 2);
}
