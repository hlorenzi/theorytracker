// TODO: Optimize with better data structures.
//
// Querying items contained in a given time range
// should be fast.
function ListByTimeRange()
{
	this.items = [];
}


ListByTimeRange.prototype.clear = function()
{
	this.items = [];
}


ListByTimeRange.prototype.add = function(item)
{
	this.items.push(item);
}


ListByTimeRange.prototype.remove = function(item)
{
	var index = this.items.indexOf(item);
	
	if (index != -1)
		this.items.splice(index, 1);
}


ListByTimeRange.prototype.enumerateAll = function(callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		if (this.items[i] == null)
			continue;
		
		callback(this.items[i]);
	}
}


ListByTimeRange.prototype.enumerateOverlappingTime = function(time, callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		if (this.items[i] == null)
			continue;
		
		if (this.items[i].timeRange.overlapsTime(time))
			callback(this.items[i]);
	}
}


ListByTimeRange.prototype.enumerateOverlappingRange = function(timeRange, callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		if (this.items[i] == null)
			continue;
		
		if (timeRange.overlapsRange(this.items[i].timeRange))
			callback(this.items[i]);
	}
}