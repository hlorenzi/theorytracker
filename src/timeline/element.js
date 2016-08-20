function Element()
{
	this.selected  = false;
	this.track     = null;
	this.timeRange = null;
	
	var that = this;
	this.select   = function() { that.track.elementSelect  (this); };
	this.unselect = function() { that.track.elementUnselect(this); };
	this.modify   = function() { that.track.elementModify  (this); };
	
	this.regions           = [];
	this.interactKind      = 0;
	this.interactTimeRange = null;
	this.interactPitch     = null;
}