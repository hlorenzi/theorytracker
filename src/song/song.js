function Song()
{
	this.length = 960 * 4;
	this.notes  = [];
	this.keys   = [];
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


Song.prototype.keyAdd = function(key)
{
	this.keys.push(key);
}


Song.prototype.meterAdd = function(meter)
{
	this.meters.push(meter);
}