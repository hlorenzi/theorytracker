function TrackMeters(timeline)
{
	this.timeline = timeline;
	this.elements = new ListByTimeRange();
	this.meters   = new ListByTime();
	
	this.KNOB_WIDTH = 10;
	this.TEXT_MAX_WIDTH = 60;
}


TrackMeters.prototype = new Track();


TrackMeters.prototype.setSong = function(song)
{
	this.elements.clear();
	this.meters.clear();
	this.selectedElements = [];
	
	for (var i = 0; i < song.meters.length; i++)
	{
		this._clipMeters(song.meters[i].time);
		this._meterAdd(song.meters[i]);
	}
	
	this.sanitize();
}


TrackMeters.prototype.enumerateBeatsAtRange = function(timeRange, callback)
{
	var that = this;
	this.meters.enumerateAffectingRange(timeRange, function (elem, start, end)
	{
		if (elem == null)
			return;
		
		// TODO: Only consider beats contained in the time range.
		var beatCount = 0;
		for (var t = elem.meter.time; t < end; t += that.timeline.TIME_PER_WHOLE_NOTE / elem.meter.denominator)
		{
			callback(t, beatCount == 0);
			beatCount = (beatCount + 1) % elem.meter.numerator;
		}
	});
}


TrackMeters.prototype.sanitize = function()
{
	if (this.meters.getItemAffectingTime(0) == null)
		this._meterAdd(new Meter(0, 4, 4));
}


TrackMeters.prototype._meterAdd = function(meter)
{
	var elem = new Element();
	elem.track = this;
	elem.meter = meter.clone();
	
	this.elementRefresh(elem);
	this.elements.add(elem);
	this.meters.add(elem);
	this.timeline.markDirtyElement(elem);
}


TrackMeters.prototype._clipMeters = function(time)
{
	// Check for overlapping meter changes and clip them.
	var overlapping = [];
	
	this.elements.enumerateOverlappingTime(time, function (elem)
	{
		if (elem.meter.time == time)
			overlapping.push(elem);
	});
	
	for (var i = 0; i < overlapping.length; i++)
	{
		this.elements.remove(overlapping[i]);
		this.meters.remove(overlapping[i]);
	}
}


TrackMeters.prototype.applyModifications = function()
{
	for (var i = 0; i < this.modifiedElements.length; i++)
	{
		var elem = this.modifiedElements[i];
		
		this._clipMeters(elem.meter.time);
		this.elementRefresh(elem);
		this.elements.add(elem);
		this.meters.add(elem);
	}
	
	this.sanitize();
	
	this.modifiedElements = [];
	this.timeline.markDirtyAll();
}


TrackMeters.prototype.elementModify = function(elem)
{
	this.elements.remove(elem);
	this.meters.remove(elem);
	
	var modifiedElem = this.getModifiedElement(elem);
	
	elem.meter = new Meter(
		modifiedElem.time,
		elem.meter.numerator,
		elem.meter.denominator);
	
	this.modifiedElements.push(elem);
}


TrackMeters.prototype.elementRefresh = function(elem)
{
	var toPixels   = this.timeline.timeToPixelsScaling;
	
	elem.time      = elem.meter.time;
	elem.timeRange = new TimeRange(
		elem.meter.time - this.KNOB_WIDTH / 2 / toPixels,
		elem.meter.time + (this.KNOB_WIDTH / 2 + this.TEXT_MAX_WIDTH) / toPixels);
	
	elem.interactKind      = this.timeline.INTERACT_MOVE_TIME;
	elem.interactTimeRange = new TimeRange(elem.meter.time, elem.meter.time);
	
	elem.regions = [
		{
			kind:   this.timeline.INTERACT_MOVE_TIME,
			x:      elem.meter.time * toPixels - this.KNOB_WIDTH / 2,
			y:      0,
			width:  this.KNOB_WIDTH,
			height: this.height
		}
	];
}


TrackMeters.prototype.relayout = function()
{
	var that = this;
	
	this.elements.enumerateAll(function (elem)
		{ that.elementRefresh(elem); });
}


TrackMeters.prototype.redraw = function(time1, time2)
{
	var that     = this;
	var ctx      = this.timeline.ctx;
	var toPixels = this.timeline.timeToPixelsScaling;
	
	ctx.save();
	
	ctx.translate(0.5, 0.5);
	
	// Draw meter changes.
	this.elements.enumerateOverlappingRange(new TimeRange(time1, time2), function (elem)
		{ that.drawMeter(elem); });
	
	for (var i = 0; i < this.selectedElements.length; i++)
		this.drawMeter(this.selectedElements[i]);
	
	ctx.restore();
}


TrackMeters.prototype.getModifiedElement = function(elem)
{
	var time = elem.meter.time;

	if (elem.selected)
	{
		if ((this.timeline.mouseAction & this.timeline.INTERACT_MOVE_TIME) != 0)
			time += this.timeline.mouseMoveDeltaTime;
	}

	return {
		time: time
	};
}


TrackMeters.prototype.drawMeter = function(elem)
{
	var ctx      = this.timeline.ctx;
	var toPixels = this.timeline.timeToPixelsScaling;

	var modifiedElem = this.getModifiedElement(elem);

	var col = "#0088ff";
	if (elem.selected)
		col = "#002288";
	else if (this.timeline.hoverElement == elem)
		col = "#00ccff";

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
		"" + elem.meter.numerator + " / " + elem.meter.denominator,
		x + 10,
		this.height / 2);
}
