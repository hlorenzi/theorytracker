function Track()
{
	this.y       = 0;
	this.height  = 0;
	this.scrollY = 0;
	
	this.elements = null;
	
	this.selectedElements = [];
	this.modifiedElements = [];
}

Track.prototype.setSong = function(song) { }

Track.prototype.handleScroll = function() { }

Track.prototype.elementSelect      = function(elem) { }
Track.prototype.elementUnselect    = function(elem) { }
Track.prototype.elementModify      = function(elem) { }
Track.prototype.applyModifications = function()     { }

Track.prototype.relayout = function()             { }
Track.prototype.redraw   = function(time1, time2) { }