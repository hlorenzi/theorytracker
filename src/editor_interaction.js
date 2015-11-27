SongEditor.prototype.unselectAll = function()
{
	for (var i = 0; i < this.noteSelections.length; i++)
		this.noteSelections[i] = false;
	
	for (var i = 0; i < this.keyChangeSelections.length; i++)
		this.keyChangeSelections[i] = false;
	
	for (var i = 0; i < this.meterChangeSelections.length; i++)
		this.meterChangeSelections[i] = false;
}


SongEditor.prototype.clearHover = function()
{
	this.hoverNote = -1;
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
			return Math.round((block.tick + Math.min(block.duration, Math.round((x - block.x1) / this.tickZoom))) / this.tickSnap) * this.tickSnap;
		}
	}
	
	return 0;
}


SongEditor.prototype.getEarliestSelectedTick = function()
{
	// FIXME: Take chords and key/meter changes into consideration.
	// TODO: Use binary search.
	for (var n = 0; n < this.noteSelections.length; n++)
	{
		if (this.noteSelections[n])
			return this.songData.notes[n].tick;
	}
	
	return 0;
}


SongEditor.prototype.getLatestSelectedTick = function()
{
	// FIXME: Take chords and key/meter changes into consideration.
	// TODO: Use binary search.
	for (var n = this.noteSelections.length - 1; n >= 0; n--)
	{
		if (this.noteSelections[n])
			return this.songData.notes[n].tick + this.songData.notes[n].duration;
	}
	
	return 0;
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
			pitch: note.pitch + pitchOffset
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
		
	this.canvas.style.cursor = "default";
	this.mouseDragCurrent = mousePos;
	this.clearHover();
			
	// Check what's under the mouse, if it's not down.
	if (!this.mouseDown)
	{
		// Check for notes.
		for (var b = 0; b < this.viewBlocks.length; b++)
		{
			if (isPointInside(mousePos, this.viewBlocks[b]))
			{	
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
				break;
			}
		}
		
		// Check for key changes.
		if (this.hoverNote < 0)
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
		if (this.hoverNote < 0 && this.hoverKeyChange < 0)
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
	}
	else if (this.mouseDragAction == "move")
		this.canvas.style.cursor = "move";
	else if (this.mouseDragAction == "stretch")
		this.canvas.style.cursor = "ew-resize";
	
	this.refreshCanvas();
}


SongEditor.prototype.handleMouseDown = function(ev)
{
	ev.preventDefault();
	var mousePos = transformMousePosition(this.canvas, ev);
	
	if (!ev.ctrlKey)
		this.unselectAll();
	
	this.mouseDragAction = null;
	this.mouseDragOrigin = mousePos;
	
	// Start a dragging operation.
	if (this.hoverNote >= 0)
	{
		this.noteSelections[this.hoverNote] = true;
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
	else if (this.hoverKeyChange >= 0)
	{
		this.keyChangeSelections[this.hoverKeyChange] = true;
		this.mouseDragAction = "move";
	}
	else if (this.hoverMeterChange >= 0)
	{
		this.meterChangeSelections[this.hoverMeterChange] = true;
		this.mouseDragAction = "move";
	}
	
	this.mouseDown = true;
	this.refreshCanvas();
}


SongEditor.prototype.handleMouseUp = function(ev)
{
	ev.preventDefault();
	var mousePos = transformMousePosition(this.canvas, ev);
	
	// Apply dragged modifications.
	if (this.mouseDown && this.mouseDragAction != null)
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
					this.noteSelections[n] = true;
			}
		}
		
		for (var n = 0; n < this.songData.keyChanges.length; n++)
		{
			for (var m = 0; m < newKeyChanges.length; m++)
			{
				if (this.songData.keyChanges[n] == newKeyChanges[m])
					this.keyChangeSelections[n] = true;
			}
		}
		
		for (var n = 0; n < this.songData.meterChanges.length; n++)
		{
			for (var m = 0; m < newMeterChanges.length; m++)
			{
				if (this.songData.meterChanges[n] == newMeterChanges[m])
					this.meterChangeSelections[n] = true;
			}
		}
	}
	
	this.mouseDown = false;
	this.mouseDragAction = null;
	this.refreshCanvas();
}