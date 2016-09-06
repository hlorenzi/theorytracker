function Element()
{
	this.selected  = false;
	this.track     = null;
	this.timeRange = null;
	
	this.regions           = [];
	this.interactKind      = 0;
	this.interactTimeRange = null;
	this.interactPitch     = null;
	
	var that = this;
	
	this.select = function()
	{
		this.selected = true;
		this.track.selectedElements.push(this);
	};
	
	this.unselect = function()
	{
		this.selected = false;
		
		var index = this.track.selectedElements.indexOf(this);
		
		if (index != -1)
			this.track.selectedElements.splice(index, 1);
	};
	
	this.modify = function() { that.track.elementModify(this); };
	this.remove = function() { that.track.elementRemove(this); };
}