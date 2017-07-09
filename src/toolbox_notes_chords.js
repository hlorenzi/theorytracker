function toolboxDrawerNotesChordsInit()
{
	var selectChordKinds = document.getElementById("select-chord-kind");
	
	var optionInKey = document.createElement("option");
	optionInKey.innerHTML = "In Key";
	selectChordKinds.appendChild(optionInKey);
	
	for (var i = 0; i < Theory.chordKinds.length; i++)
	{
		if (Theory.chordKinds[i].startGroup != undefined)
		{
			var optGroup = document.createElement("optgroup");
			optGroup.label = "-- " + Theory.chordKinds[i].startGroup + " --";
			selectChordKinds.appendChild(optGroup);
		}		
		
		var option = document.createElement("option");
		
		var labelMain = document.createElement("span");
		var labelSuperscript = document.createElement("sup");
		
		var key = { scaleIndex: 0, tonicMidiPitch: 0, accidentalOffset: 0 };
		var chord = { chordKindIndex: i, rootMidiPitch: 0, rootAccidentalOffset: 0, embelishments: [] };
		
		labelMain.innerHTML = Theory.getChordRomanLabelMain(key, chord);
		labelSuperscript.innerHTML = Theory.getChordRomanLabelSuperscript(key, chord);
		
		option.appendChild(labelMain);
		labelMain.appendChild(labelSuperscript);
		selectChordKinds.appendChild(option);
	}
	selectChordKinds.selectedIndex = 0;
}


function toolboxDrawerNotesChordsRefresh()
{
}