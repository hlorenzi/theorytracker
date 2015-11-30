function Toolbox(div, editor, synth)
{
	this.div = div;
	this.playing = false;
	this.playTimer = null;
	this.playTimerRefresh = null;
	
	
	this.initCSS();
	
	
	// Create elements.
	this.mainLayout = document.createElement("table");
	this.mainLayout.style.margin = "auto";
	this.mainLayoutRow0 = document.createElement("tr"); this.mainLayout.appendChild(this.mainLayoutRow0);
	this.mainLayoutCell00 = document.createElement("td"); this.mainLayoutRow0.appendChild(this.mainLayoutCell00);
	this.mainLayoutCell01 = document.createElement("td"); this.mainLayoutRow0.appendChild(this.mainLayoutCell01);
	this.div.appendChild(this.mainLayout);
	
	this.toolsLayout = document.createElement("table");
	this.toolsLayout.style.margin = "auto";
	this.toolsLayoutRow0 = document.createElement("tr"); this.toolsLayout.appendChild(this.toolsLayoutRow0);
	this.toolsLayoutCell00 = document.createElement("td"); this.toolsLayoutRow0.appendChild(this.toolsLayoutCell00);
	this.toolsLayoutRow1 = document.createElement("tr"); this.toolsLayout.appendChild(this.toolsLayoutRow1);
	this.toolsLayoutCell10 = document.createElement("td"); this.toolsLayoutRow1.appendChild(this.toolsLayoutCell10);
	this.mainLayoutCell01.appendChild(this.toolsLayout);
	
	
	// Playback controls.
	this.buttonPlay = document.createElement("button");
	this.buttonPlay.innerHTML = "&#9654; Play";
	this.buttonPlay.className = "toolboxButton";
	this.buttonPlay.style.fontSize = "20px";
	this.mainLayoutCell00.appendChild(this.buttonPlay);
	
	this.buttonRewind = document.createElement("button");
	this.buttonRewind.innerHTML = "&#9664;&#9664; Rewind";
	this.buttonRewind.className = "toolboxButton";
	this.mainLayoutCell00.appendChild(this.buttonRewind);
	
	this.mainLayoutCell00.appendChild(document.createElement("br"));
	
	var inputBPMSpan = document.createElement("span");
	inputBPMSpan.innerHTML = "Tempo ";
	inputBPMSpan.className = "toolboxText";
	this.mainLayoutCell00.appendChild(inputBPMSpan);
	
	this.inputBPM = document.createElement("input");
	this.inputBPM.value = editor.songData.beatsPerMinute;
	this.inputBPM.style.width = "30px";
	this.mainLayoutCell00.appendChild(this.inputBPM);
	
	// Key Change settings.
	this.keyChangeSpan = document.createElement("span");
	this.keyChangeSpan.style.background = "#cccccc";
	
	var keyChangeEditingLabelSpan = document.createElement("span");
	keyChangeEditingLabelSpan.innerHTML = "Edit Key Change";
	keyChangeEditingLabelSpan.className = "toolboxLabel";
	this.keyChangeSpan.appendChild(keyChangeEditingLabelSpan);
	this.keyChangeSpan.appendChild(document.createElement("br"));
	
	this.keyChangeTonicSelect = document.createElement("select");
	this.keyChangeTonicOptions = [];
	for (var i = 0; i < 12; i++)
	{
		this.keyChangeTonicOptions[i] = document.createElement("option");
		this.keyChangeTonicSelect.appendChild(this.keyChangeTonicOptions[i]);
	}
	this.keyChangeSpan.appendChild(this.keyChangeTonicSelect);
	
	var keyChangeDividerSpan = document.createElement("span");
	keyChangeDividerSpan.innerHTML = " ";
	keyChangeDividerSpan.className = "toolboxText";
	this.keyChangeSpan.appendChild(keyChangeDividerSpan);
	
	this.keyChangeScaleSelect = document.createElement("select");
	this.keyChangeScaleOptions = [];
	for (var i = 0; i < theory.scales.length; i++)
	{
		this.keyChangeScaleOptions[i] = document.createElement("option");
		this.keyChangeScaleOptions[i].innerHTML = theory.scales[i].name;
		this.keyChangeScaleSelect.appendChild(this.keyChangeScaleOptions[i]);
	}
	this.keyChangeSpan.appendChild(this.keyChangeScaleSelect);
	
	this.buttonKeyChangeListen = document.createElement("button");
	this.buttonKeyChangeListen.innerHTML = "Listen";
	this.buttonKeyChangeListen.className = "toolboxButton";
	this.keyChangeSpan.appendChild(this.buttonKeyChangeListen);
	
	this.keyChangeSpan.appendChild(document.createElement("br"));
	this.keyChangeSpan.appendChild(document.createElement("br"));
	this.toolsLayoutCell00.appendChild(this.keyChangeSpan);
	
	
	// Meter Change settings.
	this.meterChangeSpan = document.createElement("span");
	this.meterChangeSpan.style.background = "#aaddff";
	
	var meterChangeEditingLabelSpan = document.createElement("span");
	meterChangeEditingLabelSpan.innerHTML = "Edit Meter Change";
	meterChangeEditingLabelSpan.className = "toolboxLabel";
	this.meterChangeSpan.appendChild(meterChangeEditingLabelSpan);
	this.meterChangeSpan.appendChild(document.createElement("br"));
	
	this.meterChangeNumeratorSelect = document.createElement("select");
	this.meterChangeNumeratorOptions = [];
	for (var i = 0; i < 20; i++)
	{
		this.meterChangeNumeratorOptions[i] = document.createElement("option");
		this.meterChangeNumeratorOptions[i].innerHTML = "" + (i + 1);
		this.meterChangeNumeratorSelect.appendChild(this.meterChangeNumeratorOptions[i]);
	}
	this.meterChangeSpan.appendChild(this.meterChangeNumeratorSelect);
	
	var meterChangeDividerSpan = document.createElement("span");
	meterChangeDividerSpan.innerHTML = " / ";
	meterChangeDividerSpan.className = "toolboxText";
	this.meterChangeSpan.appendChild(meterChangeDividerSpan);
	
	this.meterChangeDenominatorSelect = document.createElement("select");
	this.meterChangeDenominatorOptions = [];
	this.meterChangeDenominators = [ 2, 4, 8, 16 ];
	for (var i = 0; i < this.meterChangeDenominators.length; i++)
	{
		this.meterChangeDenominatorOptions[i] = document.createElement("option");
		this.meterChangeDenominatorOptions[i].innerHTML = "" + this.meterChangeDenominators[i];
		this.meterChangeDenominatorSelect.appendChild(this.meterChangeDenominatorOptions[i]);
	}
	this.meterChangeSpan.appendChild(this.meterChangeDenominatorSelect);
	
	this.meterChangeSpan.appendChild(document.createElement("br"));
	this.meterChangeSpan.appendChild(document.createElement("br"));
	this.toolsLayoutCell00.appendChild(this.meterChangeSpan);
	
	
	// Editing controls.
	this.labelKey = document.createElement("span");
	this.labelKey.className = "toolboxLabel";
	this.labelKey.appendChild(document.createElement("br"));
	this.toolsLayoutCell00.appendChild(this.labelKey);
	
	
	// Add Key/Meter Changes buttons.
	this.changesSpan = document.createElement("span");
	
	this.buttonAddKeyChange = document.createElement("button");
	this.buttonAddKeyChange.innerHTML = "Add Key Change";
	this.buttonAddKeyChange.className = "toolboxButton";
	this.changesSpan.appendChild(this.buttonAddKeyChange);
	
	this.buttonAddMeterChange = document.createElement("button");
	this.buttonAddMeterChange.innerHTML = "Add Meter Change";
	this.buttonAddMeterChange.className = "toolboxButton";
	this.changesSpan.appendChild(this.buttonAddMeterChange);
	
	this.changesSpan.appendChild(document.createElement("br"));
	this.changesSpan.appendChild(document.createElement("br"));
	this.toolsLayoutCell00.appendChild(this.changesSpan);
	
	
	// Note buttons.
	this.notesSpan = document.createElement("span");
	
	this.buttonNotes = [];
	for (var i = 0; i < 12; i++)
	{
		this.buttonNotes[i] = document.createElement("button");
		this.buttonNotes[i].className = "toolboxNoteButton";
		this.notesSpan.appendChild(this.buttonNotes[i]);
	}
	
	this.notesSpan.appendChild(document.createElement("br"));
	this.notesSpan.appendChild(document.createElement("br"));
	this.toolsLayoutCell00.appendChild(this.notesSpan);
	
	
	// Chord buttons.
	this.chordsSpan = document.createElement("span");
	
	this.chordSelect = document.createElement("select");
	this.chordsSpan.appendChild(this.chordSelect);
	this.chordsSpan.appendChild(document.createElement("br"));
	
	this.chordOptions = [];
	for (var i = 0; i < theory.chords.length + 1; i++)
	{
		this.chordOptions[i] = document.createElement("option");
		
		var text;
		if (i == 0)
		{
			text = "In Key";
		}
		else
		{
			text = theory.chords[i - 1].roman.replace("X", "I").replace("x", "i");
			text += "<sup>" + theory.chords[i - 1].romanSup + "</sup>";
			text += "<sub>" + theory.chords[i - 1].romanSub + "</sub>";
		}
		
		this.chordOptions[i].innerHTML = text;
		this.chordSelect.appendChild(this.chordOptions[i]);
	}
	
	this.buttonChords = [];
	for (var i = 0; i < 12; i++)
	{
		this.buttonChords[i] = document.createElement("button");
		this.buttonChords[i].className = "toolboxNoteChord";
		this.chordsSpan.appendChild(this.buttonChords[i]);
		
		if (i == 6)
			this.chordsSpan.appendChild(document.createElement("br"));
	}
	
	this.toolsLayoutCell00.appendChild(this.chordsSpan);
	
	
	// Set up callbacks.
	this.editor = editor;
	this.synth = synth;
	
	var that = this;
	editor.addOnCursorChanged(function() { that.refresh(); });
	editor.addOnSelectionChanged(function() { that.refreshSelection(); });
	this.chordSelect.onchange = function() { that.refresh(); };
	this.keyChangeTonicSelect.onchange = function() { that.editKeyChange(); };
	this.keyChangeScaleSelect.onchange = function() { that.editKeyChange(); };
	this.meterChangeNumeratorSelect.onchange = function() { that.editMeterChange(); };
	this.meterChangeDenominatorSelect.onchange = function() { that.editMeterChange(); };
	
	this.buttonKeyChangeListen.onclick = function()
	{
		var keyChange = that.editor.getUniqueKeyChangeSelected();
		theory.playScaleSample(that.synth, keyChange.scale, keyChange.tonicPitch);
	}
	
	this.buttonAddKeyChange.onclick = function(ev)
	{
		if (that.playing)
			return;
		
		ev.preventDefault();
		var keyChange = new SongDataKeyChange(that.editor.cursorTick, theory.scales[0], theory.C);
		that.editor.songData.addKeyChange(keyChange);
		that.editor.unselectAll();
		that.editor.refreshRepresentation();
		that.editor.selectKeyChange(keyChange);
		that.editor.refreshCanvas();
		that.refresh();
		that.refreshSelection();
	};
	
	this.buttonAddMeterChange.onclick = function(ev)
	{
		if (that.playing)
			return;
		
		ev.preventDefault();
		var meterChange = new SongDataMeterChange(that.editor.cursorTick, 4, 4);
		that.editor.songData.addMeterChange(meterChange);
		that.editor.unselectAll();
		that.editor.refreshRepresentation();
		that.editor.selectMeterChange(meterChange);
		that.editor.refreshCanvas();
		that.refresh();
		that.refreshSelection();
	};
	
	this.buttonPlay.onclick = function()
	{
		that.playing = !that.playing;
		that.editor.setInteractionEnabled(!that.playing);
		that.buttonPlay.innerHTML = (that.playing ? "&#9632; Stop" : "&#9654; Play");
		
		that.editor.showCursor = true;
		that.editor.unselectAll();
		that.editor.refreshRepresentation();
		that.editor.refreshCanvas();
		that.refresh();
		that.refreshSelection();
		
		that.synth.stopAll();
		if (that.playing)
		{
			that.playTimer = setInterval(function() { that.processPlayback(); }, 1000 / 60);
			that.playTimerRefresh = setInterval(function() { that.processPlaybackRefresh(); }, 1000 / 15);
		}
		else
		{
			clearInterval(that.playTimer);
			clearInterval(that.playTimerRefresh);
		}
	}
	
	this.buttonRewind.onclick = function()
	{
		if (that.playing)
		{
			clearInterval(that.playTimer);
			clearInterval(that.playTimerRefresh);
			that.synth.stopAll();
		}
		
		that.playing = false;
		that.editor.setInteractionEnabled(true);
		that.buttonPlay.innerHTML = (that.playing ? "&#9632; Stop" : "&#9654; Play");
		
		that.editor.cursorTick = 0;
		that.editor.showCursor = true;
		that.editor.unselectAll();
		that.editor.refreshRepresentation();
		that.editor.refreshCanvas();
		that.refresh();
		that.refreshSelection();
	}
	
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
	
	this.refreshSelection();
	this.refresh();
}


Toolbox.prototype.initCSS = function()
{
	var declarations = document.createTextNode(
		".toolboxButton { margin: 2px; border: 2px solid #aaaaaa; background: #ffffff; font-family: tahoma; font-size: 12px; outline: none; }" +
		".toolboxButton:hover { border-color: #cccccc; cursor: pointer; }" +
		".toolboxButton:active { border-color: #aaaaaa; background: #eeeeee; }" +
		".toolboxNoteButton { width: 20px; height: 30px; margin: 2px; padding: 0px; border: none; text-align: center; font-family: tahoma; font-size: 12px; outline: none; }" +
		".toolboxNoteButton:hover { cursor: pointer; border: 1px solid #ffffff; }" +
		".toolboxNoteButton:active { border: 2px solid #ffffff; }" +
		".toolboxNoteChord { width: 50px; height: 38px; margin: 2px; padding: 0px; border-style: solid; border-width: 3px 0 3px 0; background: #eeeeee; text-align: center; font-family: tahoma; font-size: 18px; outline: none; }" +
		".toolboxNoteChord:hover { cursor: pointer; background: #f8f8f8; }" +
		".toolboxNoteChord:active { background: #f0f0f0; }" +
		".toolboxLabel { font-family: tahoma; font-size: 14px; font-weight: bold; }" +
		".toolboxText { font-family: tahoma; font-size: 12px; }" +
		".toolboxPalette { overflow-y: scroll; }");
	
	var head = document.getElementsByTagName("head")[0];
	var styleElem = document.createElement("style");

	styleElem.type = "text/css";

	if (styleElem.styleSheet)
		styleElem.styleSheet.cssText = declarations.nodeValue;
	else
		styleElem.appendChild(declarations);
	
	head.appendChild(styleElem);
}


Toolbox.prototype.refresh = function()
{
	var key = this.editor.getKeyAtTick(this.editor.cursorTick);
	
	this.labelKey.innerHTML = "Key of " + theory.getNameForPitch(key.tonicPitch, key.scale) + " " + key.scale.name;
	this.labelKey.appendChild(document.createElement("br"));
	
	for (var i = 0; i < 12; i++)
	{
		var pitch = (i + key.tonicPitch) % 12;
		this.buttonNotes[i].innerHTML = theory.getNameForPitch(pitch, key.scale);
		
		var degree = theory.getDegreeForPitch(pitch, key);
		
		if ((degree % 1) == 0)
		{
			var color = theory.getColorForDegree(degree);
			this.buttonNotes[i].style.background = color;
			this.buttonNotes[i].style.color = "#000000";
		}
		else
		{
			this.buttonNotes[i].style.background = "#dddddd";
			this.buttonNotes[i].style.color = "#888888";
		}
		
		var that = this;
		this.buttonNotes[i].onclick = function(pitch)
		{
			var thisPitch = pitch;
			return function(ev)
			{
				if (that.playing)
					return;
				
				ev.preventDefault();
				theory.playNoteSample(that.synth, thisPitch);
				var note = new SongDataNote(that.editor.cursorTick, that.editor.WHOLE_NOTE_DURATION / 4, thisPitch);
				that.editor.songData.addNote(note);
				that.editor.cursorTick += that.editor.WHOLE_NOTE_DURATION / 4;
				that.editor.showCursor = true;
				that.editor.unselectAll();
				that.editor.refreshRepresentation();
				that.editor.refreshCanvas();
				that.refresh();
			}
		}(pitch);
	}
	
	var chordCategory = this.chordSelect.selectedIndex;
		
	if (chordCategory == 0)
	{
		for (var i = 0; i < 7; i++)
		{
			var pitch1 = key.tonicPitch + key.scale.degrees[i];
			
			var pitch2 = key.tonicPitch + key.scale.degrees[(i + 2) % key.scale.degrees.length];
			if ((i + 2) >= key.scale.degrees.length)
				pitch2 += 12;
			
			var pitch3 = key.tonicPitch + key.scale.degrees[(i + 4) % key.scale.degrees.length];
			if ((i + 4) >= key.scale.degrees.length)
				pitch3 += 12;
			
			var color = theory.getColorForDegree(i);
			var chord = theory.getFirstFittingChordForPitches([pitch1, pitch2, pitch3]);
			var numeral = theory.getRomanNumeralForPitch(pitch1, key);
			
			var romanText = chord.roman.replace("X", numeral).replace("x", numeral.toLowerCase());
			romanText += "<sup>" + chord.romanSup + "</sup>";
			romanText += "<sub>" + chord.romanSub + "</sub>";
			
			this.buttonChords[i].innerHTML = romanText;
			this.buttonChords[i].style.borderColor = color;
			this.buttonChords[i].style.display = "visible";
			
			var that = this;
			this.buttonChords[i].onclick = function(chord, pitch)
			{
				var thisChord = chord;
				var thisPitch = pitch;
				return function(ev)
				{
					if (that.playing)
						return;
					
					ev.preventDefault();
					theory.playChordSample(that.synth, thisChord, thisPitch);
					var chord = new SongDataChord(that.editor.cursorTick, that.editor.WHOLE_NOTE_DURATION / 2, thisChord, thisPitch);
					that.editor.songData.addChord(chord);
					that.editor.cursorTick += that.editor.WHOLE_NOTE_DURATION / 2;
					that.editor.showCursor = true;
					that.editor.unselectAll();
					that.editor.refreshRepresentation();
					that.editor.refreshCanvas();
					that.refresh();
				}
			}(chord, pitch1);
		}
		
		for (var i = 7; i < 12; i++)
			this.buttonChords[i].style.display = "none";
	}
	else
	{	
		var inKeyIndex = 0;
		var outOfKeyIndex = 7;
		
		for (var i = 0; i < 12; i++)
		{
			var rootPitch = (key.tonicPitch + i) % 12;
			var degree = theory.getDegreeForPitch(rootPitch, key);
			
			var index = inKeyIndex;
			if ((degree % 1) != 0)
				index = outOfKeyIndex;
			
			var color = theory.getColorForDegree(degree);
			var chord = theory.chords[chordCategory - 1];
			var numeral = theory.getRomanNumeralForPitch(rootPitch, key);
			
			var romanText = chord.roman.replace("X", numeral).replace("x", numeral.toLowerCase());
			romanText += "<sup>" + chord.romanSup + "</sup>";
			romanText += "<sub>" + chord.romanSub + "</sub>";
			
			this.buttonChords[index].innerHTML = romanText;
			this.buttonChords[index].style.display = "inline";
			if ((degree % 1) == 0)
			{
				this.buttonChords[index].style.borderColor = color;
				this.buttonChords[index].style.color = "#000000";
			}
			else
			{
				this.buttonChords[index].style.borderColor = "#dddddd";
				this.buttonChords[index].style.color = "#888888";
			}
			
			var that = this;
			this.buttonChords[index].onclick = function(chord, pitch)
			{
				var thisChord = chord;
				var thisPitch = pitch;
				return function(ev)
				{
					if (that.playing)
						return;
					
					ev.preventDefault();
					theory.playChordSample(that.synth, thisChord, thisPitch);
					var chord = new SongDataChord(that.editor.cursorTick, that.editor.WHOLE_NOTE_DURATION / 2, thisChord, thisPitch);
					that.editor.songData.addChord(chord);
					that.editor.cursorTick += that.editor.WHOLE_NOTE_DURATION / 2;
					that.editor.showCursor = true;
					that.editor.unselectAll();
					that.editor.refreshRepresentation();
					that.editor.refreshCanvas();
					that.refresh();
				}
			}(chord, rootPitch);
			
			if ((degree % 1) != 0)
				outOfKeyIndex++;
			else
				inKeyIndex++;
		}
	}
}


Toolbox.prototype.refreshSelection = function()
{
	this.labelKey.style.display = "inline";
	this.changesSpan.style.display = "inline";
	this.notesSpan.style.display = "inline";
	this.chordsSpan.style.display = "inline";
	this.keyChangeSpan.style.display = "none";
	this.meterChangeSpan.style.display = "none";
	
	
	var keyChange = this.editor.getUniqueKeyChangeSelected();
	if (keyChange != null)
	{
		var scaleIndex = 0;
		for (var i = 0; i < theory.scales.length; i++)
		{
			if (keyChange.scale == theory.scales[i])
			{
				scaleIndex = i;
				break;
			}
		}
		
		this.keyChangeScaleSelect.selectedIndex = scaleIndex;
		
		for (var i = 0; i < 12; i++)
		{
			var pitch = i;
			this.keyChangeTonicOptions[i].innerHTML = theory.getNameForPitch(pitch, keyChange);
		}
		
		this.keyChangeTonicSelect.selectedIndex = keyChange.tonicPitch;
		
		this.keyChangeSpan.style.display = "block";
		return;
	}
	
	
	var meterChange = this.editor.getUniqueMeterChangeSelected();
	if (meterChange != null)
	{
		this.meterChangeNumeratorSelect.selectedIndex = meterChange.numerator - 1;
		if (meterChange.denominator == 2) this.meterChangeDenominatorSelect.selectedIndex = 0;
		else if (meterChange.denominator == 4) this.meterChangeDenominatorSelect.selectedIndex = 1;
		else if (meterChange.denominator == 8) this.meterChangeDenominatorSelect.selectedIndex = 2;
		else if (meterChange.denominator == 16) this.meterChangeDenominatorSelect.selectedIndex = 3;
		
		this.meterChangeSpan.style.display = "block";
		return;
	}
}


Toolbox.prototype.editKeyChange = function()
{
	if (this.playing)
		return;
	
	var keyChange = this.editor.getUniqueKeyChangeSelected();
	keyChange.scale = theory.scales[this.keyChangeScaleSelect.selectedIndex];
	keyChange.tonicPitch = this.keyChangeTonicSelect.selectedIndex;
	
	this.editor.refreshRepresentation();
	this.editor.selectKeyChange(keyChange);
	this.editor.refreshCanvas();
	this.refresh();
}


Toolbox.prototype.editMeterChange = function()
{
	if (this.playing)
		return;
	
	var meterChange = this.editor.getUniqueMeterChangeSelected();
	meterChange.numerator = this.meterChangeNumeratorSelect.selectedIndex + 1;
	meterChange.denominator = this.meterChangeDenominators[this.meterChangeDenominatorSelect.selectedIndex];
	
	this.editor.refreshRepresentation();
	this.editor.selectMeterChange(meterChange);
	this.editor.refreshCanvas();
	this.refresh();
}


Toolbox.prototype.processPlayback = function()
{
	var bpm = this.editor.songData.beatsPerMinute;
	var deltaTicks = bpm / 60 / 60 * (960 / 4);
	
	var lastCursorTick = this.editor.cursorTick;
	this.editor.cursorTick += deltaTicks;
	
	// TODO: Use binary search.
	for (var i = 0; i < this.editor.songData.notes.length; i++)
	{
		var note = this.editor.songData.notes[i];
		if (note.tick >= lastCursorTick && note.tick < this.editor.cursorTick)
		{
			this.synth.playNote(note.pitch + 60, note.duration * 2, 1);
		}
	}
	
	for (var i = 0; i < this.editor.songData.chords.length; i++)
	{
		var chord = this.editor.songData.chords[i];
		if (chord.tick + chord.duration > lastCursorTick && chord.tick < this.editor.cursorTick)
		{
			var halfTick = this.editor.WHOLE_NOTE_DURATION / 2;
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