// TODO: Optimize with better data structures.
function MapByTime()
{
	this.items = [];
}


MapByTime.prototype.add = function(id, item)
{
	this.items[id] = item;
}


MapByTime.prototype.remove = function(id)
{
	this.items[id] = null;
}


MapByTime.prototype.get = function(id)
{
	return this.items[id];
}


MapByTime.prototype.refresh = function(id)
{
	// Do nothing for this unoptimized implementation.
}


MapByTime.prototype.enumerateAll = function(callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		if (this.items[i] == null)
			continue;
		
		callback(i, this.items[i]);
	}
}


MapByTime.prototype.enumerateOverlappingRange = function(timeRange, callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		if (this.items[i] == null)
			continue;
		
		if (timeRange.overlapsTime(this.items[i].time))
			callback(i, this.items[i]);
	}
}


MapByTime.prototype.getActiveAtTime = function(time)
{
	var index        = -1;
	var minTimeSoFar = -1;
	
	for (var i = 0; i < this.items.length; i++)
	{
		if (this.items[i] == null)
			continue;
		
		var itemTime = this.items[i].time;
		
		if (minTimeSoFar == -1 || (itemTime < minTimeSoFar && itemTime >= time))
		{
			index = i;
			minTimeSoFar = itemTime;
		}
	}
	
	return index;
}