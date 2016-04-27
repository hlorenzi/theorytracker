// Sets up representation objects for the data in the song,
// which are used to draw the staff and for interaction with the mouse.
SongEditor.prototype.refreshRepresentation = function()
{
	// Clear representation objects.
	this.viewRegions = [];
	
	// Clear selection arrays and push a boolean false for each object in the song data,
	// effectively unselecting everything, while also accomodating added/removed objects.
	this.selectedObjects = 0;
	
	this.noteSelections = [];
	for (var i = 0; i < this.songData.notes.length; i++)
		this.noteSelections.push(false);
	
	this.chordSelections = [];
	for (var i = 0; i < this.songData.chords.length; i++)
		this.chordSelections.push(false);
	
	this.keyChangeSelections = [];
	for (var i = 0; i < this.songData.keyChanges.length; i++)
		this.keyChangeSelections.push(false);
	
	this.meterChangeSelections = [];
	for (var i = 0; i < this.songData.meterChanges.length; i++)
		this.meterChangeSelections.push(false);
	
	// Iterate through song sections.
	var maxX = this.MARGIN_LEFT;
	var currentY = this.MARGIN_TOP;
	var currentKeyChangeIndex = -1;
	var currentMeterChangeIndex = -1;
	
	if (this.songData.keyChanges.length > 0 &&
		this.songData.keyChanges[0].tick == 0)
		currentKeyChangeIndex = 0;
	
	if (this.songData.meterChanges.length > 0 &&
		this.songData.meterChanges[0].tick == 0)
		currentMeterChangeIndex = 0;
		
	var DEFAULT_KEY = new SongDataKeyChange(-1, this.theory.scales[0], this.theory.C);
	var DEFAULT_METER = new SongDataMeterChange(-1, 4, 4);
	
	for (var i = 0; i < this.songData.sectionBreaks.length + 1; i++)
	{
		var sectionTickRange = this.songData.getSectionTickRange(i);
		var sectionDuration = sectionTickRange.end - sectionTickRange.start;
		
		var lowestNoteRow = 7 * 5;
		var highestNoteRow = 7 * 6;
		
		// Create regions with non-changing key and meter.
		var regions = [];
		var currentRegionStart = sectionTickRange.start;
		while (currentRegionStart < sectionTickRange.end)
		{
			// Find next key change tick and next meter change tick.
			var nextKeyChangeTick = sectionTickRange.end;
			var nextMeterChangeTick = sectionTickRange.end;
			var willChangeKey = false;
			var willChangeMeter = false;
			
			if (currentKeyChangeIndex + 1 < this.songData.keyChanges.length &&
				this.songData.keyChanges[currentKeyChangeIndex + 1].tick < nextKeyChangeTick)
			{
				nextKeyChangeTick = this.songData.keyChanges[currentKeyChangeIndex + 1].tick;
				willChangeKey = true;
			}
			
			if (currentMeterChangeIndex + 1 < this.songData.meterChanges.length &&
				this.songData.meterChanges[currentMeterChangeIndex + 1].tick < nextMeterChangeTick)
			{
				nextMeterChangeTick = this.songData.meterChanges[currentMeterChangeIndex + 1].tick;
				willChangeMeter = true;
			}
			
			var regionEndTick = Math.min(nextKeyChangeTick, nextMeterChangeTick);
			var key = (currentKeyChangeIndex >= 0 ? this.songData.keyChanges[currentKeyChangeIndex] : DEFAULT_KEY);
			var meter = (currentMeterChangeIndex >= 0 ? this.songData.meterChanges[currentMeterChangeIndex] : DEFAULT_METER);
			
			// Find lowest and highest pitch in section.
			var notes = [];
			for (var n = 0; n < this.songData.notes.length; n++)
			{
				var note = this.songData.notes[n];
				
				if (note.tick < sectionTickRange.end &&
					note.tick + note.duration >= sectionTickRange.start)
				{
					var noteRow = this.theory.getRowForPitch(note.pitch, key.scale, key.tonicPitch);
					lowestNoteRow = Math.min(lowestNoteRow, Math.floor(noteRow));
					highestNoteRow = Math.max(highestNoteRow, Math.ceil(noteRow) + 1);
					notes.push(n);
				}
			}
			
			// Find chords in section.
			var chords = [];
			for (var n = 0; n < this.songData.chords.length; n++)
			{
				var chord = this.songData.chords[n];
				
				if (chord.tick < sectionTickRange.end &&
					chord.tick + chord.duration >= sectionTickRange.start)
				{
					chords.push(n);
				}
			}
			
			var keyChanges = [];
			if (key.tick == currentRegionStart)
				keyChanges.push(currentKeyChangeIndex);
			
			var meterChanges = [];
			if (meter.tick == currentRegionStart)
				meterChanges.push(currentMeterChangeIndex);
			
			// Add region to list.
			var region = {
				section: i,
				sectionTick: sectionTickRange.start,
				sectionDuration: sectionDuration,
				tick: currentRegionStart,
				duration: regionEndTick - currentRegionStart,
				x1: this.MARGIN_LEFT + (currentRegionStart - sectionTickRange.start) * this.tickZoom,
				y1: 0,
				x2: this.MARGIN_LEFT + (regionEndTick - sectionTickRange.start) * this.tickZoom,
				y2: 0,
				
				interactBBox: {
					x1: this.MARGIN_LEFT + (currentRegionStart - sectionTickRange.start) * this.tickZoom,
					y1: 0,
					x2: this.MARGIN_LEFT + (regionEndTick - sectionTickRange.start) * this.tickZoom,
					y2: 0,
				},
				
				key: key,
				meter: meter,
				notes: notes,
				chords: chords,
				keyChanges: keyChanges,
				meterChanges: meterChanges,
				sectionKnob: false
			};
			
			maxX = Math.max(maxX, region.x2 + this.MARGIN_RIGHT);
			
			regions.push(region);
			this.viewRegions.push(region);
			
			// Prepare for the next region.
			currentRegionStart = regionEndTick;
			
			if (nextKeyChangeTick == nextMeterChangeTick && willChangeKey && willChangeMeter)
			{
				currentKeyChangeIndex++;
				currentMeterChangeIndex++;
			}
			else if (nextKeyChangeTick < nextMeterChangeTick && willChangeKey)
			{
				currentKeyChangeIndex++;
			}
			else if (nextMeterChangeTick < nextKeyChangeTick && willChangeMeter)
			{
				currentMeterChangeIndex++;
			}
		}
		
		// Prepare for the next section.
		var sectionHeight =
			this.HEADER_HEIGHT +
			(highestNoteRow - lowestNoteRow) * this.NOTE_HEIGHT +
			this.CHORD_NOTE_SEPARATION + this.CHORD_HEIGHT;
			
		for (var r = 0; r < regions.length; r++)
		{
			regions[r].lowestNoteRow = lowestNoteRow;
			regions[r].highestNoteRow = highestNoteRow;
			regions[r].y1 = currentY;
			regions[r].y2 = currentY + sectionHeight;
			
			regions[r].interactBBox.y1 = currentY;
			regions[r].interactBBox.y2 = currentY + sectionHeight + this.SECTION_SEPARATION;
			
			if (r == 0)
				regions[r].interactBBox.x1 = 0;
			
			if (r == regions.length - 1)
			{
				regions[r].sectionKnob = true;
				regions[r].interactBBox.x2 = this.canvasWidth;
			}
		}
		
		currentY += sectionHeight + this.SECTION_SEPARATION;
	}
	
	this.canvas.width = maxX + 400;
	this.canvas.height = currentY;
}


SongEditor.prototype.getNotePosition = function(region, row, tick, duration)
{
	var x1 = region.x1 + (tick - region.tick) * this.tickZoom;
	var y1 = region.y2 - this.CHORD_HEIGHT - this.CHORD_NOTE_SEPARATION - (row - region.lowestNoteRow + 1) * this.NOTE_HEIGHT;
	
	return {
		x1: x1,
		y1: y1,
		x2: x1 + duration * this.tickZoom,
		y2: y1 + this.NOTE_HEIGHT
	};
}


SongEditor.prototype.getChordPosition = function(region, tick, duration)
{
	var x1 = region.x1 + (tick - region.tick) * this.tickZoom;
	var y1 = region.y2 - this.CHORD_HEIGHT;
	
	return {
		x1: x1,
		y1: y1,
		x2: x1 + duration * this.tickZoom,
		y2: y1 + this.CHORD_HEIGHT
	};
}


SongEditor.prototype.getKeyChangePosition = function(region, tick)
{
	var x1 = region.x1 + (tick - region.tick) * this.tickZoom;
	var y1 = region.y1;
	
	return {
		x1: x1,
		y1: y1,
		x2: region.x2,
		y2: y1 + this.HEADER_LINE_HEIGHT
	};
}


SongEditor.prototype.getMeterChangePosition = function(region, tick)
{
	var x1 = region.x1 + (tick - region.tick) * this.tickZoom;
	var y1 = region.y1 + this.HEADER_LINE_HEIGHT;
	
	return {
		x1: x1,
		y1: y1,
		x2: region.x2,
		y2: y1 + this.HEADER_LINE_HEIGHT
	};
}


SongEditor.prototype.getSectionKnobPosition = function(region)
{
	var x1 = region.x1 + (region.duration) * this.tickZoom - 12;
	var y1 = region.y1;
	
	return {
		x1: x1,
		y1: y1,
		x2: x1 + 24,
		y2: y1 + this.HEADER_HEIGHT
	};
}