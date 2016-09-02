Timeline.prototype.interactionBeginMoveTime = function()
{
	this.actionMoveDeltaTime = 0;
}


Timeline.prototype.interactionUpdateMoveTime = function(deltaFromOrigin)
{
	// Get merged time ranges of all selected elements.
	var allTimeRange = this.getSelectedElementsInteractTimeRange();

	// Mark elements' previous positions as dirty,
	// to redraw over when they move away.
	this.markDirtyAllSelectedElements(this.actionMoveDeltaTime);

	// Calculate displacement,
	// ensuring that elements cannot fall out of bounds.
	if (allTimeRange == null)
		this.actionMoveDeltaTime = deltaFromOrigin;
	else
		this.actionMoveDeltaTime =
			Math.max(-allTimeRange.start,
			Math.min(this.length - allTimeRange.end,
			deltaFromOrigin));

	this.actionMoveDeltaTime = snap(this.actionMoveDeltaTime, this.timeSnap);

	// Mark elements' new positions as dirty,
	// to redraw them at wherever they move to.
	this.markDirtyAllSelectedElements(this.actionMoveDeltaTime);
}


Timeline.prototype.interactionBeginMovePitch = function()
{
	this.actionMoveDeltaPitch = 0;
}


Timeline.prototype.interactionUpdateMovePitch = function(deltaFromOrigin)
{
	// Get the pitch range of all selected elements.
	var pitchRange = this.getSelectedElementsPitchRange();

	// Calculate displacement,
	// ensuring that pitches cannot fall out of bounds.
	this.actionMoveDeltaPitch = deltaFromOrigin;
	
	if (pitchRange.min != null && pitchRange.max != null)
	{
		this.actionMoveDeltaPitch =
			Math.max(this.MIN_VALID_MIDI_PITCH - pitchRange.min.midiPitch,
			Math.min(this.MAX_VALID_MIDI_PITCH - pitchRange.max.midiPitch,
			this.actionMoveDeltaPitch));
			
		this.createLastPitch = Math.round((pitchRange.min.midiPitch + pitchRange.max.midiPitch) / 2);
	}
	
	this.markDirtyAllSelectedElements(0);
}


Timeline.prototype.interactionBeginStretchTimeL = function(origin)
{
	this.actionStretchTimePivot  = this.getSelectedElementsTimeRange().end;
	this.actionStretchTimeOrigin = origin;
}


Timeline.prototype.interactionBeginStretchTimeR = function(origin)
{
	this.actionStretchTimePivot  = this.getSelectedElementsTimeRange().start;
	this.actionStretchTimeOrigin = origin;
}


Timeline.prototype.interactionUpdateStretchTime = function(deltaFromOrigin)
{
	// Get merged time ranges of all selected elements.
	var allTimeRange = this.getSelectedElementsInteractTimeRange();
	
	// Mark elements' previous positions as dirty,
	// to redraw over when they stretch away.
	var prevStretchedAllTimeRange = allTimeRange.clone();
	prevStretchedAllTimeRange.stretch(
		this.actionStretchTimePivot,
		this.actionStretchTimeOrigin,
		this.actionMoveDeltaTime);
		
	this.markDirtyTimeRange(prevStretchedAllTimeRange);

	// FIXME: Calculate stretch,
	// ensuring that elements cannot stretch out of bounds.
	this.actionMoveDeltaTime = deltaFromOrigin;
	this.actionMoveDeltaTime = snap(this.actionMoveDeltaTime, this.timeSnap);

	// Mark elements' new positions as dirty,
	// to redraw them at wherever they stretch to.
	var newStretchedAllTimeRange = allTimeRange.clone();
	newStretchedAllTimeRange.stretch(
		this.actionStretchTimePivot,
		this.actionStretchTimeOrigin,
		this.actionMoveDeltaTime);
		
	this.markDirtyTimeRange(newStretchedAllTimeRange);
}


Timeline.prototype.interactionEnd = function()
{
	if ((this.action & this.INTERACT_MOVE_TIME) != 0)
		this.markDirtyAllSelectedElements(this.actionMoveDeltaTime);

	for (var i = 0; i < this.selectedElements.length; i++)
		this.selectedElements[i].modify();

	for (var i = 0; i < this.tracks.length; i++)
		this.tracks[i].applyModifications();

	this.markDirtyAllSelectedElements(0);
	
	this.action       = this.INTERACT_NONE;
	this.actionDevice = 0;
	
	this.actionMoveDeltaTime     = 0;
	this.actionMoveDeltaPitch    = 0;
	this.actionStretchTimePivot  = 0;
	this.actionStretchTimeOrigin = 0;
}