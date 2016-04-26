function transformMousePosition(elem, ev)
{
	var rect = elem.getBoundingClientRect();
	return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
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
		var regionIndex = this.getRegionAtPosition(mousePos);
		if (regionIndex != -1)
		{
			var region = this.viewRegions[regionIndex];
			if (isPointInside(mousePos, region.interactBBox))
			{
				// Check for the section knob.
				if (region.sectionKnob)
				{
					var knobPos = this.getSectionKnobPosition(region);
					if (isPointInside(mousePos, knobPos))
					{
						this.canvas.style.cursor = "ew-resize";
						this.hoverSectionKnob = region.section;
					}
				}
				
				// Check for notes.
				if (this.hoverSectionKnob < 0)
				{
					for (var n = 0; n < region.notes.length; n++)
					{
						var note = this.songData.notes[region.notes[n]];
						var noteRow = this.theory.getRowForPitch(note.pitch, region.key.scale, region.key.tonicPitch);
						var notePos = this.getNotePosition(region, noteRow, note.tick, note.duration);
						
						if (isPointInside(mousePos, notePos) && isPointInside(mousePos, region))
						{
							this.hoverNote = region.notes[n];
							
							if (mousePos.x <= notePos.x1 + this.NOTE_STRETCH_MARGIN)
							{
								this.canvas.style.cursor = "ew-resize";
								this.hoverStretchL = true;
							}
							else if (mousePos.x >= notePos.x2 - this.NOTE_STRETCH_MARGIN)
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
				
				// Check for chords.
				if (this.hoverSectionKnob < 0 && this.hoverNote < 0)
				{
					for (var n = 0; n < region.chords.length; n++)
					{
						var chord = this.songData.chords[region.chords[n]];
						var chordPos = this.getChordPosition(region, chord.tick, chord.duration);
						
						if (isPointInside(mousePos, chordPos) && isPointInside(mousePos, region))
						{
							this.hoverChord = region.chords[n];
							
							if (mousePos.x <= chordPos.x1 + this.NOTE_STRETCH_MARGIN)
							{
								this.canvas.style.cursor = "ew-resize";
								this.hoverStretchL = true;
							}
							else if (mousePos.x >= chordPos.x2 - this.NOTE_STRETCH_MARGIN)
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
			}
			
			// Check for key changes.
			if (this.hoverSectionKnob < 0 && this.hoverNote < 0 && this.hoverChord < 0)
			{
				for (var n = 0; n < region.keyChanges.length; n++)
				{
					var keyChange = this.songData.keyChanges[region.keyChanges[n]];
					var keyChangePos = this.getKeyChangePosition(region, keyChange.tick);
					
					if (isPointInside(mousePos, keyChangePos))
					{
						this.hoverKeyChange = region.keyChanges[n];
						this.canvas.style.cursor = "pointer";
						break;
					}
				}					
			}
			
			// Check for meter changes.
			if (this.hoverSectionKnob < 0 && this.hoverNote < 0 && this.hoverChord < 0 && this.hoverKeyChange < 0)
			{
				for (var n = 0; n < region.meterChanges.length; n++)
				{
					var meterChange = this.songData.meterChanges[region.meterChanges[n]];
					var meterChangePos = this.getMeterChangePosition(region, meterChange.tick);
					
					if (isPointInside(mousePos, meterChangePos))
					{
						this.hoverMeterChange = region.meterChanges[n];
						this.canvas.style.cursor = "pointer";
						break;
					}
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
	
	else if (this.mouseDragAction == "stretch-section")
	{
		this.canvas.style.cursor = "ew-resize";
		this.refreshCanvas();
	}
	
	else if (this.mouseDragAction == "scroll")
	{
		/*var rowOffset = (mousePos.y - this.mouseDragOrigin.y) / this.NOTE_HEIGHT;
		this.rowAtCenter += rowOffset;
		var rowLimits = this.getFirstAndLastScrollableRows();
		this.rowAtCenter = Math.min(rowLimits.first, Math.max(rowLimits.last, this.rowAtCenter));
		this.mouseDragOrigin.y = mousePos.y;
		
		var xOffset = (this.mouseDragOrigin.x - mousePos.x);
		this.xAtLeft += xOffset;
		this.xAtLeft = Math.max(0, Math.min(this.viewBlocks[this.viewBlocks.length - 1].x2 + this.canvasWidth / 2, this.xAtLeft));
		this.mouseDragOrigin.x = mousePos.x;
		
		this.refreshRepresentation();*/
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
	
	this.cursorTick = this.getTickAtPosition(mousePos);
	this.cursorZone = this.getZoneAtPosition(mousePos);
	this.showCursor = true;
	
	// Start a dragging operation.
	if (this.hoverSectionKnob >= 0)
	{
		this.unselectAll();
		this.showCursor = false;
		this.mouseDragAction = "stretch-section";
		this.mouseDraggedSectionKnob = this.hoverSectionKnob;
	}
	else if (this.hoverNote >= 0)
	{
		this.showCursor = false;
		if (!this.noteSelections[this.hoverNote])
			this.selectedObjects++;
		
		this.noteSelections[this.hoverNote] = true;
		this.cursorTick = this.songData.notes[this.hoverNote].tick;
		this.theory.playNoteSample(this.synth, this.songData.notes[this.hoverNote].pitch);
		
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
		this.theory.playChordSample(this.synth, this.songData.chords[this.hoverChord].chord, this.songData.chords[this.hoverChord].rootPitch);
		
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
	
	// Apply dragged section knob.
	if (this.mouseDown && this.mouseDragAction == "stretch-section")
	{
		var regionStretched = null;
		for (var r = 0; r < this.viewRegions.length; r++)
		{
			var region = this.viewRegions[r];
			if (region.section == this.mouseDraggedSectionKnob && region.sectionKnob)
			{
				regionStretched = region;
				break;
			}
		}
		
		var draggedKnobTick = this.getSectionKnobDraggedTick(regionStretched, mousePos);
		
		if (draggedKnobTick > region.tick + region.duration)
		{
			this.songData.insertWhitespace(region.tick + region.duration, draggedKnobTick - region.tick - region.duration);
			this.refreshRepresentation();
		}
		else if (draggedKnobTick < region.tick + region.duration)
		{
			this.songData.remove(draggedKnobTick, region.tick + region.duration - draggedKnobTick);
			this.refreshRepresentation();
		}
	}
	
	// Apply dragged modifications.
	else if (this.mouseDown && this.mouseDragAction != null && this.mouseDragAction != "scroll")
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