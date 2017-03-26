// TODO: Optimize with better data structures.
//
// Querying items contained in a given range
// should be fast.
//
// `getItemPointFunc` is a function that returns
// the point of the given item.
function ListByPoint(getItemPointFunc)
{
	this.items = [];
	this.getItemPointFunc = getItemPointFunc;
}


ListByPoint.prototype.clear = function()
{
	this.items = [];
}


ListByPoint.prototype.sort = function()
{
	var that = this;
	
	this.items.sort(function (a, b)
	{
		var aRange = that.getItemPointFunc(a);
		var bRange = that.getItemPointFunc(b);
		return aRange.compare(bRange);
	});
}


ListByPoint.prototype.insert = function(item)
{
	this.items.push(item);
}


ListByPoint.prototype.insertList = function(list)
{
	for (var i = 0; i < list.length; i++)
		this.insert(list[i]);
}


ListByPoint.prototype.remove = function(item)
{
	var index = this.items.indexOf(item);
	
	if (index != -1)
		this.items.splice(index, 1);
}


ListByPoint.prototype.removeList = function(list)
{
	for (var i = 0; i < list.length; i++)
		this.remove(list[i]);
}


ListByPoint.prototype.getTotalRange = function()
{
	var start = new Rational(0);
	var end = new Rational(0);
	
	for (var i = 0; i < this.items.length; i++)
	{
		var itemPoint = this.getItemPointFunc(this.items[i]);
		
		if (itemPoint.compare(start) < 0)
			start = itemPoint.clone();
		
		if (itemPoint.compare(end) > 0)
			end = itemPoint.clone();
	}
	
	return { start: start, end: end };
}


ListByPoint.prototype.enumerateAll = function(callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		callback(this.items[i]);
	}
}


ListByPoint.prototype.enumerateOverlappingPoint = function(point, callback)
{
	for (var i = 0; i < this.items.length; i++)
	{
		var itemPoint = this.getItemPointFunc(this.items[i]);
		
		if (itemPoint.compare(point) == 0)
			callback(this.items[i]);
	}
}


ListByPoint.prototype.enumerateOverlappingRange = function(rangeStart, rangeEnd, callback)
{
	if (rangeStart.compare(rangeEnd) == 0)
		this.enumerateOverlappingPoint(rangeStart, callback);
	else
	{
		for (var i = 0; i < this.items.length; i++)
		{
			var itemPoint = this.getItemPointFunc(this.items[i]);
			
			if (itemPoint.compare(rangeEnd) < 0 && itemPoint.compare(rangeStart) >= 0)
				callback(this.items[i]);
		}
	}
}


ListByPoint.prototype.findAt = function(point)
{
	for (var i = 0; i < this.items.length; i++)
	{
		var itemPoint = this.getItemPointFunc(this.items[i]);
		
		if (itemPoint.compare(point) == 0)
			return this.items[i];
	}
	
	return null;
}


ListByPoint.prototype.findPrevious = function(beforePoint)
{
	var nearestItem = null;
	var nearestPoint = null;
	
	for (var i = 0; i < this.items.length; i++)
	{
		var itemPoint = this.getItemPointFunc(this.items[i]);
		
		if ((nearestPoint == null || itemPoint.compare(nearestPoint) > 0) &&
			itemPoint.compare(beforePoint) <= 0)
		{
			nearestItem = this.items[i];
			nearestPoint = itemPoint;
		}
	}
	
	return nearestItem;
}


ListByPoint.prototype.findNext = function(afterPoint)
{
	var nearestItem = null;
	var nearestPoint = null;
	
	for (var i = 0; i < this.items.length; i++)
	{
		var itemPoint = this.getItemPointFunc(this.items[i]);
		
		if ((nearestPoint == null || itemPoint.compare(nearestPoint) < 0) &&
			itemPoint.compare(afterPoint) > 0)
		{
			nearestItem = this.items[i];
			nearestPoint = itemPoint;
		}
	}
	
	return nearestItem;
}