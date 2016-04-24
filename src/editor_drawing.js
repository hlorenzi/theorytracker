SongEditor.prototype.refreshCanvas = function()
{
	this.ctx.save();
	
	
	// Clear background.
	this.ctx.fillStyle = "white";
	this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
	
	
	// Draw blocks.
	var CURSOR_COLOR = "#0000ff";
	var SECTION_BORDER_COLOR = "#000000";
	var NOTE_LINE_COLOR = "#dddddd";
	var MEASURE_COLOR = "#dddddd";
	var MEASURE_COLOR_STRONG = "#888888";
	var KEY_CHANGE_COLOR = "#aaaaaa";
	var METER_CHANGE_COLOR = "#88aaaa";
	
	this.ctx.save();
	this.ctx.beginPath();
	
	for (var r = 0; r < this.viewRegions.length; r++)
	{
		var region = this.viewRegions[r];
		
		// Draw region boundaries.
		this.ctx.strokeStyle = SECTION_BORDER_COLOR;
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();
		
			this.ctx.strokeRect(
				region.x1,
				region.y1 + this.HEADER_HEIGHT,
				region.x2 - region.x1,
				(region.y2 - this.CHORD_HEIGHT - this.CHORD_NOTE_SEPARATION) - (region.y1 + this.HEADER_HEIGHT));
			
			this.ctx.strokeRect(
				region.x1,
				region.y2 - this.CHORD_HEIGHT,
				region.x2 - region.x1,
				this.CHORD_HEIGHT);
			
		this.ctx.stroke();
		
		// Draw note lines.
		this.ctx.strokeStyle = NOTE_LINE_COLOR;
		this.ctx.beginPath();
		for (var n = 1; n < region.highestNoteRow - region.lowestNoteRow; n++)
		{
			var y = region.y2 - this.CHORD_HEIGHT - this.CHORD_NOTE_SEPARATION - n * this.NOTE_HEIGHT;
			this.ctx.moveTo(region.x1, y);
			this.ctx.lineTo(region.x2, y);
		}
		this.ctx.stroke();
	
		// Draw beat lines.
		var beatCount = 0;
		for (var n = region.meter.tick - region.tick; n < region.duration; n += this.songData.ticksPerWholeNote / region.meter.denominator)
		{
			if (n != 0)
			{
				this.ctx.strokeStyle = (beatCount == 0 ? MEASURE_COLOR_STRONG : MEASURE_COLOR);
				this.ctx.beginPath();
					this.ctx.moveTo(
						region.x1 + n * this.tickZoom,
						region.y1 + this.HEADER_HEIGHT);
					this.ctx.lineTo(
						region.x1 + n * this.tickZoom,
						region.y2 - this.CHORD_HEIGHT - this.CHORD_NOTE_SEPARATION);
					this.ctx.moveTo(
						region.x1 + n * this.tickZoom,
						region.y2 - this.CHORD_HEIGHT);
					this.ctx.lineTo(
						region.x1 + n * this.tickZoom,
						region.y2);
				this.ctx.stroke();
			}
			
			beatCount = (beatCount + 1) % region.meter.numerator;
		}
		
		// Draw notes.
		for (var n = 0; n < region.notes.length; n++)
		{
			var noteIndex = region.notes[n];
			var note = this.songData.notes[noteIndex];
			
			if (!this.noteSelections[noteIndex] || this.mouseDragAction == null || this.mouseDragAction == "scroll")
				this.drawNote(region, note.pitch, note.tick, note.duration, noteIndex == this.hoverNote, this.noteSelections[noteIndex]);
		}
		
		// Draw dragged notes.
		if (this.mouseDragAction != null && this.mouseDragAction != "scroll")
		{
			for (var n = 0; n < this.songData.notes.length; n++)
			{
				if (!this.noteSelections[n])
					continue;
				
				var note = this.songData.notes[n];
				var noteDragged = this.getNoteDragged(note, this.mouseDragCurrent);
				this.drawNote(region, noteDragged.pitch, noteDragged.tick, noteDragged.duration, noteIndex == this.hoverNote, true);
			}
		}
		
		// Draw key change.
		if (region.showKeyChange)
		{
			this.ctx.strokeStyle = KEY_CHANGE_COLOR;
			this.ctx.beginPath();
				this.ctx.moveTo(region.x1, region.y1);
				this.ctx.lineTo(region.x1, region.y2);
			this.ctx.stroke();
			
			this.ctx.font = "14px Tahoma";
			this.ctx.fillStyle = KEY_CHANGE_COLOR;
			this.ctx.fillText(
				this.theory.getNameForPitch(region.key.tonicPitch, region.key.scale, region.key.tonicPitch) + " " + region.key.scale.name,
				region.x1 + 8,
				region.y1 + 12);
		}
		
		// Draw meter change.
		if (region.showMeterChange)
		{
			this.ctx.strokeStyle = METER_CHANGE_COLOR;
			this.ctx.beginPath();
				this.ctx.moveTo(region.x1, region.y1 + 20);
				this.ctx.lineTo(region.x1, region.y2);
			this.ctx.stroke();
			
			this.ctx.font = "14px Tahoma";
			this.ctx.fillStyle = METER_CHANGE_COLOR;
			this.ctx.fillText(
				"" + region.meter.numerator + " / " + region.meter.denominator,
				region.x1 + 8,
				region.y1 + 32);
		}
	}
	
		/*// Draw note measures.
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
		}*/
	
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


SongEditor.prototype.drawNote = function(region, pitch, tick, duration, hovering, selected)
{
	// Check if the note is inside the region.
	if (tick + duration <= region.tick ||
		tick >= region.tick + region.duration)
		return;
	
	var deg = this.theory.getDegreeForPitch(pitch, region.key.scale, region.key.tonicPitch);
	var row = this.theory.getRowForPitch(pitch, region.key.scale, region.key.tonicPitch);
	
	var clippedStartTick = Math.max(tick, region.tick);
	var clippedEndTick = Math.min(tick + duration, region.tick + region.duration);
	var clippedDuration = clippedEndTick - clippedStartTick;
	
	var pos = this.getNotePosition(region, row, clippedStartTick, clippedDuration);
	
	this.drawDegreeColoredRectangle(deg, pos.x1, pos.y1, pos.x2, pos.y2);
	
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


SongEditor.prototype.drawDegreeColoredRectangle = function(deg, x1, y1, x2, y2)
{
	var col = this.theory.getColorForDegree(deg - (deg % 1));
	
	this.ctx.save();
	this.ctx.beginPath();
	this.ctx.rect(x1, y1, x2 - x1, y2 - y1);
	this.ctx.clip();
	
	this.ctx.fillStyle = col;
	this.ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
	
	// Draw stripes for fractional scale degrees.
	if ((deg % 1) != 0)
	{
		this.ctx.strokeStyle = this.theory.getColorForDegree((deg - (deg % 1) + 1) % 7);
		this.ctx.lineWidth = 5;
		for (var i = 0; i < x2 - x1 + 30; i += 15)
		{
			this.ctx.beginPath();
			this.ctx.moveTo(x1 + i, y1 - 5);
			this.ctx.lineTo(x1 + i - 20, y1 - 5 + 20);
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