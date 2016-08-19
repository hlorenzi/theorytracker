function Note(timeRange, pitch)
{
	this.timeRange = timeRange;
	this.pitch     = pitch;
}


Note.prototype.clone = function()
{
	return new Note(this.timeRange.clone(), this.pitch.clone());
}