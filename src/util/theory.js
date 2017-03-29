var Theory = {};


Theory.scales =
[
	{ pitches: [0, 2, 4, 5, 7, 9, 11], name: "Major" },
	{ pitches: [0, 2, 3, 5, 7, 9, 10], name: "Dorian" },
	{ pitches: [0, 1, 3, 5, 7, 8, 10], name: "Phrygian" },
	{ pitches: [0, 2, 4, 6, 7, 9, 11], name: "Lydian" },
	{ pitches: [0, 2, 4, 5, 7, 9, 10], name: "Mixolydian" },
	{ pitches: [0, 2, 3, 5, 7, 8, 10], name: "Natural Minor" },
	{ pitches: [0, 1, 3, 5, 6, 8, 10], name: "Locrian" }
];


Theory.meterNumerators =
[
	 1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15, 16,
	17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
];


Theory.meterDenominators =
[
	1, 2, 4, 8, 16, 32
];


Theory.chordKinds =
[
	/*
		`code` is what the compiler expects to parse.
		`symbol` dictates roman numeral analysis representation as follows:
			[isLowercase, complement, superscriptComplement]
	*/
	
	{ pitches: [0, 4, 7],         code: "",      symbol: [false, "",     "" ],     name: "Major", startGroup: "Triads" },
	{ pitches: [0, 3, 7],         code: "m",     symbol: [true,  "",     "" ],     name: "Minor" },
	{ pitches: [0, 4, 8],         code: "+",     symbol: [false, "+",    "" ],     name: "Augmented" },
	{ pitches: [0, 3, 6],         code: "o",     symbol: [true,  "",     "o"],     name: "Diminished" },
	
	{ pitches: [0, 0, 7, 12],     code: "5",     symbol: [false, "",     "5"],     name: "Power" },
	
	{ pitches: [0, 4, 7,  9],     code: "6",     symbol: [false, "",     "6"],     name: "Major Sixth", startGroup: "Sixths" },
	{ pitches: [0, 3, 7,  9],     code: "m6",    symbol: [true,  "",     "6"],     name: "Minor Sixth" },
	
	{ pitches: [0, 4, 7, 10],     code: "7",     symbol: [false, "",     "7"],     name: "Dominant Seventh", startGroup: "Sevenths" },
	{ pitches: [0, 4, 7, 11],     code: "maj7",  symbol: [false, "",     "M7"],    name: "Major Seventh" },
	{ pitches: [0, 3, 7, 10],     code: "m7",    symbol: [true,  "",     "7"],     name: "Minor Seventh" },
	{ pitches: [0, 3, 7, 11],     code: "mmaj7", symbol: [true,  "",     "M7"],    name: "Minor-Major Seventh" },
	{ pitches: [0, 4, 8, 10],     code: "+7",    symbol: [false, "+",    "7"],     name: "Augmented Seventh" },
	{ pitches: [0, 4, 8, 11],     code: "+maj7", symbol: [false, "+",    "M7"],    name: "Augmented Major Seventh" },
	{ pitches: [0, 3, 6,  9],     code: "o7",    symbol: [true,  "",     "o7"],    name: "Diminished Seventh" },
	{ pitches: [0, 3, 6, 10],     code: "%7",    symbol: [true,  "",     "ø7"],    name: "Half-Diminished Seventh" },
	
	{ pitches: [0, 4, 7, 10, 14], code: "9",     symbol: [false, "",     "9"],     name: "Dominant Ninth", startGroup: "Ninths" },
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


Theory.getIndependentPitchLabel = function(midiPitch)
{
	var labels = ["C", "C♯/D♭", "D", "D♯/E♭", "E", "F", "F♯/G♭", "G", "G♯/A♭", "A", "A♯/B♭", "B"];
	return labels[midiPitch % 12];
}


Theory.getKeyLabel = function(scaleIndex, tonicMidiPitch)
{
	// TODO: Take scale into consideration.
	var labels = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
	return labels[tonicMidiPitch % 12] + " " + Theory.scales[scaleIndex].name;
}


Theory.getChordRootLabel = function(scaleIndex, relativePitch, usePopularNotation = true)
{
	if (usePopularNotation)
	{
		var labels = ["I", "♭II", "II", "♭III", "III", "IV", "♭V", "V", "♭VI", "VI", "♭VII", "VII"];
		return labels[relativePitch % 12];
	}
	else
	{
		// FIXME: Compute correct Common Practice labels.
		var labels = ["I", "II", "III", "IV", "V", "VI", "VII", "I"];
		
		var degree = Theory.findPitchDegree(scaleIndex, relativePitch, false);
		var degreeInteger = Math.floor(degree);
		
		if (degree == degreeInteger)
			return labels[degreeInteger];
		else
			return "♭" + labels[degreeInteger + 1];
	}
}


Theory.getChordLabelMain = function(scaleIndex, chordKindIndex, relativePitch, embelishments, usePopularNotation = true)
{
	var rootLabel = Theory.getChordRootLabel(scaleIndex, relativePitch, usePopularNotation);
	
	if (Theory.chordKinds[chordKindIndex].symbol[0])
		rootLabel = rootLabel.toLowerCase();
	
	return rootLabel + Theory.chordKinds[chordKindIndex].symbol[1];
}


Theory.getChordLabelSuperscript = function(scaleIndex, chordKindIndex, relativePitch, embelishments, usePopularNotation = true)
{
	return Theory.chordKinds[chordKindIndex].symbol[2];
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


/*Theory.getChordBassPattern = function(meter)
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
}*/


Theory.findPitchDegree = function(scaleIndex, relativePitch, usePopularNotation = true)
{
	var scale = Theory.scales[scaleIndex];
	if (usePopularNotation)
		scale = Theory.scales[0];
	
	for (var i = 0; i < scale.pitches.length; i++)
	{
		if (relativePitch == scale.pitches[i])
			return i;
		
		if (relativePitch < scale.pitches[i])
			return (i + 7 - 0.5) % 7;
	}
	
	return 6.5;
}


Theory.findChordKindIndex = function(relativePitches)
{
	for (var i = 0; i < Theory.chordKinds.length; i++)
	{
		var chordKind = Theory.chordKinds[i];
		
		if (relativePitches.length != chordKind.pitches.length)
			continue;
		
		var match = true;
		for (var j = 0; j < relativePitches.length; j++)
		{
			if (relativePitches[j] - relativePitches[0] != chordKind.pitches[j])
				match = false;
		}
		
		if (match)
			return i;
	}
	
	return null;
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


Theory.getDegreeColor = function(degree)
{
	switch (degree)
	{
		case 0: return "#f00";
		case 1: return "#f80";
		case 2: return "#fd0";
		case 3: return "#0d0";
		case 4: return "#00f";
		case 5: return "#80f";
		case 6: return "#f0f";
		
		case 0.5: return "#800";
		case 1.5: return "#840";
		case 2.5: return "#860";
		case 3.5: return "#060";
		case 4.5: return "#008";
		case 5.5: return "#408";
		case 6.5: return "#808";
		
		default: return "#888";
	}
}


Theory.getDegreeColorAccent = function(degree)
{
	switch (degree)
	{
		case 0: return "#fdd";
		case 1: return "#fed";
		case 2: return "#fed";
		case 3: return "#dfd";
		case 4: return "#ddf";
		case 5: return "#edf";
		case 6: return "#fdf";
		
		case 0.5: return "#fdd";
		case 1.5: return "#fed";
		case 2.5: return "#fed";
		case 3.5: return "#dfd";
		case 4.5: return "#ddf";
		case 5.5: return "#edf";
		case 6.5: return "#fdf";
		
		default: return "#eee";
	}
}