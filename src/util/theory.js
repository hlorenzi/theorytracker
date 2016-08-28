function Theory()
{
	var C  = 0;  this.C  = C;
	var Cs = 1;  this.Cs = Cs;
	var D  = 2;  this.D  = D;
	var Ds = 3;  this.Ds = Ds;
	var E  = 4;  this.E  = E;
	var F  = 5;  this.F  = F;
	var Fs = 6;  this.Fs = Fs;
	var G  = 7;  this.G  = G;
	var Gs = 8;  this.Gs = Gs;
	var A  = 9;  this.A  = A;
	var As = 10; this.As = As;
	var B  = 11; this.B  = B;


	this.scales =
	[
		{ name: "Major", notes: [ C, D, E, F, G, A, B ], degrees: [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6] }
	];
	
	
	this.chords =
	[
		{ notes: [ C,  E,  G  ], uppercase: true,  symbolSup: "",     symbolSub: "", name: "Major" },
		{ notes: [ C,  Ds, G  ], uppercase: false, symbolSup: "",     symbolSub: "", name: "Minor" },
		{ notes: [ C,  Ds, Fs ], uppercase: false, symbolSup: "o",    symbolSub: "", name: "Diminished" },
		{ notes: [ C,  E,  Gs ], uppercase: true,  symbolSup: "+",    symbolSub: "", name: "Augmented" },
		{ notes: [ C,  E,  Fs ], uppercase: true,  symbolSup: "(♭5)", symbolSub: "", name: "Flat Fifth(?)" },
		{ notes: [ C,  D,  Fs ], uppercase: true,  symbolSup: "(?)",  symbolSub: "", name: "(?)" },
		
		{ notes: [ C,  E,  G,  As ], uppercase: true,  symbolSup: "7",     symbolSub: "", name: "Dominant Seventh" },
		{ notes: [ C,  E,  G,  B  ], uppercase: true,  symbolSup: "M7",    symbolSub: "", name: "Major Seventh" },
		{ notes: [ C,  Ds, G,  As ], uppercase: false, symbolSup: "7",     symbolSub: "", name: "Minor Seventh" },
		{ notes: [ C,  Ds, G,  B  ], uppercase: true,  symbolSup: "m(M7)", symbolSub: "", name: "Minor-Major Seventh" },
		{ notes: [ C,  Ds, G,  A  ], uppercase: false, symbolSup: "o7",    symbolSub: "", name: "Diminished Seventh" },
		{ notes: [ C,  Ds, Fs, As ], uppercase: false, symbolSup: "ø7",    symbolSub: "", name: "Half-Diminished Seventh" },
		{ notes: [ C,  E,  Gs, As ], uppercase: true,  symbolSup: "+7",    symbolSub: "", name: "Augmented Seventh" },
		{ notes: [ C,  E,  Gs, B  ], uppercase: true,  symbolSup: "+(M7)", symbolSub: "", name: "Augmented Major Seventh" }
	];
}


Theory.prototype.pitchNameInScale = function(scaleIndex, midiPitch)
{
	// TODO: Take into consideration scale accidentals.
	var names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
	return names[midiPitch % 12];
}


Theory.prototype.pitchDegreeInKey = function(scaleIndex, rootMidiPitch, midiPitch)
{
	return this.scales[scaleIndex].degrees[(midiPitch + 12 - rootMidiPitch) % 12];
}


Theory.prototype.chordSymbolInKey = function(scaleIndex, rootMidiPitch, midiPitch, uppercase)
{
	// TODO: Take into consideration scale accidentals.
	var upper = ["I", "♭II", "II", "♭III", "III", "IV", "♭V", "V", "♭VI", "VI", "♭VII", "VII"];
	var lower = ["i", "♭ii", "ii", "♭iii", "iii", "iv", "♭v", "v", "♭vi", "vi", "♭vii", "vii"];
	return (uppercase ? upper : lower)[(midiPitch + 12 - rootMidiPitch) % 12];
}


Theory.prototype.degreeColor = function(degree)
{
	switch (degree)
	{
		case 0:  return "#ff0000";
		case 1:  return "#ff8800";
		case 2:  return "#ffdd00";
		case 3:  return "#00dd00";
		case 4:  return "#0000ff";
		case 5:  return "#8800ff";
		case 6:  return "#ff00ff";
		case 7:  return "#ff0000";
		default: return "#888888";
	}
}


var theory = new Theory();