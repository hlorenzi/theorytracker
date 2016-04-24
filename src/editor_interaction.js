SongEditor.prototype.unselectAll = function()
{
	for (var i = 0; i < this.noteSelections.length; i++)
		this.noteSelections[i] = false;
	
	for (var i = 0; i < this.chordSelections.length; i++)
		this.chordSelections[i] = false;
	
	for (var i = 0; i < this.keyChangeSelections.length; i++)
		this.keyChangeSelections[i] = false;
	
	for (var i = 0; i < this.meterChangeSelections.length; i++)
		this.meterChangeSelections[i] = false;
	
	this.selectedObjects = 0;
	this.callOnSelectionChanged();
}


SongEditor.prototype.selectKeyChange = function(keyChange)
{
	for (var n = 0; n < this.songData.keyChanges.length; n++)
	{
		if (this.songData.keyChanges[n] == keyChange)
		{
			this.selectedObjects++;
			this.keyChangeSelections[n] = true;
		}
	}
}


SongEditor.prototype.selectMeterChange = function(meterChange)
{
	for (var n = 0; n < this.songData.meterChanges.length; n++)
	{
		if (this.songData.meterChanges[n] == meterChange)
		{
			this.selectedObjects++;
			this.meterChangeSelections[n] = true;
		}
	}
}


SongEditor.prototype.getUniqueKeyChangeSelected = function()
{
	if (this.selectedObjects != 1)
		return null;
	
	for (var i = 0; i < this.keyChangeSelections.length; i++)
	{
		if (this.keyChangeSelections[i])
			return this.songData.keyChanges[i];
	}
	
	return null;	
}


SongEditor.prototype.getUniqueMeterChangeSelected = function()
{
	if (this.selectedObjects != 1)
		return null;
	
	for (var i = 0; i < this.meterChangeSelections.length; i++)
	{
		if (this.meterChangeSelections[i])
			return this.songData.meterChanges[i];
	}
	
	return null;	
}


SongEditor.prototype.clearHover = function()
{
	this.hoverNote = -1;
	this.hoverChord = -1;
	this.hoverKeyChange = -1;
	this.hoverMeterChange = -1;
	this.hoverStretchR = false;
	this.hoverStretchL = false;
}


function isPointInside(p, rect)
{
	return (
		p.x >= rect.x1 && p.x <= rect.x2 &&
		p.y >= rect.y1 && p.y <= rect.y2);
}


SongEditor.prototype.getPositionForTick = function(tick)
{
	for (var b = 0; b < this.viewBlocks.length; b++)
	{
		var block = this.viewBlocks[b];
		
		if (tick >= block.tick && tick < block.tick + block.duration)
		{
			return block.x1 + (tick - block.tick) * this.tickZoom;
		}
	}
	
	return 0;
}


SongEditor.prototype.getRegionAtPosition = function(pos)
{
	for (var r = 0; r < this.viewRegions.length; r++)
	{
		var region = this.viewRegions[r];
		
		if (isPointInside(pos, region))
			return r;
	}
	
	return -1;
}


SongEditor.prototype.getTickAtPosition = function(pos)
{
	var regionIndex = this.getRegionAtPosition(pos);
	if (regionIndex < 0)
		return -1;
	
	var region = this.viewRegions[regionIndex];
	return Math.round((region.tick + Math.min(region.duration, Math.ceil((pos.x - region.x1) / this.tickZoom))) / this.tickSnap) * this.tickSnap;
}


SongEditor.prototype.getZoneAtPosition = function(pos)
{
	var regionIndex = this.getRegionAtPosition(pos);
	if (regionIndex < 0)
		return this.CURSOR_ZONE_ALL;
	
	var region = this.viewRegions[regionIndex];
	if (pos.y >= region.y1 + this.HEADER_HEIGHT &&
		pos.y <= region.y2 - this.CHORD_HEIGHT - this.CHORD_NOTE_SEPARATION)
		return this.CURSOR_ZONE_NOTES;
	
	else if (pos.y >= region.y2 - this.CHORD_HEIGHT &&
		pos.y <= region.y2)
		return this.CURSOR_ZONE_CHORDS;
		
	else
		return this.CURSOR_ZONE_ALL;
}


SongEditor.prototype.getBlockIndexAtTick = function(tick)
{
	for (var b = 0; b < this.viewBlocks.length; b++)
	{
		var block = this.viewBlocks[b];
		
		if (tick >= block.tick && tick < block.tick + block.duration)
			return b;
	}
	
	return -1;
}


SongEditor.prototype.getKeyAtTick = function(tick)
{
	var blockIndex = this.getBlockIndexAtTick(tick);
	if (blockIndex >= 0)
		return this.viewBlocks[blockIndex].key;
	
	return null;
}


SongEditor.prototype.getMeterAtTick = function(tick)
{
	var blockIndex = this.getBlockIndexAtTick(tick);
	if (blockIndex >= 0)
		return this.viewBlocks[blockIndex].meter;
	
	return null;
}


SongEditor.prototype.getEarliestSelectedTick = function()
{
	// FIXME: Take key/meter changes into consideration.
	// TODO: Use binary search.
	var earliest = 1000000;
	for (var n = 0; n < this.noteSelections.length; n++)
	{
		if (this.noteSelections[n])
		{
			earliest = this.songData.notes[n].tick;
			break;
		}
	}
	
	for (var n = 0; n < this.chordSelections.length; n++)
	{
		if (this.chordSelections[n])
		{
			if (this.songData.chords[n].tick < earliest)
				return this.songData.chords[n].tick;
			else if (this.songData.chords[n].tick >= earliest)
				break;
		}
	}
	
	return earliest;
}


SongEditor.prototype.getLatestSelectedTick = function()
{
	// TODO: Take key/meter changes into consideration.
	// TODO: Use binary search.
	var latest = 0;
	for (var n = this.noteSelections.length - 1; n >= 0; n--)
	{
		if (this.noteSelections[n])
		{
			var tick = this.songData.notes[n].tick + this.songData.notes[n].duration;
			if (tick < latest)
				latest = tick;
		}
	}
	
	for (var n = this.chordSelections.length - 1; n >= 0; n--)
	{
		if (this.chordSelections[n])
		{
			var tick = this.songData.chords[n].tick + this.songData.chords[n].duration;
			if (tick < latest)
				latest = tick;
		}
	}
	
	return tick;
}


SongEditor.prototype.getFirstAndLastScrollableRows = function()
{
	var noteAreaHeight = this.canvasHeight - this.MARGIN_TOP - this.HEADER_MARGIN - this.CHORD_HEIGHT - this.CHORDNOTE_MARGIN;
	
	// FIXME: Hardcoded values.
	return {
		first: Math.floor(7 * 9 - noteAreaHeight / 2 / this.NOTE_HEIGHT),
		last: Math.ceil(7 * 2 + noteAreaHeight / 2 / this.NOTE_HEIGHT)
	};
}


SongEditor.prototype.getNoteDragged = function(note, dragPosition)
{
	var regionIndex = this.getRegionAtPosition(dragPosition);
	var regionOriginIndex = this.getRegionAtPosition(this.mouseDragOrigin);
	if (regionIndex == -1 || regionOriginIndex == -1)
		return note;
	
	var region = this.viewRegions[regionIndex];
	var regionOrigin = this.viewRegions[regionOriginIndex];
	
	var dragTick = this.getTickAtPosition(dragPosition);
	var pitchOffset = Math.round((this.mouseDragOrigin.y - regionOrigin.y1 - (dragPosition.y - region.y1)) / this.NOTE_HEIGHT * 2);
	var tickOffset = dragTick - this.getTickAtPosition(this.mouseDragOrigin);
	
	if (this.mouseDragAction == "move")
	{
		return {
			tick: Math.max(0, Math.min(this.songData.endTick - note.duration, note.tick + tickOffset)),
			duration: note.duration,
			pitch: Math.max(this.theory.getMinPitch(), Math.min(this.theory.getMaxPitch(), note.pitch + pitchOffset))
		};
	}
	else if (this.mouseDragAction == "stretch")
	{
		var x1Proportion = (note.tick - this.mouseStretchPivotTick) / (this.mouseStretchOriginTick - this.mouseStretchPivotTick);
		var x2Proportion = (note.tick + note.duration - this.mouseStretchPivotTick) / (this.mouseStretchOriginTick - this.mouseStretchPivotTick);
		var mouseProportion = (dragTick - this.mouseStretchPivotTick) / (this.mouseStretchOriginTick - this.mouseStretchPivotTick);
		
		var pivotDist = (this.mouseStretchOriginTick - this.mouseStretchPivotTick);
		var newX1 = Math.round((this.mouseStretchPivotTick + pivotDist * (x1Proportion * mouseProportion)) / this.tickSnap) * this.tickSnap;
		var newX2 = Math.round((this.mouseStretchPivotTick + pivotDist * (x2Proportion * mouseProportion)) / this.tickSnap) * this.tickSnap;
		
		if (newX2 < newX1)
		{
			var temp = newX1;
			newX1 = newX2;
			newX2 = temp;
		}
		
		return {
			tick: Math.max(0, newX1),
			duration: newX2 - newX1,
			pitch: note.pitch
		};
	}
}


SongEditor.prototype.getChordDragged = function(chord, dragPosition)
{
	var dragTick = this.getTickAtPosition(dragPosition);
	var tickOffset = dragTick - this.getTickAtPosition(this.mouseDragOrigin);
	
	if (this.mouseDragAction == "move")
	{
		return {
			tick: Math.max(0, Math.min(this.songData.endTick - chord.duration, chord.tick + tickOffset)),
			duration: chord.duration
		};
	}
	else if (this.mouseDragAction == "stretch")
	{
		var x1Proportion = (chord.tick - this.mouseStretchPivotTick) / (this.mouseStretchOriginTick - this.mouseStretchPivotTick);
		var x2Proportion = (chord.tick + chord.duration - this.mouseStretchPivotTick) / (this.mouseStretchOriginTick - this.mouseStretchPivotTick);
		var mouseProportion = (dragTick - this.mouseStretchPivotTick) / (this.mouseStretchOriginTick - this.mouseStretchPivotTick);
		
		var pivotDist = (this.mouseStretchOriginTick - this.mouseStretchPivotTick);
		var newX1 = Math.round((this.mouseStretchPivotTick + pivotDist * (x1Proportion * mouseProportion)) / this.tickSnap) * this.tickSnap;
		var newX2 = Math.round((this.mouseStretchPivotTick + pivotDist * (x2Proportion * mouseProportion)) / this.tickSnap) * this.tickSnap;
		
		if (newX2 < newX1)
		{
			var temp = newX1;
			newX1 = newX2;
			newX2 = temp;
		}
		
		return {
			tick: Math.max(0, newX1),
			duration: newX2 - newX1
		};
	}
}


SongEditor.prototype.getKeyChangeDragged = function(keyChange, dragPosition)
{
	var tickOffset = this.getTickAtPosition(dragPosition) - this.getTickAtPosition(this.mouseDragOrigin);
	
	if (this.mouseDragAction == "move")
		return { tick: Math.max(0, Math.min(this.songData.endTick, keyChange.tick + tickOffset)) };
	
	// TODO: Should move proportionally, like notes.
	else if (this.mouseDragAction == "stretch")
		return { tick: keyChange.tick };
}


SongEditor.prototype.getMeterChangeDragged = function(meterChange, dragPosition)
{
	var tickOffset = this.getTickAtPosition(dragPosition) - this.getTickAtPosition(this.mouseDragOrigin);
	
	if (this.mouseDragAction == "move")
		return { tick: Math.max(0, Math.min(this.songData.endTick, meterChange.tick + tickOffset)) };
	
	// TODO: Should move proportionally, like notes.
	else if (this.mouseDragAction == "stretch")
		return { tick: meterChange.tick };
}