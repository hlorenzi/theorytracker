function SongMeasureBreak(tick, isLineBreak, editorData = null)
{
	this.tick        = tick;
	this.isLineBreak = isLineBreak;
	this.editorData  = editorData;
}


SongMeasureBreak.prototype.clone = function()
{
	return new SongMeasureBreak(
		this.tick.clone(),
		this.isLineBreak);
}