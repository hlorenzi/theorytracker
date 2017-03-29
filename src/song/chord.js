function SongChord(startTick, endTick, chordKindIndex, rootPitch, embelishments, editorData = null)
{
	this.startTick      = startTick;
	this.endTick        = endTick;
	this.chordKindIndex = chordKindIndex;
	this.rootPitch      = rootPitch;
	this.embelishments  = embelishments;
	this.editorData     = editorData;
}


SongChord.prototype.clone = function()
{
	return new SongChord(
		this.startTick.clone(),
		this.endTick.clone(),
		this.chordKindIndex,
		this.rootPitch,
		this.embelishments);
}