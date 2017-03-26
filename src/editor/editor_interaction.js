Editor.prototype.eventInit = function()
{
	var that = this;
	
	this.svg.onmousemove = function(ev) { that.eventMouseMove(ev); };
	this.svg.onmousedown = function(ev) { that.eventMouseDown(ev); };
	this.svg.onmouseout  = function(ev) { that.eventMouseOut (ev); };
	
	window.onmouseup = function(ev) { that.eventMouseUp(ev); };
	window.onkeydown = function(ev) { that.eventKeyDown(ev); };
}


Editor.prototype.isAnySelected = function()
{
	// TODO: Optimize.
	var anySelected = false;
	this.song.notes         .enumerateAll(function (item) { anySelected = anySelected || item.editorData.selected; });
	this.song.chords        .enumerateAll(function (item) { anySelected = anySelected || item.editorData.selected; });
	this.song.keyChanges    .enumerateAll(function (item) { anySelected = anySelected || item.editorData.selected; });
	this.song.meterChanges  .enumerateAll(function (item) { anySelected = anySelected || item.editorData.selected; });
	this.song.forcedMeasures.enumerateAll(function (item) { anySelected = anySelected || item.editorData.selected; });
	return anySelected;
}


Editor.prototype.isAnyIsolateElementSelected = function()
{
	// TODO: Optimize.
	var anySelected = false;
	this.song.keyChanges    .enumerateAll(function (item) { anySelected = anySelected || item.editorData.selected; });
	this.song.meterChanges  .enumerateAll(function (item) { anySelected = anySelected || item.editorData.selected; });
	this.song.forcedMeasures.enumerateAll(function (item) { anySelected = anySelected || item.editorData.selected; });
	return anySelected;
}


Editor.prototype.selectNone = function()
{
	// TODO: Optimize.
	this.song.notes         .enumerateAll(function (item) { item.editorData.selected = false; });
	this.song.chords        .enumerateAll(function (item) { item.editorData.selected = false; });
	this.song.keyChanges    .enumerateAll(function (item) { item.editorData.selected = false; });
	this.song.meterChanges  .enumerateAll(function (item) { item.editorData.selected = false; });
	this.song.forcedMeasures.enumerateAll(function (item) { item.editorData.selected = false; });
}


Editor.prototype.selectBetweenCursors = function()
{
	var tickMin = this.cursorTick1.clone().min(this.cursorTick2);
	var tickMax = this.cursorTick1.clone().max(this.cursorTick2);
	var trackMin = Math.min(this.cursorTrack1, this.cursorTrack2);
	var trackMax = Math.max(this.cursorTrack1, this.cursorTrack2);
	
	if (tickMin.compare(tickMax) == 0)
	{
		this.selectNone();
		return;
	}
	
	// TODO: Optimize.
	this.song.notes.enumerateAll(function (item)
	{
		item.editorData.selected =
			trackMin <= 0 && trackMax >= 0 &&
			item.startTick.compare(tickMax) < 0 &&
			item.endTick  .compare(tickMin) > 0;
	});
	
	this.song.chords.enumerateAll(function (item)
	{
		item.editorData.selected =
			trackMin <= 1 && trackMax >= 1 &&
			item.startTick.compare(tickMax) < 0 &&
			item.endTick  .compare(tickMin) > 0;
	});
}


Editor.prototype.enumerateSelectedNotes = function(callback)
{
	// TODO: Optimize.
	this.song.notes.enumerateAll(function(note)
	{
		if (note.editorData.selected)
			callback(note);
	});
}


Editor.prototype.enumerateSelectedChords = function(callback)
{
	// TODO: Optimize.
	this.song.chords.enumerateAll(function(chord)
	{
		if (chord.editorData.selected)
			callback(chord);
	});
}


Editor.prototype.enumerateSelectedKeyChanges = function(callback)
{
	// TODO: Optimize.
	this.song.keyChanges.enumerateAll(function(keyCh)
	{
		if (keyCh.editorData.selected)
			callback(keyCh);
	});
}


Editor.prototype.enumerateSelectedMeterChanges = function(callback)
{
	// TODO: Optimize.
	this.song.meterChanges.enumerateAll(function(meterCh)
	{
		if (meterCh.editorData.selected)
			callback(meterCh);
	});
}


Editor.prototype.enumerateSelectedForcedMeasures = function(callback)
{
	// TODO: Optimize.
	this.song.forcedMeasures.enumerateAll(function(forcedMeasure)
	{
		if (forcedMeasure.editorData.selected)
			callback(forcedMeasure);
	});
}


Editor.prototype.cursorIsRangeSelection = function()
{
	return this.cursorTick1.compare(this.cursorTick2) != 0;
}


Editor.prototype.cursorHide = function()
{
	this.cursorVisible = false;
}


Editor.prototype.cursorSetTickBoth = function(tick)
{
	this.cursorTick1 = tick.clone();
	this.cursorTick2 = tick.clone();
}


Editor.prototype.cursorSetTick2 = function(tick)
{
	this.cursorTick2 = tick.clone();
}


Editor.prototype.cursorSetTrackBoth = function(track)
{
	this.cursorTrack1 = track;
	this.cursorTrack2 = track;
}


Editor.prototype.cursorSetTrack2 = function(track)
{
	this.cursorTrack2 = track;
}


Editor.prototype.cursorSetTickAtSelectionStart = function()
{
	if (this.isAnySelected())
	{
		var tick = this.song.length.clone();
		
		this.enumerateSelectedNotes(function(note)
		{
			if (note.startTick.compare(tick) < 0)
				tick = note.startTick.clone();
		});
		
		this.enumerateSelectedChords(function(chord)
		{
			if (chord.startTick.compare(tick) < 0)
				tick = chord.startTick.clone();
		});
		
		this.enumerateSelectedKeyChanges(function(keyCh)
		{
			if (keyCh.tick.compare(tick) < 0)
				tick = keyCh.tick.clone();
		});
		
		this.enumerateSelectedMeterChanges(function(meterCh)
		{
			if (meterCh.tick.compare(tick) < 0)
				tick = meterCh.tick.clone();
		});
		
		this.enumerateSelectedForcedMeasures(function(forcedMeasure)
		{
			if (forcedMeasure.tick.compare(tick) < 0)
				tick = forcedMeasure.tick.clone();
		});
		
		this.cursorSetTickBoth(tick);
	}
}


Editor.prototype.cursorSetTickAtSelectionEnd = function()
{
	if (this.isAnySelected())
	{
		var tick = new Rational(0);
		
		this.enumerateSelectedNotes(function(note)
		{
			if (note.endTick.compare(tick) > 0)
				tick = note.endTick.clone();
		});
		
		this.enumerateSelectedChords(function(chord)
		{
			if (chord.endTick.compare(tick) > 0)
				tick = chord.endTick.clone();
		});
		
		this.enumerateSelectedKeyChanges(function(keyCh)
		{
			if (keyCh.tick.compare(tick) > 0)
				tick = keyCh.tick.clone();
		});
		
		this.enumerateSelectedMeterChanges(function(meterCh)
		{
			if (meterCh.tick.compare(tick) > 0)
				tick = meterCh.tick.clone();
		});
		
		this.enumerateSelectedForcedMeasures(function(forcedMeasure)
		{
			if (forcedMeasure.tick.compare(tick) > 0)
				tick = forcedMeasure.tick.clone();
		});
		
		this.cursorSetTickBoth(tick);
	}
}


Editor.prototype.cursorHidePlayback = function()
{
	this.updateSvgCursor(this.svgCursorPlayback, false, this.cursorTickPlayback, 0, 1);
}


Editor.prototype.cursorSetTickPlayback = function(tick)
{
	this.cursorTickPlayback = tick.clone();
	this.updateSvgCursor(this.svgCursorPlayback, true, this.cursorTickPlayback, 0, 1);
}


Editor.prototype.autoExtendSongLength = function()
{
	var newLength = this.cursorTick1.clone().add(new Rational(1));
	
	if (this.song.length.compare(newLength) < 0)
		this.song.length = newLength;
	
	var newLength = this.cursorTick2.clone().add(new Rational(1));
	
	if (this.song.length.compare(newLength) < 0)
		this.song.length = newLength;
}


Editor.prototype.eventMouseMove = function(ev)
{
	ev.preventDefault();
	
	if (this.isPlaying)
		return;
	
	var elemRect = this.svg.getBoundingClientRect();
	var mouseX = ev.clientX - elemRect.left;
	var mouseY = ev.clientY - elemRect.top;
	
	this.svg.style.cursor = "text";
		
	// Handle range selection.
	if (this.mouseIsDown && this.cursorVisible)
	{
		// Set cursor tick.
		var blockAtMouse = this.getBlockAt(mouseX, mouseY);
		
		var newCursorTick = new Rational(0);
		if (blockAtMouse != null)
			newCursorTick = this.getTickOffset(mouseX - blockAtMouse.x, this.cursorSnap).add(blockAtMouse.tickStart);
		
		this.cursorSetTick2(newCursorTick);
		
		// Set cursor track.
		var newCursorTrack = 0;
		if (blockAtMouse != null && mouseY > blockAtMouse.y + blockAtMouse.trackNoteYEnd)
			newCursorTrack = 1;
		
		this.cursorSetTrack2(newCursorTrack);
		
		
		this.selectBetweenCursors();
		this.autoExtendSongLength();
		this.refresh();
	}
	
	// Else, handle hovering cursor.
	else
	{
		var elementAtMouse = this.getElementAt(mouseX, mouseY);
		if (elementAtMouse != null)
		{
			if (elementAtMouse.note != undefined ||
				elementAtMouse.chord != undefined ||
				elementAtMouse.keyChange != undefined ||
				elementAtMouse.meterChange != undefined ||
				elementAtMouse.forcedMeasure != undefined)
				this.svg.style.cursor = "pointer";
		}
	}
}


Editor.prototype.eventMouseDown = function(ev)
{
	ev.preventDefault();
	document.activeElement.blur();
	
	if (this.isPlaying)
		return;
	
	var elemRect = this.svg.getBoundingClientRect();
	var mouseX = ev.clientX - elemRect.left;
	var mouseY = ev.clientY - elemRect.top;
	
	this.cursorVisible = true;
	this.sliceOverlapping();
	
	// Handle element selection.
	var elementAtMouse = this.getElementAt(mouseX, mouseY);
	
	if (!ev.ctrlKey)
		this.selectNone();
	
	if (!ev.shiftKey && elementAtMouse != null)
	{
		this.cursorVisible = false;
		
		if (elementAtMouse.note != undefined)
		{
			elementAtMouse.note.editorData.selected = !elementAtMouse.note.editorData.selected;
			Theory.playSampleNote(this.synth, elementAtMouse.note.midiPitch);
		}
		
		else if (elementAtMouse.chord != undefined)
		{
			elementAtMouse.chord.editorData.selected = !elementAtMouse.chord.editorData.selected;
			Theory.playSampleChord(
				this.synth,
				elementAtMouse.chord.chordKindIndex,
				elementAtMouse.chord.rootMidiPitch,
				elementAtMouse.chord.embelishments);
		}
		
		else if (elementAtMouse.keyChange != undefined)
			elementAtMouse.keyChange.editorData.selected = !elementAtMouse.keyChange.editorData.selected;
		
		else if (elementAtMouse.meterChange != undefined)
			elementAtMouse.meterChange.editorData.selected = !elementAtMouse.meterChange.editorData.selected;
		
		else if (elementAtMouse.forcedMeasure != undefined)
			elementAtMouse.forcedMeasure.editorData.selected = !elementAtMouse.forcedMeasure.editorData.selected;
	}
	
	// Set cursor tick.
	var blockAtMouse = this.getBlockAt(mouseX, mouseY);
	
	var newCursorTick = new Rational(0);
	if (blockAtMouse != null)
		newCursorTick = this.getTickOffset(mouseX - blockAtMouse.x, this.cursorSnap).add(blockAtMouse.tickStart);
	
	this.cursorSetTickBoth(newCursorTick);
	
	// Set cursor track.
	var newCursorTrack = 0;
	if (blockAtMouse != null && mouseY > blockAtMouse.y + blockAtMouse.trackNoteYEnd)
		newCursorTrack = 1;
	
	this.cursorSetTrackBoth(newCursorTrack);
	
	
	this.mouseIsDown = true;
	this.autoExtendSongLength();
	this.refresh();
}


Editor.prototype.eventMouseUp = function(ev)
{
	ev.preventDefault();
	
	if (this.isPlaying)
		return;
	
	var elemRect = this.svg.getBoundingClientRect();
	var mouseX = ev.clientX - elemRect.left;
	var mouseY = ev.clientY - elemRect.top;
	
	this.mouseIsDown = false;
}


Editor.prototype.eventMouseOut = function(ev)
{
	ev.preventDefault();
	
	if (this.isPlaying)
		return;
}


Editor.prototype.eventKeyDown = function(ev)
{
	var actionSelect  = ev.shiftKey;
	var actionSpeedUp = ev.altKey;
	var actionStretch = ev.ctrlKey;
	
	if (this.isPlaying)
	{
		switch (ev.keyCode)
		{
			// Space
			case 32:
			{
				this.togglePlay();
				break;
			}
			
			// Left arrow
			case 37:
			{
				this.play(this.cursorTickPlayback.clone().subtract(new Rational(1)).max(new Rational(0)));
				break;
			}
			
			// Right arrow
			case 39:
			{
				this.play(this.cursorTickPlayback.clone().add(new Rational(1)));
				break;
			}
			
			// Else, skip preventDefault() below.
			default: { return; }
		}
	}
	
	else
	{
		switch (ev.keyCode)
		{
			// Enter
			case 13:
			// Esc
			case 27:
			{
				this.performUnselectAction();
				break;
			}
			
			// Space
			case 32:
			{
				this.togglePlay();
				break;
			}
			
			// Backspace
			case 8:
			{
				this.performBackEraseAction();
				break;
			}
			
			// Delete
			case 46:
			{	
				this.performDeleteAction();
				break;
			}
			
			// Left arrow
			case 37:
			{
				if (this.isAnySelected() && !actionSelect)
				{
					this.cursorHide();
					
					if (actionStretch)
						this.performElementDurationChange((actionSpeedUp ? new Rational(1) : this.cursorSnap.clone()).negate());
					else
						this.performElementTimeChange((actionSpeedUp ? new Rational(1) : this.cursorSnap.clone()).negate());
				}
				else if (this.cursorVisible)
				{
					this.performCursorTimeChange((actionSpeedUp ? new Rational(1) : this.cursorSnap.clone()).negate(), !actionSelect);
				}
				
				break;
			}
			
			// Right arrow
			case 39:
			{
				if (this.isAnySelected() && !actionSelect)
				{
					this.cursorHide();
					
					if (actionStretch)
						this.performElementDurationChange(actionSpeedUp ? new Rational(1) : this.cursorSnap.clone());
					else
						this.performElementTimeChange(actionSpeedUp ? new Rational(1) : this.cursorSnap.clone());
				}
				else if (this.cursorVisible)
				{
					this.performCursorTimeChange(actionSpeedUp ? new Rational(1) : this.cursorSnap.clone(), !actionSelect);
				}
				
				break;
			}
			
			// Up arrow
			case 38:
			{
				if (this.isAnySelected() && !actionSelect)
				{
					this.cursorHide();
					this.performElementPitchChange(actionSpeedUp ? 12 : 1);
				}
				else if (this.cursorVisible)
				{
					this.performCursorTrackChange(-1, !actionSelect);
				}
				
				break;
			}
			
			// Down arrow
			case 40:
			{
				if (this.isAnySelected() && !actionSelect)
				{
					this.cursorHide();
					this.performElementPitchChange(actionSpeedUp ? -12 : -1);
				}
				else if (this.cursorVisible)
				{
					this.performCursorTrackChange(1, !actionSelect);
				}
				
				break;
			}
			
			//  S, D,    G, H, J,
			// Z, X, C, V, B, N, M
			case 90: { this.performInsertPitchAction(0);  break; }
			case 83: { this.performInsertPitchAction(1);  break; }
			case 88: { this.performInsertPitchAction(2);  break; }
			case 68: { this.performInsertPitchAction(3);  break; }
			case 67: { this.performInsertPitchAction(4);  break; }
			case 86: { this.performInsertPitchAction(5);  break; }
			case 71: { this.performInsertPitchAction(6);  break; }
			case 66: { this.performInsertPitchAction(7);  break; }
			case 72: { this.performInsertPitchAction(8);  break; }
			case 78: { this.performInsertPitchAction(9);  break; }
			case 74: { this.performInsertPitchAction(10); break; }
			case 77: { this.performInsertPitchAction(11); break; }
			
			// Else, skip preventDefault() below.
			default: { return; }
		}
	}
	
	ev.preventDefault();
}


Editor.prototype.performUnselectAction = function()
{
	this.cursorVisible = true;
	this.cursorSetTickAtSelectionEnd();
	
	this.sliceOverlapping();
	this.selectNone();
	this.autoExtendSongLength();
	this.refresh();
}


Editor.prototype.performDeleteAction = function()
{
	this.cursorVisible = true;
	this.cursorSetTickAtSelectionStart();
	
	var notesToDelete = [];
	this.enumerateSelectedNotes(function (note) { notesToDelete.push(note); });
	this.song.notes.removeList(notesToDelete);
	
	var chordsToDelete = [];
	this.enumerateSelectedChords(function (chord) { chordsToDelete.push(chord); });
	this.song.chords.removeList(chordsToDelete);
	
	var keyChangesToDelete = [];
	this.enumerateSelectedKeyChanges(function (keyCh) { keyChangesToDelete.push(keyCh); });
	this.song.keyChanges.removeList(keyChangesToDelete);
	
	var meterChangesToDelete = [];
	this.enumerateSelectedMeterChanges(function (meterCh) { meterChangesToDelete.push(meterCh); });
	this.song.meterChanges.removeList(meterChangesToDelete);
	
	var forcedMeasuresToDelete = [];
	this.enumerateSelectedForcedMeasures(function (forcedMeasure) { forcedMeasuresToDelete.push(forcedMeasure); });
	this.song.forcedMeasures.removeList(forcedMeasuresToDelete);
	
	this.selectNone();
	this.song.sanitize();
	this.refresh();
}


Editor.prototype.performBackEraseAction = function()
{
	var that = this;
	var tickMin = this.cursorTick1.clone().min(this.cursorTick2);
	var tickMax = this.cursorTick1.clone().max(this.cursorTick2);
	var trackMin = Math.min(this.cursorTrack1, this.cursorTrack2);
	var trackMax = Math.max(this.cursorTrack1, this.cursorTrack2);
	
	if (!this.cursorVisible)
	{
		this.performDeleteAction();
	}
	else if (this.cursorIsRangeSelection())
	{
		// Erase selected section.
		if (trackMin <= 0 && trackMax >= 0)
			this.eraseNotesAt(tickMin, tickMax);
		
		if (trackMin <= 1 && trackMax >= 1)
			this.eraseChordsAt(tickMin, tickMax);
		
		this.cursorSetTickBoth(tickMin);
	}
	else
	{
		// Find out where to move the cursor.
		var moveToTick = new Rational(0);
		
		if (trackMin <= 0 && trackMax >= 0)
		{
			var prevNote = this.song.notes.findPrevious(this.cursorTick1);
			if (prevNote != null)
			{
				if (prevNote.endTick.compare(this.cursorTick1) != 0)
					moveToTick.max(prevNote.endTick);
				
				else
				{
					this.song.notes.enumerateAll(function (note)
					{
						if (note.endTick.compare(that.cursorTick1) != 0)
							return;
						
						moveToTick.max(note.startTick);
					});
				}
			}
		}
		
		if (trackMin <= 1 && trackMax >= 1)
		{
			var prevChord = this.song.chords.findPrevious(this.cursorTick1);
			if (prevChord != null)
			{
				if (prevChord.endTick.compare(this.cursorTick1) != 0)
					moveToTick.max(prevChord.endTick);
				
				else
				{
					this.song.chords.enumerateAll(function (chord)
					{
						if (chord.endTick.compare(that.cursorTick1) != 0)
							return;
						
						moveToTick.max(chord.startTick);
					});
				}
			}
		}
		
		moveToTick.min(this.cursorTick1);
		
		// Erase section.
		if (trackMin <= 0 && trackMax >= 0)
			this.eraseNotesAt(moveToTick, this.cursorTick1);
		
		if (trackMin <= 1 && trackMax >= 1)
			this.eraseChordsAt(moveToTick, this.cursorTick1);
		
		this.cursorSetTickBoth(moveToTick);
	}
	
	this.cursorVisible = true;
	this.selectNone();
	this.refresh();
}


Editor.prototype.performCursorTimeChange = function(amount, both)
{
	var referenceTick = this.cursorTick2.clone();
	
	// Cap amount, in case cursor would fall
	// out of bounds.
	if (both)
	{
		if (amount.compare(new Rational(0)) < 0)
			referenceTick.min(this.cursorTick1);
		else
			referenceTick.max(this.cursorTick1);
		
		var minCap = referenceTick.clone().negate();
		if (minCap.compare(amount) > 0)
			amount = minCap;
	}
	else
	{
		var minCap = referenceTick.clone().negate();
		if (minCap.compare(amount) > 0)
			amount = minCap;
	}
	
	// Apply cursor movement.
	if (both)
		this.cursorSetTickBoth(referenceTick.add(amount));
	else
		this.cursorSetTick2(this.cursorTick2.clone().add(amount));
	
	if (!both)
		this.selectBetweenCursors();
	
	
	this.autoExtendSongLength();
	this.refresh();
}


Editor.prototype.performCursorTrackChange = function(amount, both)
{
	var referenceTrack = this.cursorTrack2;
	
	// Cap amount, in case cursor would fall
	// out of bounds.
	if (both)
	{
		if (amount < 0)
			referenceTrack = Math.min(referenceTrack, this.cursorTrack1);
		else
			referenceTrack = Math.max(referenceTrack, this.cursorTrack1);
		
		var minCap = -referenceTrack;
		var maxCap = 1 - referenceTrack;
		amount = Math.min(maxCap, Math.max(minCap, amount));
	}
	else
	{
		var minCap = -referenceTrack;
		var maxCap = 1 - referenceTrack;
		amount = Math.min(maxCap, Math.max(minCap, amount));
	}
	
	// Apply cursor movement.
	if (both)
		this.cursorSetTrackBoth(referenceTrack + amount);
	else
		this.cursorSetTrack2(this.cursorTrack2 + amount);
	
	if (!both)
		this.selectBetweenCursors();
	
	
	this.refresh();
}


Editor.prototype.performInsertPitchAction = function(midiPitch)
{
	this.cursorSetTickAtSelectionEnd();
	this.sliceOverlapping();
	this.selectNone();
	
	// Add a note.
	if (this.cursorTrack1 != this.cursorTrack2 ||
		this.cursorTrack1 == 0)
	{
		var note = new SongNote(
			this.cursorTick1.clone(),
			this.cursorTick1.clone().add(this.newElementDuration),
			0,
			midiPitch + 60,
			{ selected: true });
		
		this.song.notes.insert(note);
		
		this.synth.clear();
		this.synth.stop();
		Theory.playSampleNote(this.synth, midiPitch + 60);
		this.synth.play();
		
		this.cursorSetTrackBoth(0);
	}
	
	// Else, add a chord.
	else
	{
		var chord = new SongChord(
			this.cursorTick1.clone(),
			this.cursorTick1.clone().add(this.newElementDuration),
			0,
			midiPitch,
			[],
			{ selected: true });
		
		this.song.chords.insert(chord);
		
		this.synth.clear();
		this.synth.stop();
		Theory.playSampleChord(this.synth, 0, midiPitch, []);
		this.synth.play();
		
		this.cursorSetTrackBoth(1);
	}
	
	this.cursorSetTickBoth(this.cursorTick1.clone().add(this.newElementDuration));
	this.autoExtendSongLength();
	this.refresh();
}


Editor.prototype.performElementPitchChange = function(amount)
{
	// Cap amount, in case notes would fall
	// out of bounds.
	this.enumerateSelectedNotes(function(note)
	{
		if (note.midiPitch + amount > Theory.midiPitchMax)
			amount = Theory.midiPitchMax - note.midiPitch;
		
		else if (note.midiPitch + amount < Theory.midiPitchMin)
			amount = Theory.midiPitchMin - note.midiPitch;
	});
	
	// Apply changes to elements.
	var noteToSample = null;
	this.enumerateSelectedNotes(function(note)
	{
		note.midiPitch += amount;
		noteToSample = note;
	});
	
	var chordToSample = null;
	this.enumerateSelectedChords(function(chord)
	{
		chord.rootMidiPitch = (chord.rootMidiPitch + 12 + amount) % 12;
		chordToSample = chord;
	});
	
	// Play sample.
	if (noteToSample != null && chordToSample == null)
		Theory.playSampleNote(this.synth, noteToSample.midiPitch);
	
	if (chordToSample != null && noteToSample == null)
		Theory.playSampleChord(
			this.synth,
			chordToSample.chordKindIndex,
			chordToSample.rootMidiPitch,
			chordToSample.embelishments);
	
	this.refresh();
}


Editor.prototype.performElementTimeChange = function(amount)
{
	// Cap amount, in case notes would fall
	// out of bounds.
	this.enumerateSelectedNotes(function(note)
	{
		var minCap = note.startTick.clone().negate();
		
		if (minCap.compare(amount) > 0)
			amount = minCap;
	});
	
	this.enumerateSelectedChords(function(chord)
	{
		var minCap = chord.startTick.clone().negate();
		
		if (minCap.compare(amount) > 0)
			amount = minCap;
	});
	
	this.enumerateSelectedKeyChanges(function(keyCh)
	{
		var minCap = keyCh.tick.clone().negate();
		
		if (minCap.compare(amount) > 0)
			amount = minCap;
	});
	
	this.enumerateSelectedMeterChanges(function(meterCh)
	{
		var minCap = meterCh.tick.clone().negate();
		
		if (minCap.compare(amount) > 0)
			amount = minCap;
	});
	
	this.enumerateSelectedForcedMeasures(function(forcedMeasure)
	{
		var minCap = forcedMeasure.tick.clone().negate();
		
		if (minCap.compare(amount) > 0)
			amount = minCap;
	});
	
	// Apply changes to elements.
	this.enumerateSelectedNotes(function(note)
	{
		note.startTick.add(amount);
		note.endTick.add(amount);
	});
	
	this.enumerateSelectedChords(function(chord)
	{
		chord.startTick.add(amount);
		chord.endTick.add(amount);
	});
	
	this.enumerateSelectedKeyChanges(function(keyCh)
	{
		keyCh.tick.add(amount);
	});
	
	this.enumerateSelectedMeterChanges(function(meterCh)
	{
		meterCh.tick.add(amount);
	});
	
	this.enumerateSelectedForcedMeasures(function(forcedMeasure)
	{
		forcedMeasure.tick.add(amount);
	});
	
	this.song.sanitize();
	this.refresh();
}


Editor.prototype.performElementDurationChange = function(amount)
{
	var that = this;
	
	// Apply changes to elements.
	this.enumerateSelectedNotes(function(note)
	{
		var newEndTick = note.endTick.clone().add(amount);
		
		if (newEndTick.compare(note.startTick) > 0)
		{
			note.endTick = newEndTick;
			that.newElementDuration = note.endTick.clone().subtract(note.startTick);
		}
	});
	
	this.enumerateSelectedChords(function(chord)
	{
		var newEndTick = chord.endTick.clone().add(amount);
		
		if (newEndTick.compare(chord.startTick) > 0)
		{
			chord.endTick = newEndTick;
			that.newElementDuration = chord.endTick.clone().subtract(chord.startTick);
		}
	});
	
	
	this.refresh();
}


Editor.prototype.sliceOverlapping = function()
{
	// Remove selected elements temporarily from song.
	var selectedNotes = [];
	this.enumerateSelectedNotes(function(note) { selectedNotes.push(note); });
	this.song.notes.removeList(selectedNotes);
	
	var selectedChords = [];
	this.enumerateSelectedChords(function(chord) { selectedChords.push(chord); });
	this.song.chords.removeList(selectedChords);
	
	var selectedKeyChanges = [];
	this.enumerateSelectedKeyChanges(function(keyCh) { selectedKeyChanges.push(keyCh); });
	this.song.keyChanges.removeList(selectedKeyChanges);
	
	var selectedMeterChanges = [];
	this.enumerateSelectedMeterChanges(function(meterCh) { selectedMeterChanges.push(meterCh); });
	this.song.meterChanges.removeList(selectedMeterChanges);
	
	var selectedForcedMeasures = [];
	this.enumerateSelectedForcedMeasures(function(forcedMeasure) { selectedForcedMeasures.push(forcedMeasure); });
	this.song.forcedMeasures.removeList(selectedForcedMeasures);
	
	// Remove overlapping parts from song.
	for (var i = 0; i < selectedNotes.length; i++)
		this.eraseNotesAt(
			selectedNotes[i].startTick,
			selectedNotes[i].endTick,
			selectedNotes[i].midiPitch);
	
	for (var i = 0; i < selectedChords.length; i++)
		this.eraseChordsAt(
			selectedChords[i].startTick,
			selectedChords[i].endTick);
			
	for (var i = 0; i < selectedKeyChanges.length; i++)
		this.eraseKeyChangesAt(
			selectedKeyChanges[i].tick,
			selectedKeyChanges[i].tick);
			
	for (var i = 0; i < selectedMeterChanges.length; i++)
		this.eraseMeterChangesAt(
			selectedMeterChanges[i].tick,
			selectedMeterChanges[i].tick);
			
	for (var i = 0; i < selectedForcedMeasures.length; i++)
		this.eraseForcedMeasuresAt(
			selectedForcedMeasures[i].tick,
			selectedForcedMeasures[i].tick);
	
	// Reinsert selected elements.
	this.song.notes         .insertList(selectedNotes);
	this.song.chords        .insertList(selectedChords);
	this.song.keyChanges    .insertList(selectedKeyChanges);
	this.song.meterChanges  .insertList(selectedMeterChanges);
	this.song.forcedMeasures.insertList(selectedForcedMeasures);
}


Editor.prototype.eraseNotesAt = function(start, end, atMidiPitch = null)
{
	var overlappingNotes = [];
	var slicedNotes = [];
	
	this.song.notes.enumerateOverlappingRange(
		start, end,
		function (note)
		{
			if (atMidiPitch != null && atMidiPitch != note.midiPitch)
				return;
			
			overlappingNotes.push(note);
			
			var parts = sliceparts(
				note.startTick,
				note.endTick,
				start,
				end);
				
			for (var j = 0; j < parts.length; j++)
			{
				var newNote = note.clone();
				newNote.startTick = parts[j].start.clone();
				newNote.endTick = parts[j].end.clone();
				newNote.editorData = { selected: false };
				slicedNotes.push(newNote);
			}
		});
		
	this.song.notes.removeList(overlappingNotes);
	this.song.notes.insertList(slicedNotes);
}


Editor.prototype.eraseChordsAt = function(start, end)
{
	var overlappingChords = [];
	var slicedChords = [];
	
	this.song.chords.enumerateOverlappingRange(
		start, end,
		function (chord)
		{
			overlappingChords.push(chord);
			
			var parts = sliceparts(
				chord.startTick,
				chord.endTick,
				start,
				end);
				
			for (var j = 0; j < parts.length; j++)
			{
				var newChord = chord.clone();
				newChord.startTick = parts[j].start.clone();
				newChord.endTick = parts[j].end.clone();
				newChord.editorData = { selected: false };
				slicedChords.push(newChord);
			}
		});
		
	this.song.chords.removeList(overlappingChords);
	this.song.chords.insertList(slicedChords);
}


Editor.prototype.eraseKeyChangesAt = function(start, end)
{
	var overlappingKeyChanges = [];
	
	this.song.keyChanges.enumerateOverlappingRange(
		start, end,
		function (keyCh)
		{
			overlappingKeyChanges.push(keyCh);
		});
		
	this.song.keyChanges.removeList(overlappingKeyChanges);
}


Editor.prototype.eraseMeterChangesAt = function(start, end)
{
	var overlappingMeterChanges = [];
	
	this.song.meterChanges.enumerateOverlappingRange(
		start, end,
		function (meterCh)
		{
			overlappingMeterChanges.push(meterCh);
		});
		
	this.song.meterChanges.removeList(overlappingMeterChanges);
}


Editor.prototype.eraseForcedMeasuresAt = function(start, end)
{
	var overlappingForcedMeasures = [];
	
	this.song.forcedMeasures.enumerateOverlappingRange(
		start, end,
		function (forcedMeasure)
		{
			overlappingForcedMeasures.push(forcedMeasure);
		});
		
	this.song.forcedMeasures.removeList(overlappingForcedMeasures);
}