function SongKeyChange(tick, scaleIndex, tonicPitch, editorData = null)
{
	this.tick       = tick;
	this.scaleIndex = scaleIndex;
	this.tonicPitch = tonicPitch;
	this.editorData = editorData;
}


SongKeyChange.prototype.clone = function()
{
	return new SongKeyChange(
		this.tick.clone(),
		this.scaleIndex,
		this.tonicPitch);
}


SongKeyChange.prototype.getLabel = function()
{
	return Theory.getKeyLabel(this.scaleIndex, this.tonicPitch);
}