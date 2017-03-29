function SongNote(startTick, endTick, trackIndex, pitch, octave, editorData = null)
{
	this.startTick  = startTick;
	this.endTick    = endTick;
	this.trackIndex = trackIndex;
	this.pitch      = pitch;
	this.editorData = editorData;
	this.octave     = octave;		// // //
}


SongNote.prototype.getMidiPitch = function()
{
	return this.octave * 12 + Theory.getSemitones(this.pitch);
}


SongNote.prototype.clone = function()
{
	return new SongNote(this.startTick.clone(), this.endTick.clone(), this.trackIndex, this.pitch, this.octave);
}