function TrackLength(timeline)
{
	this.timeline = timeline;

	this.y       = 0;
	this.height  = 0;
	this.scrollY = 0;

	this.elements         = new ListByTimeRange();
	this.selectedElements = [];

	this.LENGTH_KNOB_WIDTH = 10;
	this.lengthKnob = null;
}


TrackLength.prototype = new Track();


TrackLength.prototype.setSong = function(song)
{
	this.elements.clear();

	this.lengthKnob = new Element();
	this.lengthKnob.track  = this;
	this.lengthKnob.length = 0;

	this.elementRefresh(this.lengthKnob);
	this.elements.add(this.lengthKnob);
}


TrackLength.prototype.elementModify = function(elem)
{
	this.elements.remove(elem);
	
	var modifiedElem = this.getModifiedLengthKnob(elem);
	
	elem.length = modifiedElem.length;
	this.timeline.length = modifiedElem.length;
	
	this.elementRefresh(elem);
	this.elements.add(elem);
	
	this.timeline.markDirtyAll();
}


TrackLength.prototype.elementRefresh = function(elem)
{
	var toPixels = this.timeline.timeToPixelsScaling;

	elem.length       = this.timeline.length;
	elem.interactKind = this.timeline.INTERACT_MOVE_TIME;
	elem.timeRange    = new TimeRange(
		elem.length - this.LENGTH_KNOB_WIDTH / 2 / toPixels,
		elem.length + this.LENGTH_KNOB_WIDTH / 2 / toPixels);

	elem.regions = [
		{
			kind:   this.timeline.INTERACT_MOVE_TIME,
			x:      elem.length * toPixels - this.LENGTH_KNOB_WIDTH / 2,
			y:      0,
			width:  this.LENGTH_KNOB_WIDTH,
			height: this.height
		}
	];
}


TrackLength.prototype.relayout = function()
{
	var that = this;

	this.elements.enumerateAll(function (elem)
		{ that.elementRefresh(elem); });
}


TrackLength.prototype.redraw = function(time1, time2)
{
	var ctx         = this.timeline.ctx;
	var toPixels    = this.timeline.timeToPixelsScaling;

	ctx.save();

	ctx.translate(0.5, 0.5);

	// Draw markers.
	ctx.strokeStyle = "#444444";
	ctx.beginPath();
		ctx.moveTo(0, this.height / 2);
		ctx.lineTo(this.timeline.length * toPixels, this.height / 2);
	ctx.stroke();
	
	ctx.strokeStyle = "#aaaaaa";
	ctx.beginPath();
		ctx.moveTo(this.timeline.length * toPixels,          this.height / 2);
		ctx.lineTo(this.timeline.lastTimeVisible * toPixels, this.height / 2);
	ctx.stroke();
	
	ctx.fillStyle = "#ffffff";
	ctx.globalAlpha = 0.5;
	ctx.fillRect(
		Math.min(this.timeline.length, this.lengthKnob.length) * toPixels,
		this.height,
		Math.abs(this.timeline.length - this.lengthKnob.length) * toPixels,
		this.timeline.lastTrackBottomY - (this.y + this.height));
	ctx.globalAlpha = 1;

	// Draw length knob.
	this.drawLengthKnob(this.lengthKnob);

	ctx.restore();
}


TrackLength.prototype.getModifiedLengthKnob = function(elem)
{
	var length = elem.length;

	if (elem.selected)
	{
		if ((this.timeline.mouseAction & this.timeline.INTERACT_MOVE_TIME) != 0)
			length += this.timeline.mouseMoveDeltaTime;
	}

	return {
		length: length
	};
}



TrackLength.prototype.drawLengthKnob = function(elem)
{
	var ctx          = this.timeline.ctx;
	var toPixels     = this.timeline.timeToPixelsScaling;

	var modifiedKnob = this.getModifiedLengthKnob(elem);

	var col = "#000000";
	if (elem.selected)
		col = "#888888";
	else if (this.timeline.hoverElement == elem)
		col = "#aaaaaa";

	ctx.fillStyle   = col;
	ctx.strokeStyle = col;
	
	var x = Math.floor(modifiedKnob.length * toPixels);

	ctx.fillRect(
		Math.floor(x - this.LENGTH_KNOB_WIDTH / 2) - 0.5,
		0.5,
		this.LENGTH_KNOB_WIDTH,
		this.height);
		
	ctx.beginPath();
		ctx.moveTo(x, this.height / 2);
		ctx.lineTo(x, this.timeline.lastTrackBottomY - this.y);
	ctx.stroke();
}
