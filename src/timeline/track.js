function Track()
{
	this.y       = 0;
	this.height  = 0;
	this.scrollY = 0;
	
	this.elements = null;
	
	this.selectedElements = [];
	this.modifiedElements = [];
}

Track.prototype.setSong  = function(song) { }
Track.prototype.sanitize = function()     { }

Track.prototype.handleScroll = function() { }

Track.prototype.elementSelect      = function(elem) { }
Track.prototype.elementUnselect    = function(elem) { }
Track.prototype.elementModify      = function(elem) { }
Track.prototype.applyModifications = function()     { }


Track.prototype.elementRemove      = function(elem)
{
	if (elem.selected)
		this.timeline.unselect(elem);
	
	this.timeline.markDirtyElement(elem);
	this.elements.remove(elem);
}


Track.prototype.getBackspaceTime = function(beforeTime)
{ 
	var time = 0;
	
	this.elements.enumerateAll(function (elem)
	{
		if (elem.interactTimeRange == null)
			return;
		
		if (elem.interactTimeRange.start > beforeTime)
			return;
		
		if (elem.interactTimeRange.end >= beforeTime)
		{
			time = Math.max(
				elem.interactTimeRange.start,
				time);
		}
		else 
		{
			time = Math.max(
				elem.interactTimeRange.end,
				time);
		}
	});
	
	return time;
}


Track.prototype.clipRange = function(timeRange)  { }

Track.prototype.relayout = function()             { }
Track.prototype.redraw   = function(time1, time2) { }