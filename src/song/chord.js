function Chord(timeRange, chordIndex, rootMidiPitch)
{
	this.timeRange     = timeRange;
	this.chordIndex    = chordIndex;
	this.rootMidiPitch = rootMidiPitch;
}


Chord.prototype.clone = function()
{
	return new Chord(this.timeRange.clone(), this.chordIndex, this.rootMidiPitch);
}