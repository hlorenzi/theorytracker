let selectChordKinds = document.getElementById("select-chord-kind");
let selectChordAppl = document.getElementById("select-chord-appl");
let selectChordBorrow = document.getElementById("select-chord-borrow");


let buttonChord0 = document.getElementById("button-chord-0");
let buttonChord1 = document.getElementById("button-chord-1");
let buttonChord2 = document.getElementById("button-chord-2");
let buttonChord3 = document.getElementById("button-chord-3");
let buttonChord4 = document.getElementById("button-chord-4");
let buttonChord5 = document.getElementById("button-chord-5");
let buttonChord6 = document.getElementById("button-chord-6");
let buttonChords =
[
	buttonChord0, buttonChord1, buttonChord2, buttonChord3,
	buttonChord4, buttonChord5, buttonChord6
];

let buttonChordLabels = buttonChords.map(b => b.childNodes[1]);
let buttonChordLabelsBottom = buttonChords.map(b => b.childNodes[4]);


let checkboxEmbel7 = document.getElementById("checkbox-embel-7");
let checkboxEmbel9 = document.getElementById("checkbox-embel-9");
let checkboxEmbel11 = document.getElementById("checkbox-embel-11");
let checkboxEmbelSus2 = document.getElementById("checkbox-embel-sus2");
let checkboxEmbelSus4 = document.getElementById("checkbox-embel-sus4");
let checkboxEmbelAdd9 = document.getElementById("checkbox-embel-add9");
let checkboxEmbels =
[
	checkboxEmbel7, checkboxEmbel9, checkboxEmbel11,
	checkboxEmbelSus2, checkboxEmbelSus4, checkboxEmbelAdd9
];


let radioAccidFlat = document.getElementById("radio-accid-flat");
let radioAccidNat = document.getElementById("radio-accid-nat");
let radioAccidSharp = document.getElementById("radio-accid-sharp");
let radioAccids = [ radioAccidFlat, radioAccidNat, radioAccidSharp ];
	
	
function toolboxDrawerNotesChordsInit()
{
	toolboxChordKindRefresh();
	toolboxChordApplRefresh();
	toolboxChordBorrowRefresh();
	
	checkboxEmbels.map(c => c.childNodes[0].onclick = toolboxChordsRefresh);
	radioAccids.map(r => r.childNodes[0].onclick = toolboxChordsRefresh);
	selectChordKinds.onchange = toolboxChordsRefresh;
	selectChordAppl.onchange = toolboxChordsRefresh;
	selectChordBorrow.onchange = toolboxChordsRefresh;
}


function toolboxDrawerNotesChordsRefresh()
{
	toolboxChordsRefresh();
}


function toolboxChordKindRefresh()
{
	// Create "In Key" option.
	let optionInKey = document.createElement("option");
	optionInKey.innerHTML = "In Key";
	selectChordKinds.appendChild(optionInKey);
	
	// Create an option for each chord kind listed in the Theory object.
	for (let i = 0; i < Theory.chordKinds.length; i++)
	{
		// Create a group label if this chord kind starts a group.
		if (Theory.chordKinds[i].startGroup != undefined)
		{
			let optGroup = document.createElement("optgroup");
			optGroup.label = "-- " + Theory.chordKinds[i].startGroup + " --";
			selectChordKinds.appendChild(optGroup);
		}
		
		// Create the chord kind option.
		let option = document.createElement("option");
		
		let labelMain = document.createElement("span");
		let labelSuperscript = document.createElement("sup");
		
		let key = { scaleIndex: 0, tonicMidiPitch: 0, accidentalOffset: 0 };
		let chord = { chordKindIndex: i, rootMidiPitch: 0, rootAccidentalOffset: 0, embelishments: [] };
		
		labelMain.innerHTML = Theory.getChordRomanLabelMain(key, chord);
		labelSuperscript.innerHTML = Theory.getChordRomanLabelSuperscript(key, chord);
		
		option.appendChild(labelMain);
		labelMain.appendChild(labelSuperscript);
		selectChordKinds.appendChild(option);
	}
	
	selectChordKinds.selectedIndex = 0;
}


function toolboxChordApplRefresh()
{
	let labels = ["I", "II", "III", "IV", "V", "VI", "VII"];
	for (let i = 0; i < 21; i++)
	{
		let option = document.createElement("option");
		option.innerHTML =
			"/" + Theory.getAccidentalString(Math.floor(i / 7) - 1) +
			labels[i % 7]; Theory.getPitchLabel(Theory.keyTonicPitches[i], Theory.keyAccidentalOffsets[i]);
			
		if (i == 7)
			option.innerHTML = "No Appl.";
		// Hide unimplemented options for now.
		else
			continue;
		
		selectChordAppl.appendChild(option);
	}
	selectChordAppl.selectedIndex = 0;
}


function toolboxChordBorrowRefresh()
{
	// Create "No Borrow" option.
	let optionInKey = document.createElement("option");
	optionInKey.innerHTML = "No Borrow";
	selectChordBorrow.appendChild(optionInKey);
}


function toolboxChordsRefresh()
{
	let selectedIndex = selectChordKinds.selectedIndex;
	let scale = Theory.scales[g_CurrentKey.scaleIndex];
	
	
	let refreshButton = function(buttonIndex, chord)
	{
		let degree = Theory.getPitchDegree(g_CurrentKey, chord.rootMidiPitch + chord.rootAccidentalOffset, g_Editor.usePopularNotation);
		let degreeColor = Theory.getDegreeColor(Theory.getModeCycledDegree(g_CurrentKey, degree, g_Editor.usePopularNotation));
		
		let button = buttonChords[buttonIndex];
		let label = buttonChordLabels[buttonIndex];
		let labelBottom = buttonChordLabelsBottom[buttonIndex];
		
		label.innerHTML =
			Theory.getChordRomanLabelMain(g_CurrentKey, chord, g_Editor.usePopularNotation) +
			"<sup>" + Theory.getChordRomanLabelSuperscript(g_CurrentKey, chord, g_Editor.usePopularNotation) + "</sup>";
			
		labelBottom.innerHTML =
			Theory.getChordAbsoluteLabelMain(g_CurrentKey, chord, g_Editor.usePopularNotation) +
			"<sup>" + Theory.getChordAbsoluteLabelSuperscript(g_CurrentKey, chord, g_Editor.usePopularNotation) + "</sup>";
		
		button.style.borderTop = "0.25em solid " + degreeColor;
		button.style.borderBottom = "0.25em solid " + degreeColor;
		
		button.chord = chord
		button.onclick = function()
		{
			g_Editor.insertChord(chord);
		};
	};
	
	
	let accid =
		radioAccidFlat.childNodes[0].checked ? -1 :
		radioAccidSharp.childNodes[0].checked ? 1 :
		0;
	
	
	// In Key
	if (selectedIndex == 0)
	{
		// Hide unimplemented checkboxes for now.
		checkboxEmbels.map(c => c.style.visibility = "hidden");
		
		radioAccids.map(r => r.style.visibility = "hidden");
		selectChordBorrow.style.visibility = "inherit";
		
		for (let i = 0; i < 7; i++)
			refreshButton(i, Theory.getChordForKeyDegree(g_CurrentKey, i));
	}
	// Chord kinds
	else
	{
		checkboxEmbels.map(c => c.style.visibility = "hidden");
		radioAccids.map(r => r.style.visibility = "inherit");
		selectChordBorrow.style.visibility = "hidden";
		
		let pitches = [0, 2, 4, 5, 7, 9, 11];
		
		for (let i = 0; i < 7; i++)
		{
			let chord =
			{
				chordKindIndex: selectedIndex - 1,
				rootMidiPitch: scale.pitches[i] + g_CurrentKey.tonicMidiPitch + g_CurrentKey.accidentalOffset,
				rootAccidentalOffset: accid
			};
			
			refreshButton(i, chord);
		}
	}
}