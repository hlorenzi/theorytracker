function Toolbox(div, editor, synth)
{
	this.div = div;
	this.playing = false;
	this.playTimer = null;
	this.playTimerRefresh = null;
	
	
	this.initCSS();
	
	
	// Main table layout. Working with divs is so terrible...
	this.mainLayout = this.createTable(this.div, 2, 1);
	
	// Playback controls and global song settings.
	this.buttonPlay = document.createElement("button");
	this.buttonPlay.innerHTML = "&#9654; Play";
	this.buttonPlay.className = "toolboxButton";
	this.buttonPlay.style.fontSize = "20px";
	this.mainLayout.cells[0][0].appendChild(this.buttonPlay);
	
	this.buttonRewind = document.createElement("button");
	this.buttonRewind.innerHTML = "&#9664;&#9664; Rewind";
	this.buttonRewind.className = "toolboxButton";
	this.mainLayout.cells[0][0].appendChild(this.buttonRewind);
	
	this.mainLayout.cells[0][0].appendChild(document.createElement("br"));
	
	var inputBPMSpan = document.createElement("span");
	inputBPMSpan.innerHTML = "Tempo ";
	inputBPMSpan.className = "toolboxText";
	this.mainLayout.cells[0][0].appendChild(inputBPMSpan);
	
	this.inputBPM = document.createElement("input");
	this.inputBPM.value = editor.songData.beatsPerMinute;
	this.inputBPM.style.width = "30px";
	this.mainLayout.cells[0][0].appendChild(this.inputBPM);
	
	this.mainLayout.cells[0][0].appendChild(document.createElement("br"));
	this.mainLayout.cells[0][0].appendChild(document.createElement("br"));
	
	this.buttonSave = document.createElement("button");
	this.buttonSave.innerHTML = "Generate JSON";
	this.buttonSave.className = "toolboxButton";
	this.mainLayout.cells[0][0].appendChild(this.buttonSave);
	
	this.buttonLoad = document.createElement("button");
	this.buttonLoad.innerHTML = "Load JSON";
	this.buttonLoad.className = "toolboxButton";
	this.mainLayout.cells[0][0].appendChild(this.buttonLoad);
	
	this.mainLayout.cells[0][0].appendChild(document.createElement("br"));
	
	this.inputSave = document.createElement("textarea");
	this.inputSave.style.width = "200px";
	this.inputSave.style.height = "100px";
	this.mainLayout.cells[0][0].appendChild(this.inputSave);
	
	// Key/Meter table layout.
	this.keyMeterLayout = this.createTable(this.mainLayout.cells[0][1], 2, 1);
	
	// Key Change settings.
	this.keyMeterLayout.cells[0][0].style.background = "#cccccc";
	this.keyMeterLayout.cells[0][0].style.padding = "10px";
	
	var keyChangeEditingLabelSpan = document.createElement("span");
	keyChangeEditingLabelSpan.innerHTML = "Key";
	keyChangeEditingLabelSpan.className = "toolboxLabel";
	this.keyMeterLayout.cells[0][0].appendChild(keyChangeEditingLabelSpan);
	this.keyMeterLayout.cells[0][0].appendChild(document.createElement("br"));
	
	this.keyChangeTonicSelect = document.createElement("select");
	this.keyChangeTonicOptions = [];
	for (var i = 0; i < 12; i++)
	{
		this.keyChangeTonicOptions[i] = document.createElement("option");
		this.keyChangeTonicSelect.appendChild(this.keyChangeTonicOptions[i]);
	}
	this.keyMeterLayout.cells[0][0].appendChild(this.keyChangeTonicSelect);
	
	var keyChangeDividerSpan = document.createElement("span");
	keyChangeDividerSpan.innerHTML = " ";
	keyChangeDividerSpan.className = "toolboxText";
	this.keyMeterLayout.cells[0][0].appendChild(keyChangeDividerSpan);
	
	this.keyChangeScaleSelect = document.createElement("select");
	this.keyChangeScaleOptions = [];
	for (var i = 0; i < theory.scales.length; i++)
	{
		this.keyChangeScaleOptions[i] = document.createElement("option");
		this.keyChangeScaleOptions[i].innerHTML = theory.scales[i].name;
		this.keyChangeScaleSelect.appendChild(this.keyChangeScaleOptions[i]);
	}
	this.keyMeterLayout.cells[0][0].appendChild(this.keyChangeScaleSelect);
	
	this.buttonKeyChangeListen = document.createElement("button");
	this.buttonKeyChangeListen.innerHTML = "Listen";
	this.buttonKeyChangeListen.className = "toolboxButton";
	this.keyMeterLayout.cells[0][0].appendChild(this.buttonKeyChangeListen);
	
	this.keyMeterLayout.cells[0][0].appendChild(document.createElement("br"));
	
	this.buttonAddKeyChange = document.createElement("button");
	this.buttonAddKeyChange.innerHTML = "Add Key Change";
	this.buttonAddKeyChange.className = "toolboxButton";
	this.keyMeterLayout.cells[0][0].appendChild(this.buttonAddKeyChange);
	
	
	// Meter Change settings.
	this.keyMeterLayout.cells[0][1].style.background = "#aaddff";
	this.keyMeterLayout.cells[0][1].style.padding = "10px";
	
	var meterChangeEditingLabelSpan = document.createElement("span");
	meterChangeEditingLabelSpan.innerHTML = "Meter";
	meterChangeEditingLabelSpan.className = "toolboxLabel";
	this.keyMeterLayout.cells[0][1].appendChild(meterChangeEditingLabelSpan);
	this.keyMeterLayout.cells[0][1].appendChild(document.createElement("br"));
	
	this.meterChangeNumeratorSelect = document.createElement("select");
	this.meterChangeNumeratorOptions = [];
	for (var i = 0; i < 20; i++)
	{
		this.meterChangeNumeratorOptions[i] = document.createElement("option");
		this.meterChangeNumeratorOptions[i].innerHTML = "" + (i + 1);
		this.meterChangeNumeratorSelect.appendChild(this.meterChangeNumeratorOptions[i]);
	}
	this.keyMeterLayout.cells[0][1].appendChild(this.meterChangeNumeratorSelect);
	
	var meterChangeDividerSpan = document.createElement("span");
	meterChangeDividerSpan.innerHTML = " / ";
	meterChangeDividerSpan.className = "toolboxText";
	this.keyMeterLayout.cells[0][1].appendChild(meterChangeDividerSpan);
	
	this.meterChangeDenominatorSelect = document.createElement("select");
	this.meterChangeDenominatorOptions = [];
	this.meterChangeDenominators = [ 2, 4, 8, 16 ];
	for (var i = 0; i < this.meterChangeDenominators.length; i++)
	{
		this.meterChangeDenominatorOptions[i] = document.createElement("option");
		this.meterChangeDenominatorOptions[i].innerHTML = "" + this.meterChangeDenominators[i];
		this.meterChangeDenominatorSelect.appendChild(this.meterChangeDenominatorOptions[i]);
	}
	this.keyMeterLayout.cells[0][1].appendChild(this.meterChangeDenominatorSelect);
	
	this.keyMeterLayout.cells[0][1].appendChild(document.createElement("br"));
	
	this.buttonAddMeterChange = document.createElement("button");
	this.buttonAddMeterChange.innerHTML = "Add Meter Change";
	this.buttonAddMeterChange.className = "toolboxButton";
	this.keyMeterLayout.cells[0][1].appendChild(this.buttonAddMeterChange);
	
	
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
	this.mainLayout.cells[0][1].appendChild(this.notesSpan);
	
	
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
	
	this.mainLayout.cells[0][1].appendChild(this.chordsSpan);
	
	
	// Set up callbacks.
	this.editor = editor;
	this.synth = synth;
	
	var that = this;
	editor.addOnCursorChanged(function() { that.refresh(); });
	editor.addOnSelectionChanged(function() { that.refresh(); });
	this.chordSelect.onchange = function() { that.refresh(); };
	this.keyChangeTonicSelect.onchange = function() { that.editKeyChange(); };
	this.keyChangeScaleSelect.onchange = function() { that.editKeyChange(); };
	this.meterChangeNumeratorSelect.onchange = function() { that.editMeterChange(); };
	this.meterChangeDenominatorSelect.onchange = function() { that.editMeterChange(); };
	
	this.buttonKeyChangeListen.onclick = function()
	{
		var keyChange = that.editor.getKeyAtTick(that.editor.cursorTick);
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
	};
	
	this.buttonPlay.onclick = function()
	{
		that.playing = !that.playing;
		that.editor.setInteractionEnabled(!that.playing);
		that.buttonPlay.innerHTML = (that.playing ? "&#9632; Stop" : "&#9654; Play");
		
		that.editor.cursorTick = Math.floor(that.editor.cursorTick / that.editor.tickSnap) * that.editor.tickSnap;
		that.editor.showCursor = true;
		that.editor.unselectAll();
		that.editor.clearHover();
		that.editor.refreshRepresentation();
		that.editor.refreshCanvas();
		that.refresh();
		
		that.synth.stopAll();
		if (that.playing)
		{
			that.editor.cursorZone = that.editor.CURSOR_ZONE_ALL;
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
	}
	
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


Toolbox.prototype.createTable = function(parent, columns, rows)
{
	var table = {};
	table.root = document.createElement("table");
	table.root.style.margin = "auto";
	
	table.rows = [];
	table.cells = [];
	
	for (var j = 0; j < rows; j++)
	{
		table.cells[j] = [];
		
		table.rows[j] = document.createElement("tr");
		table.root.appendChild(table.rows[j]);
		
		for (var i = 0; i < columns; i++)
		{
			table.cells[j][i] = document.createElement("td");
			table.rows[j].appendChild(table.cells[j][i]);
		}
	}
	
	parent.appendChild(table.root);
	return table;
}


Toolbox.prototype.refresh = function()
{
	if (this.playing)
		return;
	
	
	this.keyMeterLayout.cells[0][0].style.visibility = "hidden";
	this.keyMeterLayout.cells[0][1].style.visibility = "hidden";
	
	
	// Refresh key change tool.
	var keyChange = this.editor.getKeyAtTick(this.editor.cursorTick);
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
			this.keyChangeTonicOptions[i].innerHTML = theory.getNameForPitch(pitch, keyChange.scale, keyChange.tonicPitch);
		}
		
		this.keyChangeTonicSelect.selectedIndex = keyChange.tonicPitch;
		this.keyMeterLayout.cells[0][0].style.visibility = "visible";
	}
	
	
	// Refresh meter change tool.
	var meterChange = this.editor.getMeterAtTick(this.editor.cursorTick);
	if (meterChange != null)
	{
		this.meterChangeNumeratorSelect.selectedIndex = meterChange.numerator - 1;
		if (meterChange.denominator == 2) this.meterChangeDenominatorSelect.selectedIndex = 0;
		else if (meterChange.denominator == 4) this.meterChangeDenominatorSelect.selectedIndex = 1;
		else if (meterChange.denominator == 8) this.meterChangeDenominatorSelect.selectedIndex = 2;
		else if (meterChange.denominator == 16) this.meterChangeDenominatorSelect.selectedIndex = 3;
		
		this.keyMeterLayout.cells[0][1].style.visibility = "visible";
	}
	
	
	// Refresh note tools.
	if (keyChange == null)
		keyChange = new SongDataKeyChange(0, theory.scales[0], theory.C);
	
	for (var i = 0; i < 12; i++)
	{
		var pitch = (i + keyChange.tonicPitch) % 12;
		this.buttonNotes[i].innerHTML = theory.getNameForPitch(pitch, keyChange.scale, keyChange.tonicPitch);
		
		var degree = theory.getDegreeForPitch(pitch, keyChange.scale, keyChange.tonicPitch);
		
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
				that.editor.cursorZone = that.editor.CURSOR_ZONE_NOTES;
				that.editor.unselectAll();
				that.editor.refreshRepresentation();
				that.editor.refreshCanvas();
				that.refresh();
			}
		}(pitch + 60);
	}
	
	
	// Refresh chord tools.
	var chordCategory = this.chordSelect.selectedIndex;
		
	// "In Key" category.
	if (chordCategory == 0)
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
			
			var color = theory.getColorForDegree(i);
			var chord = theory.getFirstFittingChordForPitches([pitch1, pitch2, pitch3]);
			var numeral = theory.getRomanNumeralForPitch(pitch1, keyChange.scale, keyChange.tonicPitch);
			
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
					that.editor.cursorZone = that.editor.CURSOR_ZONE_CHORDS;
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
	
	// Other chord categories.
	else
	{	
		var inKeyIndex = 0;
		var outOfKeyIndex = 7;
		
		for (var i = 0; i < 12; i++)
		{
			var rootPitch = (keyChange.tonicPitch + i) % 12;
			var degree = theory.getDegreeForPitch(rootPitch, keyChange.scale, keyChange.tonicPitch);
			
			var index = inKeyIndex;
			if ((degree % 1) != 0)
				index = outOfKeyIndex;
			
			var color = theory.getColorForDegree(degree);
			var chord = theory.chords[chordCategory - 1];
			var numeral = theory.getRomanNumeralForPitch(rootPitch, keyChange.scale, keyChange.tonicPitch);
			
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
					that.editor.cursorZone = that.editor.CURSOR_ZONE_CHORDS;
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


Toolbox.prototype.editKeyChange = function()
{
	if (this.playing)
		return;
	
	var keyChange = this.editor.getKeyAtTick(this.editor.cursorTick);
	if (keyChange == null)
		return;
	
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
	
	var meterChange = this.editor.getMeterAtTick(this.editor.cursorTick);
	if (meterChange == null)
		return;
	
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
			this.synth.playNote(note.pitch, note.duration * 2, 1);
		}
	}
	
	for (var i = 0; i < this.editor.songData.chords.length; i++)
	{
		var chord = this.editor.songData.chords[i];
		if (chord.tick + chord.duration > lastCursorTick && chord.tick < this.editor.cursorTick &&
			!(chord.tick + chord.duration > lastCursorTick && chord.tick + chord.duration < this.editor.cursorTick))
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