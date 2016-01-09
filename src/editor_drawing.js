SongEditor.prototype.refreshCanvas = function()
{
	this.ctx.save();
	
	
	// Clear background.
	this.ctx.fillStyle = "white";
	this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
	
	
	// Draw blocks.
	var CURSOR_COLOR = "#0000ff";
	var BLOCK_BORDER_COLOR = "#000000";
	var BLOCK_MEASURE_COLOR = "#dddddd";
	var BLOCK_MEASURE_COLOR_STRONG = "#888888";
	
	for (var i = 0; i < this.viewBlocks.length; i++)
	{
		var block = this.viewBlocks[i];
		
		// Don't draw bars out of the screen (with margin for between-block note parts).
		if (block.x1 > this.canvasWidth ||
			block.x2 < -this.KEYCHANGE_BAR_WIDTH)
			continue;
		
		var visibleRows = this.getFirstAndLastVisibleRowsForBlock(block);
		var firstVisibleRowY = this.getYForRow(block, visibleRows.first);
		var lastVisibleRowY = this.getYForRow(block, visibleRows.last + 1);
		
		this.ctx.save();
		this.ctx.beginPath();
		
		var clipY1 = Math.max(block.y1, lastVisibleRowY);
		var clipY2 = Math.min(block.y2 - this.CHORD_HEIGHT - this.CHORDNOTE_MARGIN, firstVisibleRowY);
		this.ctx.rect(0, clipY1, this.canvasWidth, clipY2 - clipY1);
		this.ctx.clip();
		
		// Draw rows.
		for (var row = visibleRows.first; row <= visibleRows.last + 1; row++)
		{
			this.ctx.strokeStyle = (theory.getPitchForRow(row, block.key.scale, block.key.tonicPitch) % 12 == block.key.tonicPitch ? BLOCK_MEASURE_COLOR_STRONG : BLOCK_MEASURE_COLOR);
			this.ctx.lineWidth = 2;
			this.ctx.beginPath();
			this.ctx.moveTo(block.x1, this.getYForRow(block, row));
			this.ctx.lineTo(block.x2, this.getYForRow(block, row));
			this.ctx.stroke();
		}
		
		// Draw note measures.
		var submeasureCount = 0;
		for (var n = block.meter.tick - block.tick; n < block.duration; n += this.WHOLE_NOTE_DURATION / block.meter.denominator)
		{
			if (n >= 0)
			{
				this.ctx.strokeStyle = (submeasureCount == 0 ? BLOCK_MEASURE_COLOR_STRONG : BLOCK_MEASURE_COLOR);
				this.ctx.lineWidth = 2;
				this.ctx.beginPath();
				this.ctx.moveTo(block.x1 + n * this.tickZoom, block.y1);
				this.ctx.lineTo(block.x1 + n * this.tickZoom, block.y2 - this.CHORD_HEIGHT - this.CHORDNOTE_MARGIN);
				this.ctx.stroke();
			}
			
			submeasureCount = (submeasureCount + 1) % block.meter.numerator;
		}
		
		// Draw notes.
		for (var n = 0; n < block.notes.length; n++)
		{
			var noteIndex = block.notes[n].noteIndex;
			var note = this.songData.notes[noteIndex];
			
			if (!this.noteSelections[noteIndex] || this.mouseDragAction == null || this.mouseDragAction == "scroll")
				this.drawNote(i, note.pitch, note.tick, note.duration, noteIndex == this.hoverNote, this.noteSelections[noteIndex]);
		}
		
		if (this.mouseDragAction != null && this.mouseDragAction != "scroll")
		{
			for (var n = 0; n < this.songData.notes.length; n++)
			{
				var note = this.songData.notes[n];
				if (this.noteSelections[n])
				{
					var draggedNote = this.getNoteDragged(note, this.mouseDragCurrent);
					this.drawNote(i, draggedNote.pitch, draggedNote.tick, draggedNote.duration, noteIndex == this.hoverNote, true);
				}
			}
		}
		
		this.ctx.restore();
		
		// Draw chord measures.
		var submeasureCount = 0;
		for (var n = block.meter.tick - block.tick; n < block.duration; n += this.WHOLE_NOTE_DURATION / block.meter.denominator)
		{
			if (n >= 0)
			{
				this.ctx.strokeStyle = (submeasureCount == 0 ? BLOCK_MEASURE_COLOR_STRONG : BLOCK_MEASURE_COLOR);
				this.ctx.lineWidth = 2;
				this.ctx.beginPath();
				this.ctx.moveTo(block.x1 + n * this.tickZoom, block.y2 - this.CHORD_HEIGHT);
				this.ctx.lineTo(block.x1 + n * this.tickZoom, block.y2);
				this.ctx.stroke();
			}
			
			submeasureCount = (submeasureCount + 1) % block.meter.numerator;
		}
		
		// Draw chords.
		for (var n = 0; n < block.chords.length; n++)
		{
			var chordIndex = block.chords[n].chordIndex;
			var chord = this.songData.chords[chordIndex];
			
			if (!this.chordSelections[chordIndex] || this.mouseDragAction == null || this.mouseDragAction == "scroll")
				this.drawChord(i, chord, chord.tick, chord.duration, chordIndex == this.hoverChord, this.chordSelections[chordIndex]);
		}
		
		if (this.mouseDragAction != null && this.mouseDragAction != "scroll")
		{
			for (var n = 0; n < this.songData.chords.length; n++)
			{
				var chord = this.songData.chords[n];
				if (this.chordSelections[n])
				{
					var draggedChord = this.getChordDragged(chord, this.mouseDragCurrent);
					this.drawChord(i, chord, draggedChord.tick, draggedChord.duration, chordIndex == this.hoverChord, true);
				}
			}
		}
		
		// Draw borders.
		this.ctx.strokeStyle = BLOCK_BORDER_COLOR;
		this.ctx.lineWidth = 2;
		
		this.ctx.strokeRect(block.x1, block.y1, block.x2 - block.x1, block.y2 - this.CHORD_HEIGHT - this.CHORDNOTE_MARGIN - block.y1);
		this.ctx.strokeRect(block.x1, block.y2 - this.CHORD_HEIGHT, block.x2 - block.x1, this.CHORD_HEIGHT);
		
		// Draw cursor.
		if (this.showCursor && this.cursorTick >= block.tick && this.cursorTick < block.tick + block.duration)
		{
			this.ctx.strokeStyle = CURSOR_COLOR;
			this.ctx.fillStyle = CURSOR_COLOR;
			this.ctx.lineWidth = 2;
			
			var cursorX = block.x1 + (this.cursorTick - block.tick) * this.tickZoom;
			var cursorY1 = block.y1;
			var cursorY2 = block.y2;
			
			if (this.cursorZone == this.CURSOR_ZONE_NOTES)
				cursorY2 = block.y2 - this.CHORD_HEIGHT - this.CHORDNOTE_MARGIN;
			
			else if (this.cursorZone == this.CURSOR_ZONE_CHORDS)
				cursorY1 = block.y2 - this.CHORD_HEIGHT;
			
			this.ctx.beginPath();
			this.ctx.moveTo(cursorX, cursorY1);
			this.ctx.lineTo(cursorX, cursorY2);
			this.ctx.stroke();
			
			this.ctx.beginPath();
			this.ctx.moveTo(cursorX, cursorY1);
			this.ctx.lineTo(cursorX - 6, cursorY1 - 6);
			this.ctx.lineTo(cursorX + 6, cursorY1 - 6);
			this.ctx.lineTo(cursorX, cursorY1);
			this.ctx.fill();
			
			this.ctx.beginPath();
			this.ctx.moveTo(cursorX, cursorY2);
			this.ctx.lineTo(cursorX - 6, cursorY2 + 6);
			this.ctx.lineTo(cursorX + 6, cursorY2 + 6);
			this.ctx.lineTo(cursorX, cursorY2);
			this.ctx.fill();
		}
	}
	
	
	// Draw key changes.
	this.ctx.font = "14px Tahoma";
	this.ctx.textAlign = "left";
	this.ctx.textBaseline = "top";
	
	var KEY_BORDER_COLOR = "#aaaaaa";
	var KEY_BORDER_COLOR_H = "#cccccc";
	var KEY_FILL_COLOR_SEL = "#eeeeee";
	var KEY_PITCH_COLOR = "#444444";
	
	for (var i = 0; i < this.viewKeyChanges.length; i++)
	{
		var keyChange = this.viewKeyChanges[i];
		
		if (this.keyChangeSelections[i])
		{
			if (this.mouseDragAction != null)
			{
				var draggedKeyChange = this.getKeyChangeDragged(keyChange, this.mouseDragCurrent);
				
				// Draw dragging-but-not-moved.
				if (draggedKeyChange.tick == keyChange.tick)
				{
					this.ctx.fillStyle = KEY_FILL_COLOR_SEL;
					this.ctx.fillRect(keyChange.x1, keyChange.y1, keyChange.x2 - keyChange.x1, keyChange.y2 - keyChange.y1);
					this.ctx.strokeStyle = KEY_BORDER_COLOR;
					this.ctx.lineWidth = 2;
					this.ctx.strokeRect(keyChange.x1, keyChange.y1, keyChange.x2 - keyChange.x1, keyChange.y2 - keyChange.y1);
				}
				// Draw dragging.
				else
				{
					var x = this.getPositionForTick(draggedKeyChange.tick);
					this.ctx.strokeStyle = KEY_BORDER_COLOR;
					this.ctx.lineWidth = 2;
					this.ctx.beginPath();
					this.ctx.moveTo(x, keyChange.y1);
					this.ctx.lineTo(x, keyChange.y2);
					this.ctx.stroke();
				}
			}
			// Draw selected.
			else
			{
				this.ctx.fillStyle = KEY_FILL_COLOR_SEL;
				this.ctx.fillRect(keyChange.x1, keyChange.y1, keyChange.x2 - keyChange.x1, keyChange.y2 - keyChange.y1);
				this.ctx.strokeStyle = KEY_BORDER_COLOR;
				this.ctx.lineWidth = 2;
				this.ctx.strokeRect(keyChange.x1, keyChange.y1, keyChange.x2 - keyChange.x1, keyChange.y2 - keyChange.y1);
			}
		}
		// Draw idle/hover.
		else
		{
			this.ctx.strokeStyle = (this.hoverKeyChange == i ? KEY_BORDER_COLOR_H : KEY_BORDER_COLOR);
			this.ctx.lineWidth = 2;
			this.ctx.strokeRect(keyChange.x1, keyChange.y1, keyChange.x2 - keyChange.x1, keyChange.y2 - keyChange.y1);
		}
		
		// Draw key name.
		var textX = keyChange.x2 + 8;
		this.ctx.font = "14px Tahoma";
		var songKeyChange = this.songData.keyChanges[keyChange.keyChangeIndex];
		this.ctx.fillStyle = KEY_BORDER_COLOR;
		this.ctx.fillText(
			"" + theory.getNameForPitch(songKeyChange.tonicPitch, songKeyChange.scale, songKeyChange.tonicPitch) + " " + songKeyChange.scale.name,
			textX,
			keyChange.y1,
			this.viewBlocks[keyChange.blockIndex].x2 - keyChange.x1 - 32);
			
		// Draw pitches.
		this.ctx.font = "10px Tahoma";
		
		var visibleRows = this.getFirstAndLastVisibleRowsForBlock(block);
		for (var row = visibleRows.first; row <= visibleRows.last; row++)
		{
			var pitch = theory.getPitchForRow(row, songKeyChange.scale, songKeyChange.tonicPitch);
			var y = this.getYForRow(this.viewBlocks[keyChange.blockIndex], row + 1);
			
			this.ctx.fillStyle = KEY_PITCH_COLOR;
			this.ctx.fillText(
				"" + theory.getNameForPitch(pitch, songKeyChange.scale, songKeyChange.tonicPitch),
				keyChange.x1 + 4,
				y);
				
			this.ctx.fillText(
				"" + theory.getOctaveForPitch(pitch),
				keyChange.x1 + 18,
				y);
		}
	}
	
	
	// Draw meter changes.
	this.ctx.font = "14px Tahoma";
	this.ctx.textAlign = "left";
	
	var METER_BORDER_COLOR = "#88aaaa";
	var METER_BORDER_COLOR_HOVER = "#bbdddd";
	var METER_FILL_COLOR_SEL = "#bbdddd";
	
	for (var i = 0; i < this.viewMeterChanges.length; i++)
	{
		var meterChange = this.viewMeterChanges[i];
		
		if (this.meterChangeSelections[i])
		{
			if (this.mouseDragAction != null)
			{
				var draggedMeterChange = this.getMeterChangeDragged(meterChange, this.mouseDragCurrent);
				
				// Draw dragging-but-not-moved.
				if (draggedMeterChange.tick == meterChange.tick)
				{
					this.ctx.fillStyle = METER_FILL_COLOR_SEL;
					this.ctx.fillRect(meterChange.x1, meterChange.y1, meterChange.x2 - meterChange.x1, meterChange.y2 - meterChange.y1);
					this.ctx.strokeStyle = METER_BORDER_COLOR;
					this.ctx.lineWidth = 2;
					this.ctx.strokeRect(meterChange.x1, meterChange.y1, meterChange.x2 - meterChange.x1, meterChange.y2 - meterChange.y1);
				}
				// Draw dragging.
				else
				{
					var x = this.getPositionForTick(draggedMeterChange.tick);
					this.ctx.strokeStyle = METER_BORDER_COLOR;
					this.ctx.lineWidth = 2;
					this.ctx.beginPath();
					this.ctx.moveTo(x, meterChange.y1);
					this.ctx.lineTo(x, meterChange.y2);
					this.ctx.stroke();
				}
			}
			// Draw selected.
			else
			{
				this.ctx.fillStyle = METER_FILL_COLOR_SEL;
				this.ctx.fillRect(meterChange.x1, meterChange.y1, meterChange.x2 - meterChange.x1, meterChange.y2 - meterChange.y1);
				this.ctx.strokeStyle = METER_BORDER_COLOR;
				this.ctx.lineWidth = 2;
				this.ctx.strokeRect(meterChange.x1, meterChange.y1, meterChange.x2 - meterChange.x1, meterChange.y2 - meterChange.y1);
			}
		}
		// Draw idle/hover.
		else
		{
			this.ctx.strokeStyle = (this.hoverMeterChange == i ? METER_BORDER_COLOR_HOVER : METER_BORDER_COLOR);
			this.ctx.lineWidth = 2;
			this.ctx.strokeRect(meterChange.x1, meterChange.y1, meterChange.x2 - meterChange.x1, meterChange.y2 - meterChange.y1);
		}
		
		// Draw numbers.
		var textX = meterChange.x2 + 8;
		var songMeterChange = this.songData.meterChanges[meterChange.meterChangeIndex];
		this.ctx.fillStyle = METER_BORDER_COLOR;
		this.ctx.fillText(
			"" + songMeterChange.numerator + " / " + songMeterChange.denominator,
			textX,
			meterChange.y1,
			this.viewBlocks[meterChange.blockIndex].x2 - meterChange.x1 - 16);
	}
	
	
	// Draw side fade-outs.
	var leftFadeGradient = this.ctx.createLinearGradient(0, 0, this.MARGIN_LEFT, 0);
	leftFadeGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
	leftFadeGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
	this.ctx.fillStyle = leftFadeGradient;
	this.ctx.fillRect(0, 0, this.MARGIN_LEFT, this.canvasHeight);
	
	var rightFadeGradient = this.ctx.createLinearGradient(this.canvasWidth - this.MARGIN_RIGHT, 0, this.canvasWidth, 0);
	rightFadeGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
	rightFadeGradient.addColorStop(1, "rgba(255, 255, 255, 1)");
	this.ctx.fillStyle = rightFadeGradient;
	this.ctx.fillRect(this.canvasWidth - this.MARGIN_RIGHT, 0, this.MARGIN_RIGHT, this.canvasHeight);
	
	
	this.ctx.restore();
}


SongEditor.prototype.drawNote = function(blockIndex, pitch, tick, duration, hovering, selected)
{
	var block = this.viewBlocks[blockIndex];
	
	// Check if the note is inside the block.
	if (tick + duration <= block.tick ||
		tick >= block.tick + block.duration)
		return;
		
	var scrollY = -this.rowAtCenter * this.NOTE_HEIGHT;
	
	var deg = theory.getDegreeForPitch(pitch, block.key.scale, block.key.tonicPitch);
	var row = theory.getRowForPitch(pitch, block.key.scale, block.key.tonicPitch);
	var pos = this.getNotePosition(block, row, tick, duration);
	
	this.drawDegreeColoredRectangle(deg, pos);
	
	// Draw highlights.
	this.ctx.save();
	
	if (selected)
	{
		this.ctx.globalAlpha = 0.3;
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, pos.y2 - pos.y1);
		this.ctx.fillRect(pos.x1, pos.y1 + 3, pos.x2 - pos.x1, pos.y2 - pos.y1 - 6);
	}
	else if (hovering)
	{
		this.ctx.globalAlpha = 0.3;
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, pos.y2 - pos.y1);
	}
	
	this.ctx.restore();
	
	// Draw possibly-bent part between blocks.
	if (tick + duration > block.tick + block.duration && blockIndex < this.viewBlocks.length - 1)
	{
		var nextBlock = this.viewBlocks[blockIndex + 1];
		var nextRow = theory.getRowForPitch(pitch, nextBlock.key.scale, nextBlock.key.tonicPitch);
		var nextPos = this.getNotePosition(block, nextRow, tick, duration);
		
		var col = theory.getColorForDegree(deg - (deg % 1));
		
		this.ctx.save();
		this.ctx.globalAlpha = 0.5;
		this.ctx.fillStyle = col;
		this.ctx.beginPath();
		this.ctx.moveTo(block.x2, pos.y1);
		this.ctx.lineTo(nextBlock.x1, nextPos.y1);
		this.ctx.lineTo(nextBlock.x1, nextPos.y2);
		this.ctx.lineTo(block.x2, pos.y2);
		this.ctx.fill();
		this.ctx.restore();
	}
}


SongEditor.prototype.drawChord = function(blockIndex, chord, tick, duration, hovering, selected)
{
	var block = this.viewBlocks[blockIndex];
	
	// Check if the note is inside the block.
	if (tick + duration <= block.tick ||
		tick >= block.tick + block.duration)
		return;
	
	var deg = theory.getDegreeForPitch(chord.rootPitch, block.key.scale, block.key.tonicPitch);
	var pos = this.getChordPosition(block, tick, duration);
	
	this.drawDegreeColoredRectangle(deg, { x1: pos.x1, y1: pos.y1, x2: pos.x2, y2: pos.y1 + this.CHORD_ORNAMENT_HEIGHT });
	this.drawDegreeColoredRectangle(deg, { x1: pos.x1, y1: pos.y2 - this.CHORD_ORNAMENT_HEIGHT, x2: pos.x2, y2: pos.y2 });
	
	// Draw roman symbol.
	var numeral = theory.getRomanNumeralForPitch(chord.rootPitch, block.key.scale, block.key.tonicPitch);
	var romanText = chord.chord.roman.replace("X", numeral).replace("x", numeral.toLowerCase());
	
	this.ctx.fillStyle = "#000000";
	this.ctx.textAlign = "center";
	this.ctx.textBaseline = "middle";
	
	this.ctx.font = "20px Tahoma";
	var supTextWidth = this.ctx.measureText(chord.chord.romanSup).width;
	var subTextWidth = this.ctx.measureText(chord.chord.romanSub).width;
	
	this.ctx.font = "30px Tahoma";
	var mainTextWidth = this.ctx.measureText(romanText).width;
	var totalTextWidth = mainTextWidth + supTextWidth + subTextWidth;
	
	var maxTextWidth = pos.x2 - pos.x1 - 2;
	if (totalTextWidth > maxTextWidth)
	{
		var proportion = totalTextWidth / maxTextWidth;
		supTextWidth /= proportion;
		subTextWidth /= proportion;
		mainTextWidth /= proportion;
		totalTextWidth = mainTextWidth + supTextWidth + subTextWidth;
	}
	
	this.ctx.fillText(romanText, (pos.x1 + pos.x2) / 2 - totalTextWidth / 2 + mainTextWidth / 2, (pos.y1 + pos.y2) / 2, maxTextWidth - supTextWidth - subTextWidth);
	
	this.ctx.font = "20px Tahoma";
	this.ctx.fillText(chord.chord.romanSup, (pos.x1 + pos.x2) / 2 - totalTextWidth / 2 + mainTextWidth + supTextWidth / 2, (pos.y1 + pos.y2) / 2 - 10, maxTextWidth - mainTextWidth - subTextWidth);
	this.ctx.fillText(chord.chord.romanSub, (pos.x1 + pos.x2) / 2 - totalTextWidth / 2 + mainTextWidth + supTextWidth + subTextWidth / 2, (pos.y1 + pos.y2) / 2 + 10, maxTextWidth - mainTextWidth - supTextWidth);
	
	// Draw highlights.
	this.ctx.save();
	
	if (selected)
	{
		this.ctx.globalAlpha = 0.3;
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, pos.y2 - pos.y1);
		this.ctx.fillRect(pos.x1, pos.y1 + 3, pos.x2 - pos.x1, pos.y2 - pos.y1 - 6);
	}
	else if (hovering)
	{
		this.ctx.globalAlpha = 0.3;
		this.ctx.fillStyle = "#ffffff";
		this.ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, pos.y2 - pos.y1);
	}
	
	this.ctx.restore();
	
	// Draw part between blocks.
	if (tick + duration > block.tick + block.duration && blockIndex < this.viewBlocks.length - 1)
	{
		var nextBlock = this.viewBlocks[blockIndex + 1];
		var col = theory.getColorForDegree(deg - (deg % 1));
		
		this.ctx.save();
		this.ctx.globalAlpha = 0.5;
		this.ctx.fillStyle = col;
		this.drawDegreeColoredRectangle(deg, { x1: block.x2, y1: pos.y1, x2: nextBlock.x1, y2: pos.y1 + this.CHORD_ORNAMENT_HEIGHT } );
		this.drawDegreeColoredRectangle(deg, { x1: block.x2, y1: pos.y2 - this.CHORD_ORNAMENT_HEIGHT, x2: nextBlock.x1, y2: pos.y2 });
		this.ctx.restore();
	}
}


SongEditor.prototype.drawDegreeColoredRectangle = function(deg, pos)
{
	var col = theory.getColorForDegree(deg - (deg % 1));
	
	this.ctx.save();
	this.ctx.beginPath();
	this.ctx.rect(pos.x1, pos.y1, pos.x2 - pos.x1, pos.y2 - pos.y1);
	this.ctx.clip();
	
	this.ctx.fillStyle = col;
	this.ctx.fillRect(pos.x1, pos.y1, pos.x2 - pos.x1, pos.y2 - pos.y1);
	
	// Draw stripes for fractional scale degrees.
	if ((deg % 1) != 0)
	{
		this.ctx.strokeStyle = theory.getColorForDegree((deg - (deg % 1) + 1) % 7);
		this.ctx.lineWidth = 5;
		for (var i = 0; i < pos.x2 - pos.x1 + 30; i += 15)
		{
			this.ctx.beginPath();
			this.ctx.moveTo(pos.x1 + i, pos.y1 - 5);
			this.ctx.lineTo(pos.x1 + i - 20, pos.y1 - 5 + 20);
			this.ctx.stroke();
		}
	}
	
	this.ctx.restore();
}


SongEditor.prototype.getYForRow = function(block, row)
{
	var noteAreaHeight = this.canvasHeight - this.MARGIN_TOP - this.HEADER_MARGIN - this.CHORD_HEIGHT - this.CHORDNOTE_MARGIN;
	return block.y2 - this.CHORD_HEIGHT - this.CHORDNOTE_MARGIN - noteAreaHeight / 2 + (this.rowAtCenter - row) * this.NOTE_HEIGHT;
}


SongEditor.prototype.getFirstAndLastVisibleRowsForBlock = function(block)
{
	var noteAreaHeight = this.canvasHeight - this.MARGIN_TOP - this.HEADER_MARGIN - this.CHORD_HEIGHT - this.CHORDNOTE_MARGIN;
	
	return {
		first: Math.max(Math.floor(this.rowAtCenter - noteAreaHeight / 2 / this.NOTE_HEIGHT), 7 * 3),
		last: Math.min(Math.ceil(this.rowAtCenter + noteAreaHeight / 2 / this.NOTE_HEIGHT), 7 * 8 - 1)
	};
}