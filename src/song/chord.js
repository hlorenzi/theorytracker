function SongChord(startTick, endTick, chordKindIndex, rootMidiPitch, embelishments, editorData = null)
{
	this.startTick      = startTick;
	this.endTick        = endTick;
	this.chordKindIndex = chordKindIndex;
	this.rootMidiPitch  = rootMidiPitch;
	this.embelishments  = embelishments;
	this.editorData     = editorData;
}


SongChord.prototype.clone = function()
{
	return new SongChord(
		this.startTick.clone(),
		this.endTick.clone(),
		this.chordKindIndex,
		this.rootMidiPitch,
		this.embelishments);
}