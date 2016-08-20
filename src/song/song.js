function Song()
{
	this.length = 960 * 4;
	this.notes  = [];
	this.meters = [];
}


Song.prototype.sanitize = function()
{
	this.meterAdd(new Meter(0, 4, 4));
}


Song.prototype.setLength = function(length)
{
	this.length = length;
}


Song.prototype.noteAdd = function(note)
{
	this.notes.push(note);
}


Song.prototype.meterAdd = function(meter)
{
	this.meters.push(meter);
}