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


function transformMousePosition(elem, ev)
{
	var rect = elem.getBoundingClientRect();
	return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
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


SongEditor.prototype.getTickAtPosition = function(x)
{
	for (var b = 0; b < this.viewBlocks.length; b++)
	{
		var block = this.viewBlocks[b];
		
		if (x >= block.x1 &&
			(b == this.viewBlocks.length - 1 || x <= this.viewBlocks[b + 1].x1))
		{
			return Math.round((block.tick + Math.min(block.duration, Math.ceil((x - block.x1) / this.tickZoom))) / this.tickSnap) * this.tickSnap;
		}
	}
	
	return 0;
}


SongEditor.prototype.getZoneAtPosition = function(y)
{
	if (y >= this.MARGIN_TOP + this.HEADER_MARGIN &&
		y <= this.canvasHeight - this.MARGIN_BOTTOM - this.CHORD_HEIGHT - this.CHORDNOTE_MARGIN)
		return this.CURSOR_ZONE_NOTES;
	
	else if (y >= this.canvasHeight - this.MARGIN_BOTTOM - this.CHORD_HEIGHT &&
		y <= this.canvasHeight - this.MARGIN_BOTTOM)
		return this.CURSOR_ZONE_CHORDS;
		
	else
		return this.CURSOR_ZONE_ALL;
}


SongEditor.prototype.getKeyAtTick = function(tick)
{
	for (var b = 0; b < this.viewBlocks.length; b++)
	{
		var block = this.viewBlocks[b];
		
		if (tick >= block.tick && tick < block.tick + block.duration)
		{
			return block.key;
		}
	}
	
	return new SongDataKeyChange(0, theory.scales[0], 0);
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
	var dragTick = this.getTickAtPosition(dragPosition.x);
	var pitchOffset = Math.round((this.mouseDragOrigin.y - dragPosition.y) / this.NOTE_HEIGHT * 2);
	var tickOffset = dragTick - this.getTickAtPosition(this.mouseDragOrigin.x);
	
	if (this.mouseDragAction == "move")
	{
		return {
			tick: Math.max(0, note.tick + tickOffset),
			duration: note.duration,
			pitch: Math.max(theory.getMinPitch(), Math.min(theory.getMaxPitch(), note.pitch + pitchOffset))
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
	var dragTick = this.getTickAtPosition(dragPosition.x);
	var tickOffset = dragTick - this.getTickAtPosition(this.mouseDragOrigin.x);
	
	if (this.mouseDragAction == "move")
	{
		return {
			tick: Math.max(0, chord.tick + tickOffset),
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
	var tickOffset = this.getTickAtPosition(dragPosition.x) - this.getTickAtPosition(this.mouseDragOrigin.x);
	
	if (this.mouseDragAction == "move")
		return { tick: keyChange.tick + tickOffset };
	
	// TODO: Should move proportionally, like notes.
	else if (this.mouseDragAction == "stretch")
		return { tick: keyChange.tick };
}


SongEditor.prototype.getMeterChangeDragged = function(meterChange, dragPosition)
{
	var tickOffset = this.getTickAtPosition(dragPosition.x) - this.getTickAtPosition(this.mouseDragOrigin.x);
	
	if (this.mouseDragAction == "move")
		return { tick: meterChange.tick + tickOffset };
	
	// TODO: Should move proportionally, like notes.
	else if (this.mouseDragAction == "stretch")
		return { tick: meterChange.tick };
}


SongEditor.prototype.handleMouseMove = function(ev)
{
	ev.preventDefault();
	var mousePos = transformMousePosition(this.canvas, ev);
	
	if (!this.interactionEnabled)
		return;
		
	this.canvas.style.cursor = "default";
	this.mouseDragCurrent = mousePos;
	this.clearHover();
			
	// Check what's under the mouse, if it's not down.
	if (!this.mouseDown)
	{
		for (var b = 0; b < this.viewBlocks.length; b++)
		{
			if (isPointInside(mousePos, this.viewBlocks[b]))
			{	
				// Check for notes.
				for (var n = 0; n < this.viewBlocks[b].notes.length; n++)
				{
					var note = this.viewBlocks[b].notes[n];
					if (isPointInside(mousePos, note))
					{
						this.hoverNote = note.noteIndex;
						
						if (mousePos.x <= note.resizeHandleL + this.NOTE_STRETCH_MARGIN)
						{
							this.canvas.style.cursor = "ew-resize";
							this.hoverStretchL = true;
						}
						else if (mousePos.x >= note.resizeHandleR - this.NOTE_STRETCH_MARGIN)
						{
							this.canvas.style.cursor = "ew-resize";
							this.hoverStretchR = true;
						}
						else
							this.canvas.style.cursor = "pointer";

						break;
					}
				}
				
				// Check for chords.
				if (this.hoverNote < 0)
				{
					for (var n = 0; n < this.viewBlocks[b].chords.length; n++)
					{
						var chord = this.viewBlocks[b].chords[n];
						if (isPointInside(mousePos, chord))
						{
							this.hoverChord = chord.chordIndex;
							
							if (mousePos.x <= chord.resizeHandleL + this.NOTE_STRETCH_MARGIN)
							{
								this.canvas.style.cursor = "ew-resize";
								this.hoverStretchL = true;
							}
							else if (mousePos.x >= chord.resizeHandleR - this.NOTE_STRETCH_MARGIN)
							{
								this.canvas.style.cursor = "ew-resize";
								this.hoverStretchR = true;
							}
							else
								this.canvas.style.cursor = "pointer";

							break;
						}
					}
				}
				
				break;
			}
		}
		
		// Check for key changes.
		if (this.hoverNote < 0 && this.hoverChord < 0)
		{
			for (var n = 0; n < this.viewKeyChanges.length; n++)
			{
				var keyChange = this.viewKeyChanges[n];
				if (isPointInside(mousePos, keyChange))
				{
					this.hoverKeyChange = keyChange.keyChangeIndex;
					this.canvas.style.cursor = "ew-resize";
					break;
				}
			}					
		}
		
		// Check for meter changes.
		if (this.hoverNote < 0 && this.hoverChord < 0 && this.hoverKeyChange < 0)
		{
			for (var n = 0; n < this.viewMeterChanges.length; n++)
			{
				var meterChange = this.viewMeterChanges[n];
				if (isPointInside(mousePos, meterChange))
				{
					this.hoverMeterChange = meterChange.meterChangeIndex;
					this.canvas.style.cursor = "ew-resize";
					break;
				}
			}					
		}
		
		this.refreshCanvas();
	}
	
	else if (this.mouseDragAction == "move")
	{
		this.canvas.style.cursor = "move";
		this.refreshCanvas();
	}
	
	else if (this.mouseDragAction == "stretch")
	{
		this.canvas.style.cursor = "ew-resize";
		this.refreshCanvas();
	}
	
	else if (this.mouseDragAction == "scroll")
	{
		var rowOffset = (mousePos.y - this.mouseDragOrigin.y) / this.NOTE_HEIGHT;
		this.rowAtCenter += rowOffset;
		var rowLimits = this.getFirstAndLastScrollableRows();
		this.rowAtCenter = Math.min(rowLimits.first, Math.max(rowLimits.last, this.rowAtCenter));
		this.mouseDragOrigin.y = mousePos.y;
		
		var xOffset = (this.mouseDragOrigin.x - mousePos.x);
		this.xAtLeft += xOffset;
		this.xAtLeft = Math.max(0, Math.min(this.viewBlocks[this.viewBlocks.length - 1].x2 + this.canvasWidth / 2, this.xAtLeft));
		this.mouseDragOrigin.x = mousePos.x;
		
		this.refreshRepresentation();
		this.refreshCanvas();
	}
}


SongEditor.prototype.handleMouseDown = function(ev)
{
	ev.preventDefault();
	var mousePos = transformMousePosition(this.canvas, ev);
	
	if (!this.interactionEnabled)
		return;
	
	if (!ev.ctrlKey)
		this.unselectAll();
	
	this.mouseDragAction = null;
	this.mouseDragOrigin = mousePos;
	
	this.cursorTick = this.getTickAtPosition(mousePos.x);
	this.cursorZone = this.getZoneAtPosition(mousePos.y);
	this.showCursor = true;
	
	// Start a dragging operation.
	if (this.hoverNote >= 0)
	{
		this.showCursor = false;
		if (!this.noteSelections[this.hoverNote])
			this.selectedObjects++;
		
		this.noteSelections[this.hoverNote] = true;
		this.cursorTick = this.songData.notes[this.hoverNote].tick;
		theory.playNoteSample(this.synth, this.songData.notes[this.hoverNote].pitch);
		
		if (this.hoverStretchR)
		{
			this.mouseDragAction = "stretch";
			this.mouseStretchOriginTick = this.songData.notes[this.hoverNote].tick + this.songData.notes[this.hoverNote].duration;
			this.mouseStretchPivotTick = this.getEarliestSelectedTick();
		}
		else if (this.hoverStretchL)
		{
			this.mouseDragAction = "stretch";
			this.mouseStretchOriginTick = this.songData.notes[this.hoverNote].tick;
			this.mouseStretchPivotTick = this.getLatestSelectedTick();
		}
		else
			this.mouseDragAction = "move";
	}
	else if (this.hoverChord >= 0)
	{
		this.showCursor = false;
		if (!this.chordSelections[this.hoverChord])
			this.selectedObjects++;
		
		this.chordSelections[this.hoverChord] = true;
		this.cursorTick = this.songData.chords[this.hoverChord].tick;
		theory.playChordSample(this.synth, this.songData.chords[this.hoverChord].chord, this.songData.chords[this.hoverChord].rootPitch);
		
		if (this.hoverStretchR)
		{
			this.mouseDragAction = "stretch";
			this.mouseStretchOriginTick = this.songData.chords[this.hoverChord].tick + this.songData.chords[this.hoverChord].duration;
			this.mouseStretchPivotTick = this.getEarliestSelectedTick();
		}
		else if (this.hoverStretchL)
		{
			this.mouseDragAction = "stretch";
			this.mouseStretchOriginTick = this.songData.chords[this.hoverChord].tick;
			this.mouseStretchPivotTick = this.getLatestSelectedTick();
		}
		else
			this.mouseDragAction = "move";
	}
	else if (this.hoverKeyChange >= 0)
	{
		if (!this.keyChangeSelections[this.hoverKeyChange])
			this.selectedObjects++;
		
		this.showCursor = false;
		this.keyChangeSelections[this.hoverKeyChange] = true;
		this.mouseDragAction = "move";
	}
	else if (this.hoverMeterChange >= 0)
	{
		if (!this.meterChangeSelections[this.hoverMeterChange])
			this.selectedObjects++;
		
		this.showCursor = false;
		this.meterChangeSelections[this.hoverMeterChange] = true;
		this.mouseDragAction = "move";
	}
	else
	{
		this.mouseDragAction = "scroll";
		this.clearHover();
	}
	
	this.mouseDown = true;
	this.callOnSelectionChanged();
	this.refreshCanvas();
	this.callOnCursorChanged();
}


SongEditor.prototype.handleMouseUp = function(ev)
{
	ev.preventDefault();
	var mousePos = transformMousePosition(this.canvas, ev);
	
	if (!this.interactionEnabled)
		return;
	
	// Apply dragged modifications.
	if (this.mouseDown && this.mouseDragAction != null && this.mouseDragAction != "scroll")
	{
		// Store modified objects in a local array and
		// remove them from the song data.
		var selectedNotes = [];
		for (var n = this.noteSelections.length - 1; n >= 0; n--)
		{
			if (this.noteSelections[n])
			{
				selectedNotes.push(this.songData.notes[n]);
				this.songData.notes.splice(n, 1);
			}
		}
		
		var selectedChords = [];
		for (var n = this.chordSelections.length - 1; n >= 0; n--)
		{
			if (this.chordSelections[n])
			{
				selectedChords.push(this.songData.chords[n]);
				this.songData.chords.splice(n, 1);
			}
		}
		
		var selectedKeyChanges = [];
		for (var n = this.keyChangeSelections.length - 1; n >= 0; n--)
		{
			if (this.keyChangeSelections[n])
			{
				selectedKeyChanges.push(this.songData.keyChanges[n]);
				this.songData.keyChanges.splice(n, 1);
			}
		}
		
		var selectedMeterChanges = [];
		for (var n = this.meterChangeSelections.length - 1; n >= 0; n--)
		{
			if (this.meterChangeSelections[n])
			{
				selectedMeterChanges.push(this.songData.meterChanges[n]);
				this.songData.meterChanges.splice(n, 1);
			}
		}
		
		// Apply the modification and reinsert objects into the song data.
		var newNotes = [];
		for (var n = 0; n < selectedNotes.length; n++)
		{
			var draggedNote = this.getNoteDragged(selectedNotes[n], mousePos);
			var newNote = new SongDataNote(draggedNote.tick, draggedNote.duration, draggedNote.pitch);
			newNotes.push(newNote);
			this.songData.addNote(newNote);
		}
		
		var newChords = [];
		for (var n = 0; n < selectedChords.length; n++)
		{
			var draggedChord = this.getChordDragged(selectedChords[n], mousePos);
			var newChord = new SongDataChord(draggedChord.tick, draggedChord.duration, selectedChords[n].chord, selectedChords[n].rootPitch);
			newChords.push(newChord);
			this.songData.addChord(newChord);
		}
		
		var newKeyChanges = [];
		for (var n = 0; n < selectedKeyChanges.length; n++)
		{
			var draggedKeyChange = this.getKeyChangeDragged(selectedKeyChanges[n], mousePos);
			var newKeyChange = new SongDataKeyChange(draggedKeyChange.tick, selectedKeyChanges[n].scale, selectedKeyChanges[n].tonicPitch);
			newKeyChanges.push(newKeyChange);
			this.songData.addKeyChange(newKeyChange);
		}
		
		var newMeterChanges = [];
		for (var n = 0; n < selectedMeterChanges.length; n++)
		{
			var draggedMeterChange = this.getMeterChangeDragged(selectedMeterChanges[n], mousePos);
			var newMeterChange = new SongDataMeterChange(draggedMeterChange.tick, selectedMeterChanges[n].numerator, selectedMeterChanges[n].denominator);
			newMeterChanges.push(newMeterChange);
			this.songData.addMeterChange(newMeterChange);
		}
		
		this.clearHover();
		this.refreshRepresentation();
		
		// Find which objects were selected before, and select them again.
		for (var n = 0; n < this.songData.notes.length; n++)
		{
			for (var m = 0; m < newNotes.length; m++)
			{
				if (this.songData.notes[n] == newNotes[m])
				{
					this.selectedObjects++;
					this.noteSelections[n] = true;
				}
			}
		}
		
		for (var n = 0; n < this.songData.chords.length; n++)
		{
			for (var m = 0; m < newChords.length; m++)
			{
				if (this.songData.chords[n] == newChords[m])
				{
					this.selectedObjects++;
					this.chordSelections[n] = true;
				}
			}
		}
		
		for (var n = 0; n < this.songData.keyChanges.length; n++)
		{
			for (var m = 0; m < newKeyChanges.length; m++)
			{
				if (this.songData.keyChanges[n] == newKeyChanges[m])
				{
					this.selectedObjects++;
					this.keyChangeSelections[n] = true;
				}
			}
		}
		
		for (var n = 0; n < this.songData.meterChanges.length; n++)
		{
			for (var m = 0; m < newMeterChanges.length; m++)
			{
				if (this.songData.meterChanges[n] == newMeterChanges[m])
				{
					this.selectedObjects++;
					this.meterChangeSelections[n] = true;
				}
			}
		}
	}
	
	this.mouseDown = false;
	this.mouseDragAction = null;
	this.refreshCanvas();
}


SongEditor.prototype.handleKeyDown = function(ev)
{
	if (!this.interactionEnabled)
		return;
	
	var keyCode = (ev.key || ev.which || ev.keyCode);
	
	if (keyCode == 46 || (keyCode == 8 && this.selectedObjects > 0)) // Delete/Backspace
	{
		ev.preventDefault();
		
		// Remove selected objects from the song data.
		var selectedNotes = [];
		for (var n = this.noteSelections.length - 1; n >= 0; n--)
		{
			if (this.noteSelections[n])
			{
				selectedNotes.push(this.songData.notes[n]);
				this.songData.notes.splice(n, 1);
			}
		}
		
		var selectedChords = [];
		for (var n = this.chordSelections.length - 1; n >= 0; n--)
		{
			if (this.chordSelections[n])
			{
				selectedChords.push(this.songData.chords[n]);
				this.songData.chords.splice(n, 1);
			}
		}
		
		var selectedKeyChanges = [];
		for (var n = this.keyChangeSelections.length - 1; n >= 0; n--)
		{
			if (this.keyChangeSelections[n])
			{
				selectedKeyChanges.push(this.songData.keyChanges[n]);
				this.songData.keyChanges.splice(n, 1);
			}
		}
		
		var selectedMeterChanges = [];
		for (var n = this.meterChangeSelections.length - 1; n >= 0; n--)
		{
			if (this.meterChangeSelections[n])
			{
				selectedMeterChanges.push(this.songData.meterChanges[n]);
				this.songData.meterChanges.splice(n, 1);
			}
		}
		
		this.showCursor = true;
		this.clearHover();
		this.refreshRepresentation();
		this.refreshCanvas();
		this.callOnSelectionChanged();
	}
	
	else if (keyCode == 8 && this.selectedObjects == 0) // Backspace
	{
		ev.preventDefault();
		
		var lastTickToConsider = 0;
		var considerNotes = (this.cursorZone == this.CURSOR_ZONE_ALL || this.cursorZone == this.CURSOR_ZONE_NOTES);
		var considerChords = (this.cursorZone == this.CURSOR_ZONE_ALL || this.cursorZone == this.CURSOR_ZONE_CHORDS);
		
		if (considerNotes)
		{
			for (var i = 0; i < this.songData.notes.length; i++)
			{
				var note = this.songData.notes[i];
				if (note.tick + note.duration > lastTickToConsider)
					lastTickToConsider = Math.min(note.tick + note.duration, this.cursorTick);
			}
		}
		
		if (considerChords)
		{
			for (var i = 0; i < this.songData.chords.length; i++)
			{
				var chord = this.songData.chords[i];
				if (chord.tick + chord.duration > lastTickToConsider)
					lastTickToConsider = Math.min(chord.tick + chord.duration, this.cursorTick);
			}
		}
		
		if (lastTickToConsider != this.cursorTick)
		{
			this.cursorTick = Math.max(0, lastTickToConsider);
		
			this.clearHover();
			this.refreshCanvas();
			this.callOnCursorChanged();
			return;
		}
		
		var deleteBeginTick = 0;
		
		if (considerNotes)
		{
			for (var i = 0; i < this.songData.notes.length; i++)
			{
				var note = this.songData.notes[i];
				if (note.tick + note.duration > lastTickToConsider)
					continue;
				
				if (note.tick + note.duration == lastTickToConsider &&
					note.tick > deleteBeginTick)
				{
					deleteBeginTick = note.tick;
				}
				else if (note.tick + note.duration != lastTickToConsider &&
					note.tick + note.duration > deleteBeginTick)
				{
					deleteBeginTick = note.tick + note.duration;
				}
			}
		}
		
		if (considerChords)
		{
			for (var i = 0; i < this.songData.chords.length; i++)
			{
				var chord = this.songData.chords[i];
				if (chord.tick + chord.duration > lastTickToConsider)
					continue;
				
				if (chord.tick + chord.duration == lastTickToConsider &&
					chord.tick > deleteBeginTick)
				{
					deleteBeginTick = chord.tick;
				}
				else if (chord.tick + chord.duration != lastTickToConsider &&
					chord.tick + chord.duration > deleteBeginTick)
				{
					deleteBeginTick = chord.tick + chord.duration;
				}
			}
		}
		
		if (considerNotes)
			this.songData.removeNotesByTickRange(deleteBeginTick, lastTickToConsider, null);
		
		if (considerChords)
			this.songData.removeChordsByTickRange(deleteBeginTick, lastTickToConsider);
		
		this.cursorTick = Math.max(0, deleteBeginTick);
		this.clearHover();
		this.refreshRepresentation();
		this.refreshCanvas();
		this.callOnCursorChanged();
	}
}