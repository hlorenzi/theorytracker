// TODO: Optimize with better data structures.
function MapByTimeRange()
{
	this.items = [];
}


MapByTimeRange.prototype.add = function(id, item)
{
	this.items[id] = item;
}


MapByTimeRange.prototype.remove = function(id)
{
	this.items[id] = null;
}


MapByTimeRange.prototype.get = function(id)
{
	return this.items[id];
}


MapByTimeRange.prototype.enumerateAll = function(callback)
{
	for (var i = 0; i < this.items.length; i++)
		callback(i, this.items[i]);
}


MapByTimeRange.prototype.enumerateOverlappingTime = function(time, callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		if (this.items[i].timeRange.overlapsTime(time))
			callback(i, this.items[i]);
	}
}


MapByTimeRange.prototype.enumerateOverlappingRange = function(timeRange, callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		if (timeRange.overlapsRange(this.items[i].timeRange))
			callback(i, this.items[i]);
	}
}


MapByTimeRange.prototype.enumerateOverlappingRangeOrSelected = function(timeRange, callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		if (this.items[i].selected || timeRange.overlapsRange(this.items[i].timeRange))
			callback(i, this.items[i]);
	}
}