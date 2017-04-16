function SongKeyChange(tick, scaleIndex, tonicMidiPitch, editorData = null)
{
	this.tick           = tick;
	this.scaleIndex     = scaleIndex;
	this.tonicMidiPitch = tonicMidiPitch;
	this.editorData     = editorData;
}


SongKeyChange.prototype.clone = function()
{
	return new SongKeyChange(
		this.tick.clone(),
		this.scaleIndex,
		this.tonicMidiPitch);
}


SongKeyChange.prototype.getLabel = function()
{
	return Theory.getKeyLabel(this.scaleIndex, this.tonicMidiPitch);
}