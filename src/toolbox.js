function Toolbox(div, editor)
{
	this.div = div;
	
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
	
	this.buttonPlay = document.createElement("button");
	this.buttonPlay.innerHTML = "&#9654; Play";
	this.buttonPlay.className = "toolboxButton";
	this.buttonPlay.style.fontSize = "20px";
	this.mainLayoutCell00.appendChild(this.buttonPlay);
	
	this.buttonRewind = document.createElement("button");
	this.buttonRewind.innerHTML = "&#9664;&#9664; Rewind";
	this.buttonRewind.className = "toolboxButton";
	this.mainLayoutCell00.appendChild(this.buttonRewind);
	
	this.labelKey = document.createElement("span");
	this.labelKey.className = "toolboxLabel";
	this.toolsLayoutCell00.appendChild(this.labelKey);
	
	this.toolsLayoutCell00.appendChild(document.createElement("br"));
	
	this.buttonAddKeyChange = document.createElement("button");
	this.buttonAddKeyChange.innerHTML = "Add Key Change";
	this.buttonAddKeyChange.className = "toolboxButton";
	this.toolsLayoutCell00.appendChild(this.buttonAddKeyChange);
	
	this.buttonAddMeterChange = document.createElement("button");
	this.buttonAddMeterChange.innerHTML = "Add Meter Change";
	this.buttonAddMeterChange.className = "toolboxButton";
	this.toolsLayoutCell00.appendChild(this.buttonAddMeterChange);
	
	this.toolsLayoutCell00.appendChild(document.createElement("br"));
	
	this.buttonNotes = [];
	for (var i = 0; i < 12; i++)
	{
		this.buttonNotes[i] = document.createElement("button");
		this.buttonNotes[i].className = "toolboxNoteButton";
		this.toolsLayoutCell00.appendChild(this.buttonNotes[i]);
	}
	
	this.toolsLayoutCell00.appendChild(document.createElement("br"));
	
	this.buttonChords = [];
	for (var i = 0; i < 7; i++)
	{
		this.buttonChords[i] = document.createElement("button");
		this.buttonChords[i].className = "toolboxNoteChord";
		this.toolsLayoutCell00.appendChild(this.buttonChords[i]);
	}
	
	// Set up callbacks.
	this.editor = editor;
	
	var that = this;
	editor.addOnCursorChanged(function() { that.editorOnCursorChanged(); });
	
	this.editorOnCursorChanged();
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
		".toolboxLabel { font-family: tahoma; font-size: 14px; font-weight: bold; }");
	
	var head = document.getElementsByTagName("head")[0];
	var styleElem = document.createElement("style");

	styleElem.type = "text/css";

	if (styleElem.styleSheet)
		styleElem.styleSheet.cssText = declarations.nodeValue;
	else
		styleElem.appendChild(declarations);
	
	head.appendChild(styleElem);
}


Toolbox.prototype.editorOnCursorChanged = function()
{
	var key = this.editor.getKeyAtTick(this.editor.cursorTick);
	
	this.labelKey.innerHTML = "Key of " + theory.getNameForPitch(key.tonicPitch, key.scale) + " " + key.scale.name;
	
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
	}
	
	
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
		
		var romanText = chord.roman.replace("I", numeral).replace("i", numeral.toLowerCase());
		romanText += "<sup>" + chord.romanSup + "</sup>";
		
		this.buttonChords[i].innerHTML = romanText;
		this.buttonChords[i].style.borderColor = color;
	}
}