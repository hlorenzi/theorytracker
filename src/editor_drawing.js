SongEditor.prototype.refreshCanvas = function()
{
	this.canvasWidth = parseFloat(this.canvas.width);
	this.canvasHeight = parseFloat(this.canvas.height);
	
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
	
	this.ctx.save();
	this.ctx.beginPath();
	
	for (var r = 0; r < this.viewRegions.length; r++)
	{
		var region = this.viewRegions[r];
		
		// Draw section-stretched or regular region.
		if (this.mouseDragAction == "stretch-section" && this.mouseDraggedSectionKnob == region.section)
		{
			var knobDraggedTick = this.getSectionKnobDraggedTick(region, this.mouseDragCurrent);
			
			if (region.sectionKnob && knobDraggedTick > region.tick + region.duration)
				this.drawRegion(region, region.tick, knobDraggedTick - region.tick);
			else
				this.drawRegion(region, region.tick, region.duration, false);
		}
		else
			this.drawRegion(region, region.tick, region.duration, false);
		
		this.ctx.save();
		this.ctx.rect(
			region.x1,
			region.y1 + this.HEADER_HEIGHT,
			region.x2 - region.x1,
			(region.y2 - this.CHORD_HEIGHT - this.CHORD_NOTE_SEPARATION) - (region.y1 + this.HEADER_HEIGHT));
		this.ctx.clip();
		
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
		
		this.ctx.restore();
		
		// Draw chords.
		for (var n = 0; n < region.chords.length; n++)
		{
			var chordIndex = region.chords[n];
			var chord = this.songData.chords[chordIndex];
			
			if (!this.chordSelections[chordIndex] || this.mouseDragAction == null || this.mouseDragAction == "scroll")
				this.drawChord(region, chord, chord.tick, chord.duration, chordIndex == this.hoverChord, this.chordSelections[chordIndex]);
		}
		
		// Draw dragged chords.
		if (this.mouseDragAction != null && this.mouseDragAction != "scroll")
		{
			for (var n = 0; n < this.songData.chords.length; n++)
			{
				if (!this.chordSelections[n])
					continue;
				
				var chord = this.songData.chords[n];
				var chordDragged = this.getChordDragged(chord, this.mouseDragCurrent);
				this.drawChord(region, chord, chordDragged.tick, chordDragged.duration, chordIndex == this.hoverChord, true);
			}
		}
		
		// Draw key change.
		for (var n = 0; n < region.keyChanges.length; n++)
		{
			var keyChangeIndex = region.keyChanges[n];
			var keyChange = this.songData.keyChanges[keyChangeIndex];
			
			if (!this.keyChangeSelections[keyChangeIndex] || this.mouseDragAction == null || this.mouseDragAction == "scroll")
				this.drawKeyChange(region, keyChange, keyChange.tick, keyChangeIndex == this.hoverKeyChange, this.keyChangeSelections[keyChangeIndex]);
		}
		
		// Draw dragged key changes.
		if (this.mouseDragAction != null && this.mouseDragAction != "scroll")
		{
			for (var n = 0; n < this.songData.keyChanges.length; n++)
			{
				if (!this.keyChangeSelections[n])
					continue;
				
				var keyChange = this.songData.keyChanges[n];
				var keyChangeDragged = this.getKeyChangeDragged(keyChange, this.mouseDragCurrent);
				
				this.drawKeyChange(region, keyChange, keyChangeDragged.tick, keyChangeIndex == this.hoverKeyChange, true);
			}
		}
		
		// Draw meter change.
		for (var n = 0; n < region.meterChanges.length; n++)
		{
			var meterChangeIndex = region.meterChanges[n];
			var meterChange = this.songData.meterChanges[meterChangeIndex];
			
			if (!this.meterChangeSelections[meterChangeIndex] || this.mouseDragAction == null || this.mouseDragAction == "scroll")
				this.drawMeterChange(region, meterChange, meterChange.tick, meterChangeIndex == this.hoverMeterChange, this.meterChangeSelections[meterChangeIndex]);
		}
		
		// Draw dragged meter changes.
		if (this.mouseDragAction != null && this.mouseDragAction != "scroll")
		{
			for (var n = 0; n < this.songData.meterChanges.length; n++)
			{
				if (!this.meterChangeSelections[n])
					continue;
				
				var meterChange = this.songData.meterChanges[n];
				var meterChangeDragged = this.getMeterChangeDragged(meterChange, this.mouseDragCurrent);
				
				this.drawMeterChange(region, meterChange, meterChangeDragged.tick, meterChangeIndex == this.hoverMeterChange, true);
			}
		}
		
		// Draw section knob and section deletion.
		if (this.mouseDragAction == "stretch-section" && this.mouseDraggedSectionKnob == region.section)
		{
			var knobDraggedTick = this.getSectionKnobDraggedTick(region, this.mouseDragCurrent);
			this.drawSectionKnob(region, knobDraggedTick, region.section == this.hoverSectionKnob, true, false);
			
			if (knobDraggedTick < region.tick + region.duration)
				this.drawSectionDeletion(region, knobDraggedTick, region.tick + region.duration - knobDraggedTick);
		}
		else if (region.sectionKnob)
			this.drawSectionKnob(region, region.tick + region.duration, region.section == this.hoverSectionKnob, false, true);
		
		// Draw cursor.
		if (this.showCursor && this.cursorTick >= region.tick && this.cursorTick <= region.tick + region.duration)
		{
			this.ctx.strokeStyle = CURSOR_COLOR;
			this.ctx.fillStyle = CURSOR_COLOR;
			this.ctx.lineWidth = 2;
			
			var cursorX = region.x1 + (this.cursorTick - region.tick) * this.tickZoom;
			var cursorY1 = region.y1 + this.HEADER_HEIGHT;
			var cursorY2 = region.y2;
			
			if (this.cursorZone == this.CURSOR_ZONE_NOTES)
				cursorY2 = region.y2 - this.CHORD_HEIGHT - this.CHORD_NOTE_SEPARATION;
			
			else if (this.cursorZone == this.CURSOR_ZONE_CHORDS)
				cursorY1 = region.y2 - this.CHORD_HEIGHT;
			
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
	
	this.drawDegreeColoredRectangle(deg, pos.x1 + this.NOTE_MARGIN_HOR, pos.y1, pos.x2 - this.NOTE_MARGIN_HOR, pos.y2);
	
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


SongEditor.prototype.drawChord = function(region, chord, tick, duration, hovering, selected)
{
	// Check if the chord is inside the region.
	if (tick + duration <= region.tick ||
		tick >= region.tick + region.duration)
		return;
	
	var clippedStartTick = Math.max(tick, region.tick);
	var clippedEndTick = Math.min(tick + duration, region.tick + region.duration);
	var clippedDuration = clippedEndTick - clippedStartTick;
	
	var deg = this.theory.getDegreeForPitch(chord.rootPitch, region.key.scale, region.key.tonicPitch);
	var pos = this.getChordPosition(region, clippedStartTick, clippedDuration);
	
	this.drawDegreeColoredRectangle(deg, pos.x1 + this.NOTE_MARGIN_HOR, pos.y1, pos.x2 - this.NOTE_MARGIN_HOR, pos.y1 + this.CHORD_ORNAMENT_HEIGHT);
	this.drawDegreeColoredRectangle(deg, pos.x1 + this.NOTE_MARGIN_HOR, pos.y2 - this.CHORD_ORNAMENT_HEIGHT, pos.x2 - this.NOTE_MARGIN_HOR, pos.y2);
	
	// Draw roman symbol.
	var numeral = this.theory.getRomanNumeralForPitch(chord.rootPitch, region.key.scale, region.key.tonicPitch);
	var romanText = (chord.chord.uppercase ? numeral : numeral.toLowerCase());
	
	this.ctx.fillStyle = "#000000";
	this.ctx.textAlign = "center";
	this.ctx.textBaseline = "middle";
	
	this.ctx.font = "20px Tahoma";
	var supTextWidth = this.ctx.measureText(chord.chord.symbolSup).width;
	var subTextWidth = this.ctx.measureText(chord.chord.symbolSub).width;
	
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
	this.ctx.fillText(chord.chord.symbolSup, (pos.x1 + pos.x2) / 2 - totalTextWidth / 2 + mainTextWidth + supTextWidth / 2, (pos.y1 + pos.y2) / 2 - 10, maxTextWidth - mainTextWidth - subTextWidth);
	this.ctx.fillText(chord.chord.symbolSub, (pos.x1 + pos.x2) / 2 - totalTextWidth / 2 + mainTextWidth + supTextWidth + subTextWidth / 2, (pos.y1 + pos.y2) / 2 + 10, maxTextWidth - mainTextWidth - supTextWidth);
	
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


SongEditor.prototype.drawKeyChange = function(region, keyChange, tick, hovering, selected)
{
	// Check if the key change is inside the region.
	if (tick < region.tick ||
		tick >= region.tick + region.duration)
		return;
		
	var COLOR = "#aaaaaa";
	
	var x = region.x1 + (tick - region.tick) * this.tickZoom;
	
	this.ctx.strokeStyle = COLOR;
	this.ctx.lineWidth = 2;
	
	this.ctx.beginPath();
		this.ctx.moveTo(x, region.y1);
		this.ctx.lineTo(x, region.y2);
	this.ctx.stroke();
	
	if (selected)
	{
		this.ctx.save();
		this.ctx.globalAlpha = 0.6;
		this.ctx.fillStyle = COLOR;
		this.ctx.fillRect(x, region.y1, region.x2 - x, this.HEADER_LINE_HEIGHT);
		this.ctx.restore();
	}
	else if (hovering)
	{
		this.ctx.save();
		this.ctx.globalAlpha = 0.2;
		this.ctx.fillStyle = COLOR;
		this.ctx.fillRect(x, region.y1, region.x2 - x, this.HEADER_LINE_HEIGHT);
		this.ctx.restore();
	}
	
	this.ctx.font = "14px Tahoma";
	this.ctx.textAlign = "left";
	this.ctx.textBaseline = "middle";
	this.ctx.fillStyle = COLOR;
	this.ctx.fillText(
		this.theory.getNameForPitch(keyChange.tonicPitch, keyChange.scale, keyChange.tonicPitch) + " " + keyChange.scale.name,
		x + 8,
		region.y1 + 8,
		region.x2 - x - 16);
}


SongEditor.prototype.drawMeterChange = function(region, meterChange, tick, hovering, selected)
{
	// Check if the meter change is inside the region.
	if (tick < region.tick ||
		tick >= region.tick + region.duration)
		return;
		
	var COLOR = "#88aaaa";
	
	var x = region.x1 + (tick - region.tick) * this.tickZoom;
	
	this.ctx.strokeStyle = COLOR;
	this.ctx.lineWidth = 2;
	this.ctx.beginPath();
		this.ctx.moveTo(x, region.y1 + this.HEADER_LINE_HEIGHT);
		this.ctx.lineTo(x, region.y2);
	this.ctx.stroke();
	
	if (selected)
	{
		this.ctx.save();
		this.ctx.globalAlpha = 0.6;
		this.ctx.fillStyle = COLOR;
		this.ctx.fillRect(x, region.y1 + this.HEADER_LINE_HEIGHT, region.x2 - x, this.HEADER_LINE_HEIGHT);
		this.ctx.restore();
	}
	else if (hovering)
	{
		this.ctx.save();
		this.ctx.globalAlpha = 0.2;
		this.ctx.fillStyle = COLOR;
		this.ctx.fillRect(x, region.y1 + this.HEADER_LINE_HEIGHT, region.x2 - x, this.HEADER_LINE_HEIGHT);
		this.ctx.restore();
	}
	
	this.ctx.font = "14px Tahoma";
	this.ctx.textAlign = "left";
	this.ctx.textBaseline = "middle";
	this.ctx.fillStyle = COLOR;
	this.ctx.fillText(
		"" + meterChange.numerator + " / " + meterChange.denominator,
		x + 8,
		region.y1 + 24,
		region.x2 - x - 16);
}


SongEditor.prototype.drawSectionKnob = function(region, tick, hovering, selected, clipOutside)
{
	// Check if the knob is inside the region.
	if (clipOutside &&
		(tick < region.tick ||
		tick > region.tick + region.duration))
		return;
		
	var COLOR = "#000000";
	var COLOR_HOVER = "#88ddff";
	var COLOR_SELECTED = "#4488ff";
	
	var x = region.x1 + (tick - region.tick) * this.tickZoom;
	
	this.ctx.strokeStyle = (selected ? COLOR_SELECTED : hovering ? COLOR_HOVER : COLOR);
	this.ctx.fillStyle = (selected ? COLOR_SELECTED : hovering ? COLOR_HOVER : COLOR);
	this.ctx.lineWidth = 2;
	
	this.ctx.beginPath();
		this.ctx.moveTo(x, region.y1 + this.HEADER_HEIGHT - 12);
		this.ctx.lineTo(x, region.y2);
	this.ctx.stroke();
	
	this.ctx.beginPath();
		this.ctx.arc(x, region.y1 + this.HEADER_HEIGHT - 12, 6, 0, Math.PI * 2);
	this.ctx.fill();
}


SongEditor.prototype.drawSectionDeletion = function(region, tick, duration)
{
	// Check if the knob is inside the region.
	if (tick + duration < region.tick ||
		tick >= region.tick + region.duration)
		return;
		
	var COLOR = "#ffffff";
	
	var clippedStart = Math.max(region.tick, tick);
	var clippedEnd = Math.min(region.tick + region.duration, tick + duration);
	
	var x1 = region.x1 + (clippedStart - region.tick) * this.tickZoom;
	var x2 = region.x1 + (clippedEnd - region.tick) * this.tickZoom;
	
	this.ctx.save();
	this.ctx.fillStyle = COLOR;
	this.ctx.globalAlpha = 0.8;
	
	this.ctx.fillRect(x1 + 1, region.y1 + this.HEADER_HEIGHT - 1, x2 - x1, region.y2 - region.y1 - this.HEADER_HEIGHT + 2);
	
	this.ctx.restore();
}


SongEditor.prototype.drawRegion = function(region, tick, duration, asSectionStretch)
{
	var SECTION_BORDER_COLOR = "#000000";
	var NOTE_LINE_COLOR = "#dddddd";
	var MEASURE_COLOR = "#dddddd";
	var MEASURE_COLOR_STRONG = "#888888";
	
	var x1 = region.x1 + (tick - region.tick) * this.tickZoom;
	var x2 = region.x1 + (tick + duration - region.tick) * this.tickZoom;
	
	// Draw region boundaries.
	this.ctx.strokeStyle = SECTION_BORDER_COLOR;
	this.ctx.lineWidth = 2;
	this.ctx.beginPath();
	
		this.ctx.strokeRect(
			x1,
			region.y1 + this.HEADER_HEIGHT,
			x2 - x1,
			(region.y2 - this.CHORD_HEIGHT - this.CHORD_NOTE_SEPARATION) - (region.y1 + this.HEADER_HEIGHT));
		
		this.ctx.strokeRect(
			x1,
			region.y2 - this.CHORD_HEIGHT,
			x2 - x1,
			this.CHORD_HEIGHT);
		
	this.ctx.stroke();
	
	// Draw note lines.
	this.ctx.strokeStyle = NOTE_LINE_COLOR;
	this.ctx.beginPath();
	for (var n = 1; n < region.highestNoteRow - region.lowestNoteRow; n++)
	{
		var y = region.y2 - this.CHORD_HEIGHT - this.CHORD_NOTE_SEPARATION - n * this.NOTE_HEIGHT;
		this.ctx.moveTo(x1 + 1, y);
		this.ctx.lineTo(x2 - 1, y);
	}
	this.ctx.stroke();

	// Draw beat lines.
	var beatCount = 0;
	for (var n = region.meter.tick - tick; n < duration; n += this.songData.ticksPerWholeNote / region.meter.denominator)
	{
		if (n > 0)
		{
			this.ctx.strokeStyle = (beatCount == 0 ? MEASURE_COLOR_STRONG : MEASURE_COLOR);
			this.ctx.beginPath();
				this.ctx.moveTo(
					x1 + n * this.tickZoom,
					region.y1 + this.HEADER_HEIGHT + 1);
				this.ctx.lineTo(
					x1 + n * this.tickZoom,
					region.y2 - this.CHORD_HEIGHT - this.CHORD_NOTE_SEPARATION - 1);
				this.ctx.moveTo(
					x1 + n * this.tickZoom,
					region.y2 - this.CHORD_HEIGHT + 1);
				this.ctx.lineTo(
					x1 + n * this.tickZoom,
					region.y2 - 1);
			this.ctx.stroke();
		}
		
		beatCount = (beatCount + 1) % region.meter.numerator;
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