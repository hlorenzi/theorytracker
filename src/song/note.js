function SongNote(startTick, endTick, trackIndex, midiPitch, editorData = null)
{
	this.startTick  = startTick;
	this.endTick    = endTick;
	this.trackIndex = trackIndex;
	this.midiPitch  = midiPitch;
	this.editorData = editorData;
}


SongNote.prototype.clone = function()
{
	return new SongNote(this.startTick.clone(), this.endTick.clone(), this.trackIndex, this.midiPitch);
}