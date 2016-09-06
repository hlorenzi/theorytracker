Timeline.prototype.handleKeyDown = function(ev)
{
	var that = this;

	var ctrl  = ev.ctrlKey;
	var shift = ev.shiftKey;
	var alt   = ev.altKey;
	
	//ev.preventDefault();
	
	switch (ev.keyCode)
	{
		// Enter
		case 13:
		// Esc
		case 27:
		{
			this.interactionEnd();
			
			var elementEndTime = this.getSelectedElementsTimeRange();
			if (elementEndTime != null)
				this.setCursorBoth(elementEndTime.end, elementEndTime.end, this.cursorTrack1,this.cursorTrack2);
			else
				this.setCursorBoth(this.cursorTime1, this.cursorTime1, this.cursorTrack1, this.cursorTrack2);
			
			this.showCursor();
			this.scrollTimeIntoView(this.cursorTime1);
			this.unselectAll();
			break;
		}
		
		// Space
		case 32:
		{
			this.keyboardHoldSpace = true;
			break;
		}
		
		// Backspace
		case 8:
		{
			var eraseToTime = 0;
			
			var time1 = Math.min(this.cursorTime1, this.cursorTime2);
			var time2 = Math.max(this.cursorTime1, this.cursorTime2);
			var track1 = Math.min(this.cursorTrack1, this.cursorTrack2);
			var track2 = Math.max(this.cursorTrack1, this.cursorTrack2);
			
			this.unselectAll();
			
			if (this.cursorTime1 == this.cursorTime2)
			{
				for (var i = track1; i <= track2; i++)
				{
					eraseToTime = Math.max(
						this.tracks[i].getBackspaceTime(this.cursorTime1),
						eraseToTime);
				}
				
				for (var i = track1; i <= track2; i++)
				{
					this.tracks[i].clipRange(new TimeRange(eraseToTime, this.cursorTime1));
					this.tracks[i].sanitize();
				}
				
				this.showCursor();
				this.setCursorBoth(eraseToTime, eraseToTime, this.cursorTrack1, this.cursorTrack2);
				this.scrollTimeIntoView(eraseToTime);
			}
			else
			{
				for (var i = track1; i <= track2; i++)
				{
					this.tracks[i].clipRange(new TimeRange(time1, time2));
					this.tracks[i].sanitize();
				}
				
				this.showCursor();
				this.setCursorBoth(time1, time1, this.cursorTrack1, this.cursorTrack2);
				this.scrollTimeIntoView(time1);
			}
			
			break;
		}
		
		// Delete
		case 46:
		{
			for (var i = 0; i < this.selectedElements.length; i++)
			{
				var elem = this.selectedElements[i];
				
				if (!elem.selected)
					return;
				
				elem.unselect();
				this.markDirtyElement(elem);
				elem.remove();
			}
			
			for (var i = 0; i < this.tracks.length; i++)
				this.tracks[i].sanitize();
			
			this.selectedElements = [];			
			break;
		}
		
		// Left arrow
		case 37:
		{
			if (alt)
			{
				this.setScrollTime(this.scrollTime - this.TIME_PER_WHOLE_NOTE);
			}
			else if (shift && this.cursorVisible)
			{
				this.setCursor2(
					this.cursorTime2 - this.timeSnap,
					this.cursorTrack2);
					
				this.scrollTimeIntoView(this.cursorTime2);
			}
			else if (this.selectedElements.length == 0)
			{
				this.setCursorBoth(
					this.cursorTime1 - this.timeSnap,
					this.cursorTime1 - this.timeSnap,
					this.cursorTrack1,
					this.cursorTrack2);
					
				this.scrollTimeIntoView(this.cursorTime1);
			}
			else
			{
				if (ctrl)
				{
					if (this._beginKeyboardAction(this.INTERACT_STRETCH_TIME_R))
						this.interactionBeginStretchTimeR(this.getSelectedElementsTimeRange().end);
					
					if (this.action == this.INTERACT_STRETCH_TIME_R)
						this.interactionUpdateStretchTime(this.actionMoveDeltaTime - this.timeSnap);
				}
				else
				{
					if (this._beginKeyboardAction(this.INTERACT_MOVE_TIME))
						this.interactionBeginMoveTime();
					
					if (this.action == this.INTERACT_MOVE_TIME)
					{
						this.interactionUpdateMoveTime(this.actionMoveDeltaTime - this.timeSnap);
						this.scrollTimeIntoView(this.actionMoveDeltaTime + this.getSelectedElementsTimeRange().start);
					}
				}
			}
			
			break;
		}
		
		// Right arrow
		case 39:
		{
			if (alt)
			{
				this.setScrollTime(this.scrollTime + this.TIME_PER_WHOLE_NOTE);
			}
			else if (shift && this.cursorVisible)
			{
				this.setCursor2(
					this.cursorTime2 + this.timeSnap,
					this.cursorTrack2);
					
				this.scrollTimeIntoView(this.cursorTime2);
			}
			else if (this.selectedElements.length == 0)
			{
				this.setCursorBoth(
					this.cursorTime1 + this.timeSnap,
					this.cursorTime1 + this.timeSnap,
					this.cursorTrack1,
					this.cursorTrack2);
					
				this.scrollTimeIntoView(this.cursorTime1);
			}
			else
			{
				if (ctrl)
				{
					if (this._beginKeyboardAction(this.INTERACT_STRETCH_TIME_R))
						this.interactionBeginStretchTimeR(this.getSelectedElementsTimeRange().end);
					
					if (this.action == this.INTERACT_STRETCH_TIME_R)
						this.interactionUpdateStretchTime(this.actionMoveDeltaTime + this.timeSnap);
				}
				else
				{
					if (this._beginKeyboardAction(this.INTERACT_MOVE_TIME))
						this.interactionBeginMoveTime();
					
					if (this.action == this.INTERACT_MOVE_TIME)
					{
						this.interactionUpdateMoveTime(this.actionMoveDeltaTime + this.timeSnap);
						this.scrollTimeIntoView(this.actionMoveDeltaTime + this.getSelectedElementsTimeRange().end);
					}
				}
			}
			
			break;
		}
		
		// Up arrow
		case 38:
		{
			if (alt)
			{
				this.setScrollPitchAtBottom(
					this.getScrollPitchAtBottom() + 4);
			}
			else if (shift && this.cursorVisible)
			{
				this.setCursor2(
					this.cursorTime2,
					this.cursorTrack2 - 1);
			}
			else if (this.selectedElements.length == 0)
			{
				this.setCursorBoth(
					this.cursorTime1,
					this.cursorTime2,
					this.cursorTrack1 - 1,
					this.cursorTrack1 - 1);
			}
			else
			{
				if (this._beginKeyboardAction(this.INTERACT_MOVE_PITCH))
					this.interactionBeginMovePitch();
				
				if (this.action == this.INTERACT_MOVE_PITCH)
				{
					this.interactionUpdateMovePitch(this.actionMoveDeltaPitch + 1);
					
					var pitchRange = this.getSelectedElementsPitchRange();
					if (pitchRange.max != null)
						this.scrollPitchIntoView(this.actionMoveDeltaPitch + pitchRange.max.midiPitch);
				}
			}
			
			break;
		}
		
		// Down arrow
		case 40:
		{
			if (alt)
			{
				this.setScrollPitchAtBottom(
					this.getScrollPitchAtBottom() - 4);
			}
			else if (shift && this.cursorVisible)
			{
				this.setCursor2(
					this.cursorTime2,
					this.cursorTrack2 + 1);
			}
			else if (this.selectedElements.length == 0)
			{
				this.setCursorBoth(
					this.cursorTime1,
					this.cursorTime2,
					this.cursorTrack1 + 1,
					this.cursorTrack1 + 1);
			}
			else
			{
				if (this._beginKeyboardAction(this.INTERACT_MOVE_PITCH))
					this.interactionBeginMovePitch();
				
				if (this.action == this.INTERACT_MOVE_PITCH)
				{
					this.interactionUpdateMovePitch(this.actionMoveDeltaPitch - 1);
					
					var pitchRange = this.getSelectedElementsPitchRange();
					if (pitchRange.min != null)
						this.scrollPitchIntoView(this.actionMoveDeltaPitch + pitchRange.min.midiPitch);
				}
			}
			
			break;
		}
		
		//  S, D,    G, H, J,
		// Z, X, C, V, B, N, M
		case 90: { this._doPitchAction(theory.C);  break; }
		case 83: { this._doPitchAction(theory.Cs); break; }
		case 88: { this._doPitchAction(theory.D);  break; }
		case 68: { this._doPitchAction(theory.Ds); break; }
		case 67: { this._doPitchAction(theory.E);  break; }
		case 86: { this._doPitchAction(theory.F);  break; }
		case 71: { this._doPitchAction(theory.Fs); break; }
		case 66: { this._doPitchAction(theory.G);  break; }
		case 72: { this._doPitchAction(theory.Gs); break; }
		case 78: { this._doPitchAction(theory.A);  break; }
		case 74: { this._doPitchAction(theory.As); break; }
		case 77: { this._doPitchAction(theory.B);  break; }
	}
	
	this.hoverElement = null;
	this.hoverRegion  = null;
	this.redraw();
}


Timeline.prototype.handleKeyUp = function(ev)
{
	switch (ev.keyCode)
	{
		// Space
		case 32:
		{
			this.keyboardHoldSpace = false;
			break;
		}
	}
}


Timeline.prototype._beginKeyboardAction = function(action)
{
	if (this.action != action ||
		this.actionDevice != this.KEYBOARD)
	{
		this.interactionEnd();
		this.hideCursor();
		this.actionDevice = this.KEYBOARD;
		
		// Set action to a common action of
		// all selected elements.
		this.action = action;
		for (var i = 0; i < this.selectedElements.length; i++)
			this.action &= this.selectedElements[i].interactKind;
		
		if (this.action == action)
			return true;
	}
	
	return false;
}


Timeline.prototype._doPitchAction = function(pitch)
{
	this.interactionEnd();
	
	if (this.selectedElements.length != 0)
	{
		var elementEndTime = this.getSelectedElementsTimeRange();
		if (elementEndTime != null)
			this.setCursorBoth(elementEndTime.end, elementEndTime.end, this.cursorTrack1,this.cursorTrack2);
		else
			this.setCursorBoth(this.cursorTime1, this.cursorTime1, this.cursorTrack1, this.cursorTrack2);
		
		this.unselectAll();
	}
	
	if (this.cursorTrack1 == this.cursorTrack2 &&
		this.cursorTime1 == this.cursorTime2)
	{
		var time1 = this.cursorTime1;
		var time2 = time1 + this.createLastDuration;
		
		if (this.cursorTrack1 == this.trackNotesIndex)
		{
			var baseOctave = Math.floor(this.createLastPitch / 12) * 12;
			var distToOctaveAbove = Math.abs((baseOctave + 12 + pitch) - this.createLastPitch);
			var distToOctaveCur   = Math.abs((baseOctave      + pitch) - this.createLastPitch);
			var distToOctaveBelow = Math.abs((baseOctave - 12 + pitch) - this.createLastPitch);
			
			var nearestPitch = baseOctave + pitch;
			if (distToOctaveAbove < distToOctaveCur)
				nearestPitch = baseOctave + 12 + pitch;
			else if (distToOctaveBelow < distToOctaveCur)
				nearestPitch = baseOctave - 12 + pitch;
			
			nearestPitch =
				Math.max(this.MIN_VALID_MIDI_PITCH,
				Math.min(this.MAX_VALID_MIDI_PITCH,
				nearestPitch));
			
			this.createLastPitch = nearestPitch;
						
			var noteElem = this.trackNotes.noteAdd(
				new Note(
					new TimeRange(time1, time2),
					new Pitch(nearestPitch)));
					
			if (noteElem != null)
				this.select(noteElem);
			
			this.scrollTimeIntoView(time2);
			this.scrollPitchIntoView(nearestPitch);
			this.setCursor(time2, this.trackNotesIndex);
			
			this.synth.addNoteOn(0, 1, nearestPitch, 1);
			this.synth.addNoteOff(0.2, 1, nearestPitch);
		}
		
		else if (this.cursorTrack1 == this.trackChordsIndex)
		{
			var chordElem = this.trackChords.chordAdd(
				new Chord(
					new TimeRange(time1, time2),
					0,
					pitch));
					
			if (chordElem != null)
				this.select(chordElem);
			
			this.scrollTimeIntoView(time2);
			this.setCursor(time2, this.trackChordsIndex);
		}
	}
}