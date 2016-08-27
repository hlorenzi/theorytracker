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
	this.items.sort(function (a,b) { return a.time - b.time; });
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


ListByTime.prototype.enumerateAffectingRange = function(timeRange, callback)
{
	var lastIndex = this.getIndexAffectingTime(timeRange.start);
	
	for (var i = lastIndex + 1; i < this.items.length; i++)
	{
		if (this.items[i] == null)
			continue;
		
		if (this.items[i].time >= timeRange.end)
			break;
		
		if (lastIndex == -1)
			callback(null, timeRange.start, this.items[i].time);
		else
			callback(this.items[lastIndex], Math.max(timeRange.start, this.items[lastIndex].time), this.items[i].time);
		
		lastIndex = i;
	}
	
	if (lastIndex == -1)
		callback(null, timeRange.start, timeRange.end);
	else
		callback(this.items[lastIndex], Math.max(timeRange.start, this.items[lastIndex].time), timeRange.end);
}


ListByTime.prototype.getIndexAffectingTime = function(time)
{
	for (var i = 0; i < this.items.length; i++)
	{
		if (this.items[i] == null)
			continue;
		
		var itemTime = this.items[i].time;
		
		if (itemTime > time)
			return i - 1;
	}
	
	return this.items.length - 1;
}


ListByTime.prototype.getItemAffectingTime = function(time)
{
	var index = this.getIndexAffectingTime(time);
	if (index == -1)
		return null;
	else
		return this.items[index];
}