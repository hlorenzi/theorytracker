// TODO: Optimize with better data structures.
//
// Querying items contained in a given range
// should be fast.
//
// `getItemRangeFunc` is a function that returns
// an object containing the `start` and `end`
// points of the given item.
function ListByRange(getItemRangeFunc)
{
	this.items = [];
	this.getItemRangeFunc = getItemRangeFunc;
}


ListByRange.prototype.clear = function()
{
	this.items = [];
}


ListByRange.prototype.sort = function()
{
	var that = this;
	
	this.items.sort(function (a, b)
	{
		var aRange = that.getItemRangeFunc(a);
		var bRange = that.getItemRangeFunc(b);
		return aRange.start.compare(bRange.start);
	});
}


ListByRange.prototype.insert = function(item)
{
	this.items.push(item);
}


ListByRange.prototype.insertList = function(list)
{
	for (var i = 0; i < list.length; i++)
		this.insert(list[i]);
}


ListByRange.prototype.remove = function(item)
{
	var index = this.items.indexOf(item);
	
	if (index != -1)
		this.items.splice(index, 1);
}


ListByRange.prototype.removeList = function(list)
{
	for (var i = 0; i < list.length; i++)
		this.remove(list[i]);
}


ListByRange.prototype.getTotalRange = function()
{
	var start = new Rational(0);
	var end = new Rational(0);
	
	for (var i = 0; i < this.items.length; i++)
	{
		var itemRange = this.getItemRangeFunc(this.items[i]);
		
		if (itemRange.start.compare(start) < 0)
			start = itemRange.start.clone();
		
		if (itemRange.end.compare(end) > 0)
			end = itemRange.end.clone();
	}
	
	return { start: start, end: end };
}


ListByRange.prototype.enumerateAll = function(callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		callback(this.items[i]);
	}
}


ListByRange.prototype.enumerateOverlappingPoint = function(point, callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		var itemRange = this.getItemRangeFunc(this.items[i]);
		
		if (itemRange.start.compare(point) < 0 && itemRange.end.compare(point) > 0)
			callback(this.items[i]);
	}
}


ListByRange.prototype.enumerateOverlappingRange = function(rangeStart, rangeEnd, callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		var itemRange = this.getItemRangeFunc(this.items[i]);
		
		if (itemRange.start.compare(rangeEnd) < 0 && itemRange.end.compare(rangeStart) > 0)
			callback(this.items[i]);
	}
}


ListByRange.prototype.findPrevious = function(beforePoint)
{
	var nearestItem = null;
	var nearestPoint = null;
	
	for (var i = 0; i < this.items.length; i++)
	{
		var itemRange = this.getItemRangeFunc(this.items[i]);
		
		if ((nearestPoint == null || itemRange.end.compare(nearestPoint) > 0) &&
			itemRange.end.compare(beforePoint) <= 0)
		{
			nearestItem = this.items[i];
			nearestPoint = itemRange.end;
		}
	}
	
	return nearestItem;
}


ListByRange.prototype.findNext = function(afterPoint)
{
	var nearestItem = null;
	var nearestPoint = null;
	
	for (var i = 0; i < this.items.length; i++)
	{
		var itemRange = this.getItemRangeFunc(this.items[i]);
		
		if ((nearestPoint == null || itemRange.start.compare(nearestPoint) < 0) &&
			itemRange.start.compare(afterPoint) > 0)
		{
			nearestItem = this.items[i];
			nearestPoint = itemRange.start;
		}
	}
	
	return nearestItem;
}