// Sets up representation objects for the data in the song,
// which are used to draw the staff and to interact with the mouse.
SongEditor.prototype.refreshRepresentation = function()
{
	this.viewBlocks = [];
	this.viewNotes = [];
	this.viewChords = [];
	this.viewKeyChanges = [];
	this.viewMeterChanges = [];
	
	this.noteSelections = [];
	for (var i = 0; i < this.songData.notes.length; i++)
		this.noteSelections.push(false);
	
	this.keyChangeSelections = [];
	for (var i = 0; i < this.songData.keyChanges.length; i++)
		this.keyChangeSelections.push(false);
	
	this.meterChangeSelections = [];
	for (var i = 0; i < this.songData.meterChanges.length; i++)
		this.meterChangeSelections.push(false);
	
	var blockY1 = this.MARGIN_TOP + this.HEADER_MARGIN;
	var blockY2 = this.canvasHeight - this.MARGIN_BOTTOM - this.CHORD_HEIGHT - this.CHORDNOTE_MARGIN;
	var changeY1 = this.MARGIN_TOP;
	var chordY2 = this.canvasHeight - this.MARGIN_BOTTOM;
	
	var x = this.MARGIN_LEFT;
	var tick = 0;
	var curNote = 0;
	var curChord = 0;
	var curKeyChange = 0;
	var curMeterChange = 0;
	
	var curBlock = 0;
	this.viewBlocks.push(
	{
		tick: 0,
		duration: 0,
		key: new SongDataKeyChange(0, theory.scales[0], 0),
		meter: new SongDataMeterChange(0, 4, 4),
		notes: [],
		x1: x,
		y1: blockY1,
		x2: x,
		y2: blockY2
	});
	
	var NEXT_IS_NONE = 0;
	var NEXT_IS_KEYCHANGE = 1;
	var NEXT_IS_METERCHANGE = 2;
	
	while (true)
	{
		// Find the tick where the current block ends.
		var nextChangeTick = this.songData.lastTick;
		var nextIsWhat = NEXT_IS_NONE;
		
		if (curKeyChange < this.songData.keyChanges.length)
		{
			var nextKeyChange = this.songData.keyChanges[curKeyChange]
			if (nextKeyChange.tick < nextChangeTick)
			{
				nextChangeTick = nextKeyChange.tick;
				nextIsWhat = NEXT_IS_KEYCHANGE;
			}
		}
		
		if (curMeterChange < this.songData.meterChanges.length)
		{
			var nextMeterChange = this.songData.meterChanges[curMeterChange]
			if (nextMeterChange.tick < nextChangeTick)
			{
				nextChangeTick = nextMeterChange.tick;
				nextIsWhat = NEXT_IS_METERCHANGE;
			}
		}
		
		// Advance draw position until the next tick.
		x += (nextChangeTick - tick) * this.tickZoom;
		tick = nextChangeTick;
		
		// If there is a key change, add its visualization and advance its iterator.
		var blockX2 = x;
		
		if (nextIsWhat == NEXT_IS_KEYCHANGE)
		{
			x += this.KEYCHANGE_BAR_WIDTH;
			
			this.viewKeyChanges.push(
			{
				keyChangeIndex: curKeyChange,
				tick: nextChangeTick,
				x1: blockX2,
				y1: changeY1,
				x2: x,
				y2: chordY2
			});
			
			curKeyChange++;
		}
		// Or if there is a meter change, add its visualization and advance its iterator.
		else if (nextIsWhat == NEXT_IS_METERCHANGE)
		{
			x += this.METERCHANGE_BAR_WIDTH;
			
			this.viewMeterChanges.push(
			{
				meterChangeIndex: curMeterChange,
				tick: nextChangeTick,
				x1: blockX2,
				y1: changeY1 + 20,
				x2: x,
				y2: chordY2
			});
			
			curMeterChange++;
		}
		
		// Then finish off the current block of notes.
		// If its duration would be zero, ignore it for now but prepare it for the next iteration.  
		var block = this.viewBlocks[curBlock];
		
		if (nextChangeTick == block.tick)
		{
			block.x1 = x;
			block.x2 = x;
		}
		else
		{
			block.duration = nextChangeTick - block.tick;
			block.x2 = blockX2;
			
			// Add notes' representations.
			for (var n = 0; n < this.songData.notes.length; n++)
			{
				var note = this.songData.notes[n];
				var noteRow = theory.getRowForPitch(note.pitch, block.key);
				var notePos = this.getNotePosition(block, noteRow, note.tick, note.duration);
				block.notes.push(
				{
					noteIndex: n,
					tick: note.tick,
					duration: note.duration,
					resizeHandleL: notePos.resizeHandleL,
					resizeHandleR: notePos.resizeHandleR,
					x1: notePos.x1,
					y1: notePos.y1,
					x2: notePos.x2,
					y2: notePos.y2
				});
			}
			
			// If this is the final block, we can stop now.
			if (nextIsWhat == NEXT_IS_NONE)
				break;
			
			// Or else, add a new block for the next iteration.
			this.viewBlocks.push(
			{
				tick: tick,
				duration: 0,
				key: block.key,
				meter: block.meter,
				notes: [],
				x1: x,
				y1: blockY1,
				x2: x,
				y2: blockY2
			});
			
			curBlock++;
		}
		
		// Apply key/meter changes to the next block.
		if (nextIsWhat == NEXT_IS_KEYCHANGE)
			this.viewBlocks[curBlock].key = this.songData.keyChanges[curKeyChange - 1];
		else if (nextIsWhat == NEXT_IS_METERCHANGE)
			this.viewBlocks[curBlock].meter = this.songData.meterChanges[curMeterChange - 1];
	}
}


// Returns the bounds of the given row's note's representation rectangle.
SongEditor.prototype.getNotePosition = function(block, row, tick, duration)
{
	var blockTick = tick - block.tick;
	return {
		resizeHandleL: block.x1 + blockTick * this.tickZoom,
		resizeHandleR: block.x1 + (blockTick + duration) * this.tickZoom,
		x1: block.x1 + Math.max(0, (blockTick * this.tickZoom) + this.NOTE_MARGIN_HOR),
		x2: block.x1 + Math.min(block.x2 - block.x1, (blockTick + duration) * this.tickZoom - this.NOTE_MARGIN_HOR),
		y1: block.y2 - (row + 1) * this.NOTE_HEIGHT + this.NOTE_MARGIN_VER,
		y2: block.y2 - (row) * this.NOTE_HEIGHT - this.NOTE_MARGIN_VER,
	};
}