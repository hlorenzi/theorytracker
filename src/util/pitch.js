function Pitch(midiPitch)
{
	this.midiPitch = midiPitch;
}


Pitch.prototype.clone = function()
{
	return new Pitch(this.midiPitch);
}