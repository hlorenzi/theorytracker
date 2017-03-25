var Theory = {};


Theory.chordKinds =
[
	/*
		`code` is what the compiler expects to parse.
		`symbol` dictates roman numeral analysis representation as follows:
			[isLowercase, complement, superscriptComplement]
	*/
	
	{ pitches: [0, 4, 7],         code: "",      symbol: [false, "",     "" ],     name: "Major" },
	{ pitches: [0, 3, 7],         code: "m",     symbol: [true,  "",     "" ],     name: "Minor" },
	{ pitches: [0, 4, 8],         code: "+",     symbol: [false, "+",    "" ],     name: "Augmented" },
	{ pitches: [0, 3, 6],         code: "o",     symbol: [true,  "",     "o"],     name: "Diminished" },
	{ pitches: [0, 2, 7],         code: "sus2",  symbol: [false, "sus2", "" ],     name: "Suspended Second" },
	{ pitches: [0, 5, 7],         code: "sus4",  symbol: [false, "sus4", "" ],     name: "Suspended Fourth" },
	
	{ pitches: [0, 0, 7, 12],     code: "5",     symbol: [false, "",     "5"],     name: "Power" },
	
	{ pitches: [0, 4, 7,  9],     code: "6",     symbol: [false, "",     "6"],     name: "Major Sixth" },
	{ pitches: [0, 3, 7,  9],     code: "m6",    symbol: [true,  "",     "6"],     name: "Minor Sixth" },
	
	{ pitches: [0, 4, 7, 10],     code: "7",     symbol: [false, "",     "7"],     name: "Dominant Seventh" },
	{ pitches: [0, 4, 7, 11],     code: "maj7",  symbol: [false, "",     "M7"],    name: "Major Seventh" },
	{ pitches: [0, 3, 7, 10],     code: "m7",    symbol: [true,  "",     "7"],     name: "Minor Seventh" },
	{ pitches: [0, 3, 7, 11],     code: "mmaj7", symbol: [true,  "",     "M7"],    name: "Minor-Major Seventh" },
	{ pitches: [0, 4, 8, 10],     code: "+7",    symbol: [false, "+",    "7"],     name: "Augmented Seventh" },
	{ pitches: [0, 4, 8, 11],     code: "+maj7", symbol: [false, "+",    "M7"],    name: "Augmented Major Seventh" },
	{ pitches: [0, 3, 6,  9],     code: "o7",    symbol: [true,  "",     "o7"],    name: "Diminished Seventh" },
	{ pitches: [0, 3, 6, 10],     code: "%7",    symbol: [true,  "",     "ø7"],    name: "Half-Diminished Seventh" },
	
	{ pitches: [0, 4, 7, 10, 14], code: "9",     symbol: [false, "",     "9"],     name: "Dominant Ninth" },
	{ pitches: [0, 4, 7, 11, 14], code: "maj9",  symbol: [false, "",     "M9"],    name: "Major Ninth" },
	{ pitches: [0, 3, 7, 10, 14], code: "m9",    symbol: [true,  "",     "9"],     name: "Minor Ninth" },
	{ pitches: [0, 3, 7, 11, 14], code: "mmaj9", symbol: [true, "",      "M9"],    name: "Minor-Major Ninth" },
	{ pitches: [0, 4, 8, 10, 14], code: "+9",    symbol: [false, "+",    "9"],     name: "Augmented Ninth" },
	{ pitches: [0, 4, 8, 11, 14], code: "+maj9", symbol: [false, "+",    "M9"],    name: "Augmented Major Ninth" },
	{ pitches: [0, 3, 6,  9, 14], code: "o9",    symbol: [true,  "",     "o9"],    name: "Diminished Ninth" },
	{ pitches: [0, 3, 6,  9, 13], code: "ob9",   symbol: [true,  "",     "o♭9"],   name: "Diminished Minor Ninth" },
	{ pitches: [0, 3, 6, 10, 14], code: "%9",    symbol: [true,  "",     "ø9"],    name: "Half-Diminished Ninth" },
	{ pitches: [0, 3, 6, 10, 13], code: "%b9",   symbol: [true,  "",     "ø♭9"],   name: "Half-Diminished Minor Ninth" }
];


Theory.isNoteRelativeInsteadOfAbsolute = function(string)
{
	for (var i = 0; i < string.length; i++)
	{
		switch (string.charAt(i).toLowerCase())
		{
			case "1": case "2": case "3":
			case "4": case "5": case "6":
			case "7":
				return true;
		}
	}
	
	return false;
}


Theory.isChordRelativeInsteadOfAbsolute = function(string)
{
	for (var i = 0; i < string.length; i++)
	{
		switch (string.charAt(i).toLowerCase())
		{
			case "i":
			case "v":
				return true;
		}
	}
	
	return false;
}


Theory.decodeAbsoluteNoteName = function(string)
{
	var note = 0;
	switch (string.charAt(0).toLowerCase())
	{
		case "c": note = 0; break;
		case "d": note = 2; break;
		case "e": note = 4; break;
		case "f": note = 5; break;
		case "g": note = 7; break;
		case "a": note = 9; break;
		case "b": note = 11; break;
		default: return null;
	}
	
	for (var i = 1; i < string.length; i++)
	{
		switch (string.charAt(i))
		{
			case "#": note += 1; break;
			case "b": note -= 1; break;
			default: return null;
		}
	}
	
	return note;
}


Theory.decodeRelativeNoteName = function(string)
{
	var degree = 0;
	var i = 0;
	
	loop: for ( ; i < string.length; i++)
	{
		switch (string.charAt(i))
		{
			case "#": degree += 1; break;
			case "b": degree -= 1; break;
			default: break loop;
		}
	}
	
	if (i != string.length - 1)
		return null;
	
	switch (string.charAt(i))
	{
		case "1": degree += 0; break;
		case "2": degree += 2; break;
		case "3": degree += 4; break;
		case "4": degree += 5; break;
		case "5": degree += 7; break;
		case "6": degree += 9; break;
		case "7": degree += 11; break;
		default: return null;
	}
	
	return degree;
}


Theory.decodeAbsoluteChordName = function(string)
{
	return Theory.decodeAbsoluteNoteName(string);
}


Theory.decodeRelativeChordName = function(string)
{
	var degree = 0;
	var i = 0;
	
	loop: for ( ; i < string.length; i++)
	{
		switch (string.charAt(i))
		{
			case "#": degree += 1; break;
			case "b": degree -= 1; break;
			default: break loop;
		}
	}
	
	switch (string.slice(i).toLowerCase())
	{
		case "i":   degree += 0; break;
		case "ii":  degree += 2; break;
		case "iii": degree += 4; break;
		case "iv":  degree += 5; break;
		case "v":   degree += 7; break;
		case "vi":  degree += 9; break;
		case "vii": degree += 11; break;
		default: return null;
	}
	
	return degree;
}


Theory.decodeChordKindName = function(string)
{
	for (var i = 0; i < Theory.chordKinds.length; i++)
	{
		if (string == Theory.chordKinds[i].code)
			return i;
	}
	
	return null;
}


Theory.getTruncatedPitchFromPitch = function(pitch)
{
	while (pitch >= 12)
		pitch -= 12;
		
	while (pitch < 0)
		pitch += 12;
	
	return pitch;
}


Theory.midiPitchMin = 12 * 2;
Theory.midiPitchMax = 12 * 9 - 1;


Theory.isValidMidiPitch = function(pitch)
{
	return pitch >= Theory.midiPitchMin && pitch <= Theory.midiPitchMax;
}


Theory.isValidOctave = function(octave)
{
	return octave >= 2 && octave < 9;
}


Theory.isValidBpm = function(bpm)
{
	return bpm >= 1 && bpm <= 999;
}


Theory.isValidMeterNumerator = function(numerator)
{
	return numerator >= 1 && numerator <= 256;
}


Theory.isValidMeterDenominator = function(denominator)
{
	return (
		denominator == 1 || denominator == 2 || denominator == 4 ||
		denominator == 8 || denominator == 16 || denominator == 32 ||
		denominator == 64 || denominator == 128);
}


Theory.getMeterLabel = function(numerator, denominator)
{
	return "" + numerator + " / " + denominator;
}


Theory.getKeyLabel = function(scale, tonicMidiPitch)
{
	// TODO: Use the representation set by the user (i.e., C# versus Db).
	var labels = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
	return labels[tonicMidiPitch % 12];
}


Theory.getChordRootLabel = function(scale, rootMidiPitch)
{
	// TODO: Use the representation set by the user (i.e., #IV versus bV).
	var labels = ["I", "♭II", "II", "♭III", "III", "IV", "♭V", "V", "♭VI", "VI", "♭VII", "VII"];
	return labels[rootMidiPitch % 12];
}


Theory.calculateChordPitches = function(chordKindIndex, rootMidiPitch, embelishments)
{
	var pitches = [];
	
	var octave = 12 * 4;
	if (rootMidiPitch >= 6)
		octave = 12 * 3;
	
	for (var i = 0; i < Theory.chordKinds[chordKindIndex].pitches.length; i++)
	{
		pitches.push(octave + rootMidiPitch + Theory.chordKinds[chordKindIndex].pitches[i]);
	}
	
	return pitches;
}


Theory.getChordBassPattern = function(meter)
{
	// [ [ start beat, end beat, volume ], ... ]
	switch (meter.numerator)
	{
		case 3: return [ [ 0, 1.5, 1 ], [ 1.5, 2, 0.7 ] ];
		case 4: return [ [ 0, 1.5, 1 ], [ 1.5, 2, 0.7 ], [ 2, 3.5, 1 ], [ 3.5, 4, 0.7 ] ];
		default: return [ ];
	}
}


Theory.getChordStackPattern = function(meter)
{
	// [ [ start beat, end beat, volume ], ... ]
	switch (meter.numerator)
	{
		case 3: return [ [ 0, 1, 1 ], [ 1, 2, 0.7 ], [ 2, 3, 0.7 ] ];
		case 4: return [ [ 0, 0.9, 1 ], [ 1, 1.9, 0.5 ], [ 2, 2.9, 0.7 ], [ 3, 3.9, 0.5 ] ];
		default: return [ ];
	}
}


Theory.playSampleNote = function(synth, midiPitch)
{
	synth.clear();
	synth.stop();
	synth.addNoteOn(0, 0, midiPitch, 1);
	synth.addNoteOff(0.1, 0, midiPitch);
	synth.play();
}


Theory.playSampleChord = function(synth, chordKindIndex, rootMidiPitch, embelishments)
{
	synth.clear();
	synth.stop();
	
	var pitches = Theory.calculateChordPitches(chordKindIndex, rootMidiPitch, embelishments);
	
	for (var j = 0; j < pitches.length; j++)
	{
		synth.addNoteOn(0, 1, pitches[j], 1);
		synth.addNoteOff(0.1, 1, pitches[j], 1);
	}
	
	synth.play();
}