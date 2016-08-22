function Song()
{
	this.length = 960 * 4;
	this.notes  = [];
	this.meters = [];
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