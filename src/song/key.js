function Key(time, scaleIndex, rootMidiPitch)
{
	this.time          = time;
	this.scaleIndex    = scaleIndex;
	this.rootMidiPitch = rootMidiPitch;
}


Key.prototype.clone = function()
{
	return new Key(
		this.time,
		this.scaleIndex,
		this.rootMidiPitch);
}