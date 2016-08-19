function TimeRange(start, end)
{
	this.start = start;
	this.end   = end;
}


TimeRange.prototype.clone = function()
{
	return new TimeRange(this.start, this.end);
}


TimeRange.prototype.merge = function(other)
{
	this.start = Math.min(this.start, other.start)
	this.end   = Math.max(this.end,   other.end);
}


TimeRange.prototype.getClippedParts = function(clipRange)
{
	var parts = [];
	
	if (!this.overlapsRange(clipRange))
		parts.push(this.clone());
	else
	{
		if (clipRange.start > this.start)
			parts.push(new TimeRange(this.start, clipRange.start));
		
		if (clipRange.end < this.end)
			parts.push(new TimeRange(clipRange.end, this.end));
	}
	
	return parts;
}


TimeRange.prototype.duration = function()
{
	return this.end - this.start;
}


TimeRange.prototype.overlapsTime = function(time)
{
	return time >= this.start && time < this.end;
}


TimeRange.prototype.overlapsRange = function(other)
{
	return this.start < other.end && this.end > other.start;
}