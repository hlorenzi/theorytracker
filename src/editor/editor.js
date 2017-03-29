function Editor(svg, synth)
{
	this.svg = svg;
	this.synth = synth;
	
	this.svgCursor1 = null;
	this.svgCursor2 = null;
	this.svgCursorPlayback = null;
	
	this.song = null;
	this.isPlaying = false;
	
	this.blocks = [];
	this.elements = [];
	
	this.mouseIsDown = false;
	this.newElementDuration = new Rational(0, 1, 4);
	
	this.cursorSnap = new Rational(0, 1, 16);
	this.cursorVisible = true;
	this.cursorTick1 = new Rational(0);
	this.cursorTrack1 = 0;
	this.cursorTick2 = new Rational(0);
	this.cursorTrack2 = 0;
	this.cursorTickPlayback = new Rational(0);
	
	this.width = 0;
	this.height = 0;
	
	this.defaultNoteMidiPitchMin = 60;
	this.defaultNoteMidiPitchMax = 71;
	
	this.margin = 20;
	this.marginBetweenRows = 10;
	this.wholeTickWidth = 100;
	this.noteHeight = 5;
	this.noteSideMargin = 0.5;
	this.chordHeight = 50;
	this.chordSideMargin = 0.5;
	this.chordOrnamentHeight = 5;
	this.handleSize = 8;
	
	this.usePopularNotation = true;
	
	this.eventInit();
	
	this.callbackTogglePlay = null;
	this.callbackCursorChange = null;
}


Editor.prototype.setSong = function(song)
{
	this.song = song;
	
	this.song.notes.enumerateAll(function (item)
	{
		if (item.editorData == null)
			item.editorData = { selected: false };
	});
	
	this.song.chords.enumerateAll(function (item)
	{
		if (item.editorData == null)
			item.editorData = { selected: false };
	});
	
	this.song.keyChanges.enumerateAll(function (item)
	{
		if (item.editorData == null)
			item.editorData = { selected: false };
	});
	
	this.song.meterChanges.enumerateAll(function (item)
	{
		if (item.editorData == null)
			item.editorData = { selected: false };
	});
	
	this.song.forcedMeasures.enumerateAll(function (item)
	{
		if (item.editorData == null)
			item.editorData = { selected: false };
	});
	
	this.refresh();
}


Editor.prototype.togglePlay = function()
{
	this.isPlaying = !this.isPlaying;
	
	if (this.isPlaying)
	{
		var startAtTick = this.cursorTick1.clone().min(this.cursorTick2);		
		this.play(startAtTick);
	}
	else
	{
		this.synth.clear();
		this.synth.stop();
		this.cursorHidePlayback();
		this.cursorVisible = true;
		this.refresh();
	}
	
	if (this.callbackTogglePlay != null)
		this.callbackTogglePlay(this.isPlaying);
}


Editor.prototype.play = function(startAtTick)
{
	this.synth.clear();
	this.synth.stop();
	
	if (this.song != null)
		this.song.feedSynth(this.synth, startAtTick);
	
	this.sliceOverlapping();
	this.selectNone();
	this.cursorHide();
	this.cursorSetTickPlayback(startAtTick);
	this.refresh();
	
	var that = this;
	this.synth.play(function(time)
	{
		// NOTE: Watch out for fixed song tempo,
		// if that changes in the future.
		
		// Convert time from seconds to ticks.
		var percentageOfWholeNote = time / (1000 / that.song.bpm / 4);
		var tick = Rational.fromFloat(percentageOfWholeNote, new Rational(0, 1, 64));
		tick.add(startAtTick);
		
		that.cursorSetTickPlayback(tick);
		
		if (tick.compare(that.song.length) >= 0)
			that.togglePlay();
	});
}


Editor.prototype.rewind = function()
{
	if (this.isPlaying)
		this.togglePlay();
	
	this.sliceOverlapping();
	this.selectNone();
	this.cursorSetTickBoth(new Rational(0));
	
	this.refresh();
}


Editor.prototype.insertNote = function(midiPitch)
{
	this.cursorSetTickAtSelectionEnd();
	this.sliceOverlapping();
	this.selectNone();
	
	var note = new SongNote(
		this.cursorTick1.clone(),
		this.cursorTick1.clone().add(this.newElementDuration),
		0,
		midiPitch,
		{ selected: true });
	
	this.song.notes.insert(note);
	
	this.synth.clear();
	this.synth.stop();
	Theory.playSampleNote(this.synth, midiPitch);
	this.synth.play();
	
	this.cursorSetTrackBoth(0);
	this.cursorSetTickBoth(this.cursorTick1.clone().add(this.newElementDuration));
	
	this.autoExtendSongLength();
	this.refresh();
}


Editor.prototype.insertChord = function(chordKindIndex, rootMidiPitch, embelishments)
{
	this.cursorSetTickAtSelectionEnd();
	this.sliceOverlapping();
	this.selectNone();
	
	var chord = new SongChord(
		this.cursorTick1.clone(),
		this.cursorTick1.clone().add(this.newElementDuration),
		chordKindIndex,
		rootMidiPitch,
		embelishments,
		{ selected: true });
	
	this.song.chords.insert(chord);
	
	this.synth.clear();
	this.synth.stop();
	Theory.playSampleChord(this.synth, chordKindIndex, rootMidiPitch, embelishments);
	this.synth.play();
	
	this.cursorSetTrackBoth(1);
	this.cursorSetTickBoth(this.cursorTick1.clone().add(this.newElementDuration));
	
	this.autoExtendSongLength();
	this.refresh();
}


Editor.prototype.insertNoteByDegree = function(degree)
{
	this.cursorSetTickAtSelectionEnd();
	
	var key = this.song.keyChanges.findPrevious(this.cursorTick1);
	var pitch = Theory.scales[key.scaleIndex].pitches[degree];
	
	this.insertNote(pitch + 60);
}


Editor.prototype.insertChordByDegree = function(degree)
{
	this.cursorSetTickAtSelectionEnd();
	
	var key = this.song.keyChanges.findPrevious(this.cursorTick1);
	
	var chordKindIndex = Theory.findChordKindForDegree(key.scaleIndex, degree);
	var rootMidiPitch = Theory.scales[key.scaleIndex].pitches[degree];
	
	this.insertChord(chordKindIndex, rootMidiPitch, []);
}


Editor.prototype.insertKeyChange = function(scaleIndex, tonicMidiPitch)
{
	this.selectNone();
	this.eraseKeyChangesAt(this.cursorTick1, this.cursorTick1);
	this.song.keyChanges.insert(
		new SongKeyChange(this.cursorTick1.clone(), scaleIndex, tonicMidiPitch, { selected: true }));
	this.cursorSetTickBoth(this.cursorTick1.clone().min(this.cursorTick2));
	this.refresh();
}


Editor.prototype.insertMeterChange = function(numerator, denominator)
{
	this.selectNone();
	this.eraseMeterChangesAt(this.cursorTick1, this.cursorTick1);
	this.song.meterChanges.insert(
		new SongMeterChange(this.cursorTick1.clone(), numerator, denominator, { selected: true }));
	this.cursorSetTickBoth(this.cursorTick1.clone().min(this.cursorTick2));
	this.refresh();
}


Editor.prototype.updateSvgCursor = function(node, visible, tick, track1, track2)
{
	if (!visible)
	{
		editSvgNode(node, { x1: 0, y1: 0, x2: 0, y2: 0 });
		return;
	}
	
	var block = this.getBlockAtTick(tick);
	if (block == null)
	{
		editSvgNode(node, { x1: 0, y1: 0, x2: 0, y2: 0 });
		return;
	}
	
	var tickOffset = tick.clone().subtract(block.tickStart);
	var xOffset = tickOffset.asFloat() * this.wholeTickWidth;
	
	var trackMin = Math.min(track1, track2);
	var trackMax = Math.max(track1, track2);
	
	var yOffset1 = block.trackNoteYStart;
	if (trackMin == 1)
		yOffset1 = block.trackChordYStart;
	
	var yOffset2 = block.trackNoteYEnd;
	if (trackMax == 1)
		yOffset2 = block.trackChordYEnd;
	
	editSvgNode(node,
	{
		x1: block.x + xOffset,
		y1: block.y + yOffset1 - 5,
		x2: block.x + xOffset,
		y2: block.y + yOffset2 + 5
	});
}


Editor.prototype.getBlockIndexAt = function(x, y)
{
	// TODO: Optimize block search.
	for (var i = 0; i < this.blocks.length; i++)
	{
		var block = this.blocks[i];
		
		// Only check the right and bottom boundaries,
		// as to recognize the left and top margin space
		// as part of the block.
		// It works because this is a linear search loop.
		if (x < block.x + block.width &&
			y < block.y + block.height)
		{
			return i;
		}
	}
	
	return null;
}


Editor.prototype.getBlockAt = function(x, y)
{
	var blockIndex = this.getBlockIndexAt(x, y);
	if (blockIndex != null)
		return this.blocks[blockIndex];
	
	return null;
}


Editor.prototype.getBlockAtTick = function(tick)
{
	// TODO: Optimize block search.
	for (var i = 0; i < this.blocks.length; i++)
	{
		var block = this.blocks[i];
		
		if (tick.compare(block.tickEnd) < 0)
			return block;
	}
	
	return null;
}


Editor.prototype.getElementInBlockAt = function(block, x, y)
{
	if (block == null)
		return null;
	
	for (var i = 0; i < block.elements.length; i++)
	{
		var elem = block.elements[i];
		
		if (x >= elem.x && y >= elem.y &&
			x <= elem.x + elem.width &&
			y <= elem.y + elem.height)
			return elem;
	}
	
	return null;
}


Editor.prototype.getElementAt = function(x, y)
{
	var blockIndex = this.getBlockIndexAt(x, y);
	if (blockIndex == null)
		return null;
	
	var elem = this.getElementInBlockAt(this.blocks[blockIndex], x, y);
	if (elem != null)
		return elem;
	
	if (blockIndex + 1 < this.blocks.length)
		return this.getElementInBlockAt(this.blocks[blockIndex + 1], x, y);
	
	return null;
}


Editor.prototype.getTickOffset = function(x, snap)
{
	var offset = new Rational(0);
	
	while (offset.asFloat() * this.wholeTickWidth < x)
		offset.add(snap);
	
	if (offset.compare(snap) >= 0)
		offset.subtract(snap);
	
	return offset;
}


Editor.prototype.refresh = function()
{
	// Update dimensions.
	this.width = this.svg.clientWidth;
	this.height = this.svg.clientHeight;
	
	// Clear SVG elements.
	while (this.svg.lastChild)
		this.svg.removeChild(this.svg.lastChild);
	
	// Clear layout blocks.
	this.blocks = [];
	
	// Early return if no song.
	if (this.song == null)
		return;
	
	// Keep creating rows while song is not over.
	var tick = new Rational(0);
	var y = this.margin;
	while (tick.compare(this.song.length) < 0)
	{
		var row = this.refreshRow(tick, y);
		if (row == null)
			break;
		
		tick = row.tickEnd;
		y = row.yEnd;
	}
	
	// Resize SVG element for vertical scrolling to work.
	this.svg.style.height = y + this.margin;
	
	// Render cursors.
	this.svgCursor1 = this.addSvgNode("editorCursor", "line", { x1: 0, y1: 0, x2: 0, y2: 0 });
	this.svgCursor2 = this.addSvgNode("editorCursor", "line", { x1: 0, y1: 0, x2: 0, y2: 0 });
	this.svgCursorPlayback = this.addSvgNode("editorCursorPlayback", "line", { x1: 0, y1: 0, x2: 0, y2: 0 });
	
	if (this.cursorVisible)
	{
		this.updateSvgCursor(this.svgCursor1, true, this.cursorTick1, this.cursorTrack1, this.cursorTrack2);
		this.updateSvgCursor(this.svgCursor2, true, this.cursorTick2, this.cursorTrack1, this.cursorTrack2);
	}
}


Editor.prototype.refreshRow = function(rowTickStart, rowYStart)
{
	// Calculate blocks.
	// Break row only at measure separators or key/meter changes.
	var calculatedBlocks = [];
	
	var currentBlockStart = rowTickStart.clone();
	var currentKeyChange = this.song.keyChanges.findPrevious(rowTickStart);
	var currentMeterChange = this.song.meterChanges.findPrevious(rowTickStart);
	var currentMeasureStart = currentMeterChange.tick.clone();
	
	var x = this.margin;
	while (true)
	{
		var nextBlockEnd = currentMeasureStart.clone();
		while (true)
		{
			if (nextBlockEnd.compare(currentBlockStart) > 0)
				break;
			
			nextBlockEnd.add(currentMeterChange.getMeasureLength());
		}
		
		var nextKeyChange = this.song.keyChanges.findNext(currentBlockStart);
		var nextMeterChange = this.song.meterChanges.findNext(currentBlockStart);
		
		if (nextKeyChange != null && nextKeyChange.tick.compare(nextBlockEnd) < 0)
			nextBlockEnd = nextKeyChange.tick.clone();
		
		if (nextMeterChange != null && nextMeterChange.tick.compare(nextBlockEnd) < 0)
			nextBlockEnd = nextMeterChange.tick.clone();
		
		if (this.song.length.compare(nextBlockEnd) < 0)
			nextBlockEnd = this.song.length.clone();
		
		var width = (nextBlockEnd.asFloat() - currentBlockStart.asFloat()) * this.wholeTickWidth;
		
		if (x + width + this.margin > this.width)
			break;
		
		var block =
		{
			tickStart: currentBlockStart.clone(),
			tickEnd: nextBlockEnd.clone(),
			measureStartTick: currentMeterChange.tick.clone(),
			x: x,
			y: rowYStart,
			width: width,
			key: currentKeyChange,
			meter: currentMeterChange
		};
		
		calculatedBlocks.push(block);
		
		x += width;
		
		currentBlockStart = nextBlockEnd;
		
		if (nextKeyChange != null && nextKeyChange.tick.compare(nextBlockEnd) == 0)
			currentKeyChange = nextKeyChange;
		
		if (nextMeterChange != null && nextMeterChange.tick.compare(nextBlockEnd) == 0)
		{
			currentMeterChange = nextMeterChange;
			currentMeasureStart = currentMeterChange.tick.clone();
		}
		
		if (this.song.length.compare(nextBlockEnd) == 0)
			break;
	}
	
	// Check if we can't make any progress to avoid an infinite loop.
	if (calculatedBlocks.length == 0 && this.song.length.compare(currentBlockStart) > 0)
		return null;
	
	var rowTickEnd = currentBlockStart;
	var rowTickLength = rowTickEnd.clone().subtract(rowTickStart);
	
	// Find the lowest and highest pitches for notes in this row.
	var midiPitchMin = this.defaultNoteMidiPitchMin;
	var midiPitchMax = this.defaultNoteMidiPitchMax;
	
	this.song.notes.enumerateOverlappingRange(rowTickStart, rowTickEnd, function (note)
	{
		midiPitchMin = Math.min(note.midiPitch, midiPitchMin);
		midiPitchMax = Math.max(note.midiPitch, midiPitchMax);
	});
	
	// Check if there are any key changes in this row.
	var rowHasKeyChange = false;
	this.song.keyChanges.enumerateOverlappingRange(rowTickStart, rowTickEnd, function (keyCh)
	{
		rowHasKeyChange = true;
	});
	
	// Check if there are any meter changes in this row.
	var rowHasMeterChange = false;
	this.song.meterChanges.enumerateOverlappingRange(rowTickStart, rowTickEnd, function (meterCh)
	{
		rowHasMeterChange = true;
	});
	
	// Render blocks.
	for (var i = 0; i < calculatedBlocks.length; i++)
	{
		var block = this.refreshBlock(
			calculatedBlocks[i],
			midiPitchMin, midiPitchMax,
			rowHasKeyChange, rowHasMeterChange);
			
		this.blocks.push(block);
	}
	
	if (calculatedBlocks.length > 0)
	{
		return {
			tickEnd: rowTickEnd.clone(),
			yEnd: rowYStart + calculatedBlocks[0].height + this.marginBetweenRows
		};
	}
	else
	{
		return {
			tickEnd: rowTickEnd.clone(),
			yEnd: rowYStart
		};
	}
}


Editor.prototype.refreshBlock = function(
	block,
	midiPitchMin, midiPitchMax,
	rowHasKeyChange, rowHasMeterChange)
{
	var that = this;

	// Add block layout to master list.
	// This is used for mouse interaction.
	block.elements = [];
	
	block.trackKeyChangeYStart = 0;
	block.trackKeyChangeYEnd   = block.trackKeyChangeYStart + (rowHasKeyChange ? 20 : 0);
		
	block.trackMeterChangeYStart = block.trackKeyChangeYEnd;
	block.trackMeterChangeYEnd   = block.trackMeterChangeYStart + (rowHasMeterChange ? 20 : 0);
	
	block.trackNoteYStart = block.trackMeterChangeYEnd;
	block.trackNoteYEnd   = block.trackNoteYStart + (midiPitchMax + 1 - midiPitchMin) * this.noteHeight;
	
	block.trackChordYStart = block.trackNoteYEnd;
	block.trackChordYEnd   = block.trackChordYStart + this.chordHeight;
	
	block.height = block.trackChordYEnd;
	
	// Render the row's background.
	this.addSvgNode("editorBlockBackground", "rect",
	{
		x: block.x,
		y: block.y + block.trackNoteYStart,
		width: block.width,
		height: block.trackChordYEnd - block.trackNoteYStart
	});
	
	// Render the beat indicators.
	var beatTick = block.measureStartTick.clone();
	while (true)
	{
		beatTick.add(block.meter.getBeatLength());
		
		if (beatTick.compare(block.tickStart) <= 0)
			continue;
		
		if (beatTick.compare(block.tickEnd) >= 0)
			break;
		
		var xBeat = (beatTick.asFloat() - block.tickStart.asFloat()) * this.wholeTickWidth;
		
		var svgBeat = this.addSvgNode("editorBeat", "line",
		{
			x1: block.x + xBeat,
			y1: block.y + block.trackNoteYStart,
			x2: block.x + xBeat,
			y2: block.y + block.trackChordYEnd
		});
	}
		
	// Render the note track's frame.
	this.addSvgNode("editorBlockFrame", "rect",
	{
		x: block.x,
		y: block.y + block.trackNoteYStart,
		width: block.width,
		height: block.trackNoteYEnd - block.trackNoteYStart
	});
	
	// Render the chord track's frame.
	this.addSvgNode("editorBlockFrame", "rect",
	{
		x: block.x,
		y: block.y + block.trackChordYStart,
		width: block.width,
		height: block.trackChordYEnd - block.trackChordYStart
	});
		
	// Render notes.
	this.song.notes.enumerateOverlappingRange(block.tickStart, block.tickEnd, function (note)
	{
		var noteXStart = note.startTick.clone().subtract(block.tickStart).asFloat() * that.wholeTickWidth;
		var noteXEnd   = note.endTick  .clone().subtract(block.tickStart).asFloat() * that.wholeTickWidth;
		
		noteXStart = Math.max(noteXStart, 0);
		noteXEnd   = Math.min(noteXEnd,   block.width);
		
		var midiPitchOffset = note.midiPitch - midiPitchMin;
		var noteYTop = block.trackNoteYEnd - (midiPitchOffset + 1) * that.noteHeight;
		
		var noteRelativePitch = (note.midiPitch + 12 - block.key.tonicMidiPitch) % 12;
		var noteDegree = Theory.findPitchDegree(block.key.scaleIndex, noteRelativePitch, that.usePopularNotation);
		var noteColor = Theory.getDegreeColor(noteDegree);
		var noteColorAccent = Theory.getDegreeColorAccent(noteDegree);
		
		var noteX = block.x + noteXStart + that.noteSideMargin;
		var noteY = block.y + noteYTop;
		var noteW = noteXEnd - noteXStart - that.noteSideMargin * 2;
		var noteH = that.noteHeight;
			
		var svgNote = that.addSvgNode(
			"editorDegree" + (note.editorData.selected ? "Selected" : ""),
			"rect", { x: noteX, y: noteY, width: noteW, height: noteH });
			
		svgNote.style.fill = (note.editorData.selected ? noteColorAccent : noteColor);
		svgNote.style.stroke = noteColor;
		
		block.elements.push({ note: note, x: noteX, y: noteY, width: noteW, height: noteH });
	});
	
	// Render chords.
	this.song.chords.enumerateOverlappingRange(block.tickStart, block.tickEnd, function (chord)
	{
		var chordXStart = chord.startTick.clone().subtract(block.tickStart).asFloat() * that.wholeTickWidth;
		var chordXEnd   = chord.endTick  .clone().subtract(block.tickStart).asFloat() * that.wholeTickWidth;
		
		chordXStart = Math.max(chordXStart, 0);
		chordXEnd   = Math.min(chordXEnd,   block.width);
		
		var chordRelativePitch = (chord.rootMidiPitch + 12 - block.key.tonicMidiPitch) % 12;
		var chordDegree = Theory.findPitchDegree(block.key.scaleIndex, chordRelativePitch, that.usePopularNotation);
		var chordColor = Theory.getDegreeColor(chordDegree);
		var chordColorAccent = Theory.getDegreeColorAccent(chordDegree);
		
		var chordX = block.x + chordXStart + that.chordSideMargin;
		var chordY = block.y + block.trackChordYStart;
		var chordW = chordXEnd - chordXStart - that.chordSideMargin * 2;
		var chordH = block.trackChordYEnd - block.trackChordYStart;
		
		that.addSvgNode("editorChordBackground",
			"rect", { x: chordX, y: chordY, width: chordW, height: chordH });
			
		block.elements.push({ chord: chord, x: chordX, y: chordY, width: chordW, height: chordH });
		
		var svgChordOrnament1 = that.addSvgNode("editorDegree" + (chord.editorData.selected ? "Selected" : ""),
			"rect",
			{
				x: block.x + chordXStart + that.chordSideMargin,
				y: block.y + block.trackChordYStart,
				width: chordXEnd - chordXStart - that.chordSideMargin * 2,
				height: that.chordOrnamentHeight
			});
		
		var svgChordOrnament2 = that.addSvgNode("editorDegree" + (chord.editorData.selected ? "Selected" : ""),
			"rect",
			{
				x: block.x + chordXStart + that.chordSideMargin,
				y: block.y + block.trackChordYEnd - that.chordOrnamentHeight,
				width: chordXEnd - chordXStart - that.chordSideMargin * 2,
				height: that.chordOrnamentHeight
			});
			
		svgChordOrnament1.style.fill = (chord.editorData.selected ? chordColorAccent : chordColor);
		svgChordOrnament1.style.stroke = chordColor;
		svgChordOrnament2.style.fill = (chord.editorData.selected ? chordColorAccent : chordColor);
		svgChordOrnament2.style.stroke = chordColor;
		
		// Build and add the chord label.
		var chordLabel = Theory.getChordLabelMain(
			block.key.scaleIndex, chord.chordKindIndex, chordRelativePitch, chord.embelishments, that.usePopularNotation); 
		var chordLabelSuperscript = Theory.getChordLabelSuperscript(
			block.key.scaleIndex, chord.chordKindIndex, chordRelativePitch, chord.embelishments, that.usePopularNotation); 
		
		var svgChordLabel = that.addSvgTextComplemented(
			"editorChordLabel",
			"editorChordLabelSuperscript",
			chordLabel,
			chordLabelSuperscript,
			{
				x: block.x + chordXStart + (chordXEnd - chordXStart) / 2,
				y: block.y + (block.trackChordYStart + block.trackChordYEnd) / 2
			});
		
		// Narrow text if it overflows the space.
		if (svgChordLabel.getComputedTextLength() > chordXEnd - chordXStart)
		{
			editSvgNode(svgChordLabel,
			{
				textLength: chordXEnd - chordXStart,
				lengthAdjust: "spacingAndGlyphs"
			});
		}
	});
	
	// Render cursor selection.
	var cursorTickMin = this.cursorTick1.clone().min(this.cursorTick2);
	var cursorTickMax = this.cursorTick1.clone().max(this.cursorTick2);
	var cursorTrackMin = Math.min(this.cursorTrack1, this.cursorTrack2);
	var cursorTrackMax = Math.max(this.cursorTrack1, this.cursorTrack2);
	
	if (this.cursorVisible &&
		cursorTickMin.compare(block.tickEnd) < 0 &&
		cursorTickMax.compare(block.tickStart) > 0)
	{
		var selectionXStart = cursorTickMin.clone().subtract(block.tickStart).asFloat() * this.wholeTickWidth;
		var selectionXEnd   = cursorTickMax.clone().subtract(block.tickStart).asFloat() * this.wholeTickWidth;
		
		selectionXStart = Math.max(selectionXStart, 0);
		selectionXEnd   = Math.min(selectionXEnd,   block.width);
		
		var selectionYStart = block.trackNoteYStart;
		if (cursorTrackMin == 1)
			selectionYStart = block.trackChordYStart;
		
		var selectionYEnd = block.trackNoteYEnd;
		if (cursorTrackMax == 1)
			selectionYEnd = block.trackChordYEnd;
		
		this.addSvgNode("editorBlockSelection", "rect",
		{
			x: block.x + selectionXStart,
			y: block.y + selectionYStart,
			width: selectionXEnd - selectionXStart,
			height: selectionYEnd - selectionYStart
		});
	}
		
	// Render key change.
	if (block.key.tick.compare(block.tickStart) == 0)
	{
		that.addSvgNode("editorKeyLine", "line",
		{
			x1: block.x,
			y1: block.y + (block.trackKeyChangeYStart + block.trackKeyChangeYEnd) / 2,
			x2: block.x,
			y2: block.y + block.trackChordYEnd
		});
		
		that.addSvgNode(
			"editorKeyHandle" + (block.key.editorData.selected ? "Selected" : ""),
			"rect",
			{
				x: block.x - this.handleSize / 2,
				y: block.y + (block.trackKeyChangeYStart + block.trackKeyChangeYEnd) / 2 - 1 - this.handleSize / 2,
				width: this.handleSize,
				height: this.handleSize
			});
		
		that.addSvgText("editorKeyLabel", block.key.getLabel(),
		{
			x: block.x + this.handleSize / 2 + 5,
			y: block.y + (block.trackKeyChangeYStart + block.trackKeyChangeYEnd) / 2
		});
		
		block.elements.push(
		{
			keyChange: block.key,
			x: block.x - this.handleSize / 2,
			y: block.y + (block.trackKeyChangeYStart + block.trackKeyChangeYEnd) / 2 - 1 - this.handleSize / 2,
			width: this.handleSize * 2,
			height: this.handleSize
		});
	}
	
	// Render meter change.
	if (block.meter.tick.compare(block.tickStart) == 0)
	{
		that.addSvgNode("editorMeterLine", "line",
		{
			x1: block.x,
			y1: block.y + (block.trackMeterChangeYStart + block.trackMeterChangeYEnd) / 2,
			x2: block.x,
			y2: block.y + block.trackChordYEnd
		});
		
		that.addSvgNode(
			"editorMeterHandle" + (block.meter.editorData.selected ? "Selected" : ""),
			"rect",
			{
				x: block.x - this.handleSize / 2,
				y: block.y + (block.trackMeterChangeYStart + block.trackMeterChangeYEnd) / 2 - 1 - this.handleSize / 2,
				width: this.handleSize,
				height: this.handleSize
			});
		
		that.addSvgText("editorMeterLabel", block.meter.getLabel(),
		{
			x: block.x + this.handleSize / 2 + 5,
			y: block.y + (block.trackMeterChangeYStart + block.trackMeterChangeYEnd) / 2
		});
		
		block.elements.push(
		{
			meterChange: block.meter,
			x: block.x - this.handleSize,
			y: block.y + (block.trackMeterChangeYStart + block.trackMeterChangeYEnd) / 2 - 1 - this.handleSize / 2,
			width: this.handleSize * 2,
			height: this.handleSize * 2
		});
	}
	
	
	return block;
}


Editor.prototype.addSvgNode = function(cl, kind, attributes)
{
	var node = makeSvgNode(kind, attributes);
	node.setAttribute("class", cl);
	this.svg.appendChild(node);
	return node;
}


Editor.prototype.addSvgText = function(cl, text, attributes)
{
	var node = makeSvgNode("text", attributes);
	node.setAttribute("class", cl);
	node.innerHTML = text;
	this.svg.appendChild(node);
	return node;
}


Editor.prototype.addSvgTextComplemented = function(cl, clSuperscript, text, textSuperscript, attributes)
{
	var nodeSuperscript = makeSvgNode("tspan", { "baseline-shift": "super" });
	nodeSuperscript.setAttribute("class", clSuperscript);
	nodeSuperscript.innerHTML = textSuperscript;
	
	var node = makeSvgNode("text", attributes);
	node.setAttribute("class", cl);
	node.innerHTML = text;
	
	node.appendChild(nodeSuperscript);
	this.svg.appendChild(node);
	return node;
}


function makeSvgNode(kind, attributes)
{
	var node = document.createElementNS("http://www.w3.org/2000/svg", kind);
	for (var attr in attributes)
		node.setAttributeNS(null, attr, attributes[attr]);
	return node;
}


function editSvgNode(node, attributes)
{
	for (var attr in attributes)
		node.setAttributeNS(null, attr, attributes[attr]);
}