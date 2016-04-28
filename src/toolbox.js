function Toolbox(div, editor, theory, synth)
{
	this.editor = editor;
	this.theory = theory;
	this.synth = synth;
	
	this.div = div;
	this.playing = false;
	this.playTimer = null;
	this.playTimerRefresh = null;
	
	this.currentChordKind = 0;
	
	this.prepareControlsPanel();
	this.prepareKeyPanel();
	this.prepareMeterPanel();
	this.prepareChordsPanel();
	
	
	// Set up callbacks.
	var that = this;
	editor.addOnCursorChanged(function() { that.refresh(); });
	editor.addOnSelectionChanged(function() { that.refresh(); });
	
	this.refresh();
	
	/*
	this.inputBPM.onchange = function()
	{
		var bpm = parseInt(that.inputBPM.value);
		
		if (bpm != bpm) bpm = 120; // Test for NaN.
		if (bpm < 1) bpm = 1;
		if (bpm > 400) bpm = 400;
		bpm -= (bpm % 1);
		
		that.editor.songData.beatsPerMinute = bpm;
	}
	
	this.inputBPM.onblur = function()
	{
		that.inputBPM.value = that.editor.songData.beatsPerMinute;
	}
	
	this.buttonSave.onclick = function()
	{
		that.inputSave.value = that.editor.songData.save();
	}
	
	this.buttonLoad.onclick = function()
	{
		if (window.confirm("Overwrite the current song?"))
		{
			try
			{
				that.editor.songData.load(that.inputSave.value);
			}
			catch (err)
			{
				window.alert("There was an error with the input:\n\n" + err)
				that.editor.songData.clear();
			}
			
			that.editor.cursorTick = 0;
			that.editor.showCursor = true;
			that.editor.cursorZone = that.editor.CURSOR_ZONE_ALL;
			that.editor.unselectAll();
			that.editor.clearHover();
			that.editor.refreshRepresentation();
			that.editor.refreshCanvas();
			that.refresh();
		}
	}*/
}


Toolbox.prototype.prepareControlsPanel = function()
{
	var that = this;
	document.getElementById("toolboxPlayButton").onclick = function() { that.togglePlay(); };
	document.getElementById("toolboxRewindButton").onclick = function() { that.rewind(); };
}


Toolbox.prototype.prepareKeyPanel = function()
{
	var keyTonicSelect = document.getElementById("toolboxKeyTonicSelect");
	this.keyTonicOptions = [];
	for (var i = 0; i < 12; i++)
	{
		this.keyTonicOptions[i] = document.createElement("option");
		keyTonicSelect.appendChild(this.keyTonicOptions[i]);
	}
	
	var keyScaleSelect = document.getElementById("toolboxKeyScaleSelect");
	this.keyScaleOptions = [];
	var group = -1;
	var groupElement = null;
	for (var i = 0; i < this.theory.scales.length; i++)
	{
		if (group != this.theory.scales[i].group)
		{
			group = this.theory.scales[i].group;
			groupElement = document.createElement("optgroup");
			groupElement.label = this.theory.scaleGroups[group];
			keyScaleSelect.appendChild(groupElement);
		}
		
		this.keyScaleOptions[i] = document.createElement("option");
		this.keyScaleOptions[i].innerHTML = this.theory.scales[i].name;
		groupElement.appendChild(this.keyScaleOptions[i]);
	}
	
	var that = this;
	keyTonicSelect.onchange = function() { that.editKeyChange(); };
	keyScaleSelect.onchange = function() { that.editKeyChange(); };
	document.getElementById("toolboxKeyListenButton").onclick = function() { that.listenToKey(); };
	document.getElementById("toolboxKeyInsertButton").onclick = function() { that.insertKeyChange(); };
}


Toolbox.prototype.prepareMeterPanel = function()
{
	var meterNumeratorSelect = document.getElementById("toolboxMeterNumeratorSelect");
	this.meterNumeratorOptions = [];
	for (var i = 0; i < 20; i++)
	{
		this.meterNumeratorOptions[i] = document.createElement("option");
		this.meterNumeratorOptions[i].innerHTML = "" + (i + 1);
		meterNumeratorSelect.appendChild(this.meterNumeratorOptions[i]);
	}
	
	var meterDenominatorSelect = document.getElementById("toolboxMeterDenominatorSelect");
	this.meterDenominatorOptions = [];
	this.meterDenominators = [ 2, 4, 8, 16 ];
	for (var i = 0; i < this.meterDenominators.length; i++)
	{
		this.meterDenominatorOptions[i] = document.createElement("option");
		this.meterDenominatorOptions[i].innerHTML = "" + this.meterDenominators[i];
		meterDenominatorSelect.appendChild(this.meterDenominatorOptions[i]);
	}
	
	var that = this;
	meterNumeratorSelect.onchange = function() { that.editMeterChange(); };
	meterDenominatorSelect.onchange = function() { that.editMeterChange(); };
	document.getElementById("toolboxMeterInsertButton").onclick = function() { that.insertMeterChange(); };
}


Toolbox.prototype.prepareChordsPanel = function()
{
	var divKinds = document.getElementById("toolboxChordKindsDiv");
	var divEmbelishments = document.getElementById("toolboxChordEmbelishDiv");
	
	var that = this;
	var makeChangeKindFunction = function(index)
	{
		return function()
		{
			that.currentChordKind = index;
			that.refreshChordsPanel();
		}
	}
	
	this.chordOptions = [];
	for (var i = 0; i < this.theory.chords.length + 1; i++)
	{
		this.chordOptions[i] = document.createElement("button");
		
		var text;
		if (i == 0)
			text = "In Key";
		else
		{
			text = (this.theory.chords[i - 1].uppercase ? "I" : "i");
			text += "<sup>" + this.theory.chords[i - 1].symbolSup + "</sup>";
			text += "<sub>" + this.theory.chords[i - 1].symbolSub + "</sub>";
		}
		
		this.chordOptions[i].innerHTML = text;
		this.chordOptions[i].className = "toolboxChordKindButton";
		this.chordOptions[i].onclick = makeChangeKindFunction(i);
		
		divKinds.appendChild(this.chordOptions[i]);
		
		if (i == 0 ||
			(i % Math.floor(this.theory.chords.length / 2)) == 0)
		{
			divKinds.appendChild(document.createElement("br"));
		}
	}
	
	this.currentChordKind = 0;
	this.chordOptions[this.currentChordKind].style.border = "2px solid #ff0000";
	
	this.chordEmbelishmentOptions = [];
	for (var i = 0; i < this.theory.chordEmbelishments.length; i++)
	{
		var text = this.theory.chordEmbelishments[i].symbol;
			
		var label = document.createElement("label");
		label.className = "toolboxLabel";
		
		this.chordEmbelishmentOptions[i] = document.createElement("input");
		this.chordEmbelishmentOptions[i].type = "checkbox";
		this.chordEmbelishmentOptions[i].onclick = function() { that.refreshChordsPanel(); };
		
		label.appendChild(this.chordEmbelishmentOptions[i]);
		label.appendChild(document.createTextNode(text));
		divEmbelishments.appendChild(label);
		
		divEmbelishments.appendChild(document.createElement("br"));
	}
}


Toolbox.prototype.refreshKeyPanel = function()
{
	var div = document.getElementById("toolboxKeyDiv");
	div.style.visibility = "hidden";
	
	var keyChange = this.editor.getKeyAtTick(this.editor.cursorTick);
	if (keyChange != null)
	{
		var scaleIndex = 0;
		for (var i = 0; i < this.theory.scales.length; i++)
		{
			if (keyChange.scale == this.theory.scales[i])
			{
				scaleIndex = i;
				break;
			}
		}
		
		document.getElementById("toolboxKeyScaleSelect").selectedIndex = scaleIndex;
		
		for (var i = 0; i < 12; i++)
		{
			this.keyTonicOptions[i].innerHTML = this.theory.getNameForPitch(i, keyChange.scale, keyChange.tonicPitch);
		}
		
		document.getElementById("toolboxKeyTonicSelect").selectedIndex = keyChange.tonicPitch;
		div.style.visibility = "visible";
	}	
}


Toolbox.prototype.refreshMeterPanel = function()
{
	var div = document.getElementById("toolboxMeterDiv");
	div.style.visibility = "hidden";
	
	var meterChange = this.editor.getMeterAtTick(this.editor.cursorTick);
	if (meterChange != null)
	{
		document.getElementById("toolboxMeterNumeratorSelect").selectedIndex = meterChange.numerator - 1;
		
		var denominatorIndex = 0;
		if (meterChange.denominator == 2) denominatorIndex = 0;
		else if (meterChange.denominator == 4) denominatorIndex = 1;
		else if (meterChange.denominator == 8) denominatorIndex = 2;
		else if (meterChange.denominator == 16) denominatorIndex = 3;
		document.getElementById("toolboxMeterDenominatorSelect").selectedIndex = denominatorIndex;
		
		div.style.visibility = "visible";
	}
}


Toolbox.prototype.refreshNotesPanel = function()
{
	var div = document.getElementById("toolboxNotesDiv"); 
	div.style.visibility = "hidden";
		
	var keyChange = this.editor.getKeyAtTick(this.editor.cursorTick);
	if (keyChange == null)
		return;
	
	div.style.visibility = "visible";
	
	var that = this;
	for (var i = 0; i < 12; i++)
	{
		var button = document.getElementById("toolboxNote" + i);
		
		var pitch = (i + keyChange.tonicPitch) % 12;
		button.innerHTML = this.theory.getNameForPitch(pitch, keyChange.scale, keyChange.tonicPitch);
		
		var degree = this.theory.getDegreeForPitch(pitch, keyChange.scale, keyChange.tonicPitch);
		
		if ((degree % 1) == 0)
		{
			var color = this.theory.getColorForDegree(degree);
			button.style.background = color;
			button.style.color = "#000000";
		}
		else
		{
			button.style.background = "#dddddd";
			button.style.color = "#888888";
		}
		
		button.onclick = function(pitch) { var innerPitch = pitch; return function() { that.insertNote(innerPitch); }; }(pitch + 60);
	}
}


Toolbox.prototype.refreshChordsPanel = function()
{
	var div = document.getElementById("toolboxChordsDiv"); 
	div.style.visibility = "hidden";
		
	var keyChange = this.editor.getKeyAtTick(this.editor.cursorTick);
	if (keyChange == null)
		return;
	
	div.style.visibility = "visible";
	
	var that = this;
	var refreshChordButton = function(theory, button, key, chord, rootPitch)
	{
		var degree = theory.getDegreeForPitch(rootPitch, key.scale, key.tonicPitch);
		var color = theory.getColorForDegree(degree);
		var numeral = theory.getRomanNumeralForPitch(rootPitch, key.scale, key.tonicPitch);
		
		var romanText = (chord.uppercase ? numeral : numeral.toLowerCase());
		romanText += "<sup style='font-size:50%'>" + chord.symbolSup + "</sup>";
		romanText += "<sub style='font-size:50%'>" + chord.symbolSub + "</sub>";
		
		button.innerHTML = romanText;
		button.style.borderColor = color;
		button.style.visibility = "visible";
		
		if ((degree % 1) == 0)
		{
			button.style.borderColor = color;
			button.style.color = "#000000";
		}
		else
		{
			button.style.borderColor = "#dddddd";
			button.style.color = "#888888";
		}
		
		button.onclick = function() { that.insertChord(chord, rootPitch); };
	}
	
	for (var i = 0; i < 12; i++)
		document.getElementById("toolboxChord" + i).style.visibility = "hidden";
	
	
	var embelishmentIndices = [];
	for (var i = 0; i < this.chordEmbelishmentOptions.length; i++)
	{
		if (this.chordEmbelishmentOptions[i].checked)
			embelishmentIndices.push(i);
	}
	
	// "In Key" kind.
	if (this.currentChordKind == 0)
	{
		for (var i = 0; i < 7; i++)
		{
			var pitch1 = keyChange.tonicPitch + keyChange.scale.pitches[i];
			
			var pitch2 = keyChange.tonicPitch + keyChange.scale.pitches[(i + 2) % 7];
			if ((i + 2) >= 7)
				pitch2 += 12;
			
			var pitch3 = keyChange.tonicPitch + keyChange.scale.pitches[(i + 4) % 7];
			if ((i + 4) >= 7)
				pitch3 += 12;
			
			var chordIndex = this.theory.getFirstFittingChordIndexForPitches([pitch1, pitch2, pitch3]);
			var chord = this.theory.getEmbelishedChord(chordIndex, embelishmentIndices);
			
			refreshChordButton(this.theory, document.getElementById("toolboxChord" + i), keyChange, chord, pitch1);
		}
	}
	// Other chord kinds.
	else
	{
		var inKeyIndex = 0;
		var outOfKeyIndex = 7;
		var buttonIndices = [0, 7, 1, 8, 2, 3, 9, 4, 10, 5, 11, 6];
		
		for (var i = 0; i < 12; i++)
		{
			var rootPitch = (keyChange.tonicPitch + i) % 12;
			var chordIndex = this.currentChordKind - 1;
			var chord = this.theory.getEmbelishedChord(chordIndex, embelishmentIndices);
			
			// FIXME: Coloration for flat/sharp degrees is irregular for different scales.
			refreshChordButton(this.theory, document.getElementById("toolboxChord" + buttonIndices[i]), keyChange, chord, rootPitch);
		}
	}
	
	for (var i = 0; i < this.chordOptions.length; i++)
		this.chordOptions[i].style.border = "2px solid #ffffff";
	
	this.chordOptions[this.currentChordKind].style.border = "2px solid #ff0000";
}


Toolbox.prototype.refresh = function()
{
	document.getElementById("toolboxPlayButton").innerHTML = (this.playing ? "&#9632; Stop" : "&#9654; Play");
	
	if (this.playing)
		return;
	
	this.refreshKeyPanel();
	this.refreshMeterPanel();
	this.refreshNotesPanel();
	this.refreshChordsPanel();
}


Toolbox.prototype.insertNote = function(pitch)
{
	if (this.playing)
		return;
	
	this.theory.playNoteSample(this.synth, pitch);
	var note = new SongDataNote(this.editor.cursorTick, this.editor.songData.ticksPerWholeNote / 4, pitch);
	this.editor.songData.addNote(note);
	this.editor.cursorTick += this.editor.songData.ticksPerWholeNote / 4;
	this.editor.showCursor = true;
	this.editor.cursorZone = this.editor.CURSOR_ZONE_NOTES;
	this.editor.unselectAll();
	this.editor.refreshRepresentation();
	this.editor.refreshCanvas();
	this.refresh();
}


Toolbox.prototype.insertChord = function(chord, pitch)
{
	if (this.playing)
		return;
	
	this.theory.playChordSample(this.synth, chord, pitch);
	var songChord = new SongDataChord(this.editor.cursorTick, this.editor.songData.ticksPerWholeNote / 2, chord, pitch);
	this.editor.songData.addChord(songChord);
	this.editor.cursorTick += this.editor.songData.ticksPerWholeNote / 2;
	this.editor.showCursor = true;
	this.editor.cursorZone = this.editor.CURSOR_ZONE_CHORDS;
	this.editor.unselectAll();
	this.editor.refreshRepresentation();
	this.editor.refreshCanvas();
	this.refresh();
}


Toolbox.prototype.listenToKey = function()
{
	var keyChange = this.editor.getKeyAtTick(this.editor.cursorTick);
	this.theory.playScaleSample(this.synth, keyChange.scale, keyChange.tonicPitch);
}


Toolbox.prototype.editKeyChange = function()
{
	if (this.playing)
		return;
	
	var keyChange = this.editor.getKeyAtTick(this.editor.cursorTick);
	if (keyChange == null)
		return;
	
	var keyTonicSelect = document.getElementById("toolboxKeyTonicSelect");
	var keyScaleSelect = document.getElementById("toolboxKeyScaleSelect");
	
	keyChange.scale = this.theory.scales[keyScaleSelect.selectedIndex];
	keyChange.tonicPitch = keyTonicSelect.selectedIndex;
	
	this.editor.refreshRepresentation();
	this.editor.selectKeyChange(keyChange);
	this.editor.refreshCanvas();
	this.refresh();
}


Toolbox.prototype.insertKeyChange = function()
{
	if (this.playing)
		return;
	
	var keyChange = new SongDataKeyChange(this.editor.cursorTick, this.theory.scales[0], this.theory.C);
	this.editor.songData.addKeyChange(keyChange);
	this.editor.unselectAll();
	this.editor.refreshRepresentation();
	this.editor.selectKeyChange(keyChange);
	this.editor.refreshCanvas();
	this.refresh();
}


Toolbox.prototype.editMeterChange = function()
{
	if (this.playing)
		return;
	
	var meterChange = this.editor.getMeterAtTick(this.editor.cursorTick);
	if (meterChange == null)
		return;
	
	var meterNumeratorSelect = document.getElementById("toolboxMeterNumeratorSelect");
	var meterDenominatorSelect = document.getElementById("toolboxMeterDenominatorSelect");
	
	meterChange.numerator = meterNumeratorSelect.selectedIndex + 1;
	meterChange.denominator = this.meterDenominators[meterDenominatorSelect.selectedIndex];
	
	this.editor.refreshRepresentation();
	this.editor.selectMeterChange(meterChange);
	this.editor.refreshCanvas();
	this.refresh();
}


Toolbox.prototype.insertMeterChange = function()
{
	if (this.playing)
		return;
	
	var meterChange = new SongDataMeterChange(this.editor.cursorTick, 4, 4);
	this.editor.songData.addMeterChange(meterChange);
	this.editor.unselectAll();
	this.editor.refreshRepresentation();
	this.editor.selectMeterChange(meterChange);
	this.editor.refreshCanvas();
	this.refresh();
}


Toolbox.prototype.togglePlay = function()
{
	this.playing = !this.playing;
	this.editor.setInteractionEnabled(!this.playing);
	
	this.editor.cursorTick = Math.floor(this.editor.cursorTick / this.editor.tickSnap) * this.editor.tickSnap;
	this.editor.showCursor = true;
	this.editor.unselectAll();
	this.editor.clearHover();
	this.editor.refreshRepresentation();
	this.editor.refreshCanvas();
	this.refresh();
	
	this.synth.stopAll();
	if (this.playing)
	{
		this.editor.cursorZone = this.editor.CURSOR_ZONE_ALL;
		
		var that = this;
		this.playTimer = setInterval(function() { that.processPlayback(); }, 1000 / 60);
		this.playTimerRefresh = setInterval(function() { that.processPlaybackRefresh(); }, 1000 / 15);
	}
	else
	{
		clearInterval(this.playTimer);
		clearInterval(this.playTimerRefresh);
	}
}


Toolbox.prototype.rewind = function()
{
	if (this.playing)
	{
		clearInterval(this.playTimer);
		clearInterval(this.playTimerRefresh);
		this.synth.stopAll();
	}
	
	this.playing = false;
	this.editor.setInteractionEnabled(true);
	
	this.editor.cursorTick = 0;
	this.editor.showCursor = true;
	this.editor.unselectAll();
	this.editor.refreshRepresentation();
	this.editor.refreshCanvas();
	this.refresh();
}


Toolbox.prototype.processPlayback = function()
{
	var bpm = this.editor.songData.beatsPerMinute;
	var deltaTicks = bpm / 60 / 60 * (this.editor.songData.ticksPerWholeNote / 4);
	
	var lastCursorTick = this.editor.cursorTick;
	this.editor.cursorTick += deltaTicks;
	
	// TODO: Use binary search.
	for (var i = 0; i < this.editor.songData.notes.length; i++)
	{
		var note = this.editor.songData.notes[i];
		if (note.tick >= lastCursorTick && note.tick < this.editor.cursorTick)
		{
			this.synth.playNote(note.pitch, note.duration * 2, 1);
		}
	}
	
	for (var i = 0; i < this.editor.songData.chords.length; i++)
	{
		var chord = this.editor.songData.chords[i];
		if (chord.tick + chord.duration > lastCursorTick && chord.tick < this.editor.cursorTick &&
			!(chord.tick + chord.duration > lastCursorTick && chord.tick + chord.duration < this.editor.cursorTick))
		{
			var halfTick = this.editor.songData.ticksPerWholeNote / 2;
			var quarterTick = halfTick / 2;
			var eighthTick = quarterTick / 2;
			
			var tick1 = (lastCursorTick - chord.tick);
			var tick2 = (this.editor.cursorTick - chord.tick);
			
			if (Math.ceil(tick1 / halfTick) != Math.ceil(tick2 / halfTick))
			{
				for (var j = 0; j < chord.chord.pitches.length; j++)
					this.synth.playNote((chord.chord.pitches[j] + chord.rootPitch) % 12 + 60, quarterTick, 0.75);
			}
			else if (Math.ceil(tick1 / quarterTick) != Math.ceil(tick2 / quarterTick))
			{
				for (var j = 1; j < chord.chord.pitches.length; j++)
					this.synth.playNote((chord.chord.pitches[j] + chord.rootPitch) % 12 + 60, eighthTick, 0.5);
			}
			else if (Math.ceil(tick1 / eighthTick) != Math.ceil(tick2 / eighthTick))
			{
				this.synth.playNote((chord.chord.pitches[0] + chord.rootPitch) % 12 + 60, eighthTick, 0.45);
			}
		}
	}
}


Toolbox.prototype.processPlaybackRefresh = function()
{
	this.editor.unselectAll();
	
	// TODO: Use binary search.
	for (var i = 0; i < this.editor.songData.notes.length; i++)
	{
		var note = this.editor.songData.notes[i];
		if (note.tick + note.duration >= this.editor.cursorTick && note.tick < this.editor.cursorTick)
			this.editor.noteSelections[i] = true;
	}
	
	for (var i = 0; i < this.editor.songData.chords.length; i++)
	{
		var chord = this.editor.songData.chords[i];
		if (chord.tick + chord.duration > this.editor.cursorTick && chord.tick < this.editor.cursorTick)
			this.editor.chordSelections[i] = true;
	}
	
	this.editor.refreshCanvas();
}