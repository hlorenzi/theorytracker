function SongKeyChange(tick, scaleIndex, tonicMidiPitch, accidentalOffset, editorData = null)
{
	this.tick             = tick;
	this.scaleIndex       = scaleIndex;
	this.tonicMidiPitch   = tonicMidiPitch;
	this.accidentalOffset = accidentalOffset;
	this.editorData       = editorData;
}


SongKeyChange.prototype.clone = function()
{
	return new SongKeyChange(
		this.tick.clone(),
		this.scaleIndex,
		this.tonicMidiPitch,
		this.accidentalOffset);
}