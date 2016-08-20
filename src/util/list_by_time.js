// TODO: Optimize with better data structures.
//
// Querying items contained in a given time range, or
// querying the first item at a time smaller than the given time,
// should be fast operations.
function ListByTime()
{
	this.items = [];
}


ListByTime.prototype.clear = function()
{
	this.items = [];
}


ListByTime.prototype.add = function(item)
{
	this.items.push(item);
}


ListByTime.prototype.remove = function(item)
{
	var index = this.items.indexOf(item);
	
	if (index != -1)
		this.items.splice(index, 1);
}


ListByTime.prototype.enumerateAll = function(callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		if (this.items[i] == null)
			continue;
		
		callback(this.items[i]);
	}
}


ListByTime.prototype.enumerateOverlappingRange = function(timeRange, callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		if (this.items[i] == null)
			continue;
		
		if (timeRange.overlapsTime(this.items[i].time))
			callback(this.items[i]);
	}
}


ListByTime.prototype.getActiveAtTime = function(time)
{
	var item         = null;
	var minTimeSoFar = -1;
	
	for (var i = 0; i < this.items.length; i++)
	{
		if (this.items[i] == null)
			continue;
		
		var itemTime = this.items[i].time;
		
		if (minTimeSoFar == -1 || (itemTime < minTimeSoFar && itemTime >= time))
		{
			item = this.items[i];
			minTimeSoFar = itemTime;
		}
	}
	
	return item;
}