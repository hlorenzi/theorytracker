var Theory = {};


// // //
Theory.scales =
[
	{ pitches: [ 0,  2,  4, -1,  1,  3,  5], name: "Major" },
	{ pitches: [ 2,  4, -1,  1,  3,  5,  0], name: "Dorian" },
	{ pitches: [ 4, -1,  1,  3,  5,  0,  2], name: "Phrygian" },
	{ pitches: [-1,  1,  3,  5,  0,  2,  4], name: "Lydian" },
	{ pitches: [ 1,  3,  5,  0,  2,  4, -1], name: "Mixolydian" },
	{ pitches: [ 3,  5,  0,  2,  4, -1,  1], name: "Natural Minor" },
	{ pitches: [ 5,  0,  2,  4, -1,  1,  3], name: "Locrian" }
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


// // //
Theory.chordKinds =
[
	/*
		`code` is what the compiler expects to parse.
		`symbol` dictates roman numeral analysis representation as follows:
			[isLowercase, complement, superscriptComplement]
		// // //
		`ext` indicates the upper structure index
	*/
	
	{ pitches: [0,  4,  1],         code: "",      symbol: [false, "",     "" ],     name: "Major", startGroup: "Triads" },
	{ pitches: [0, -3,  1],         code: "m",     symbol: [true,  "",     "" ],     name: "Minor" },
	{ pitches: [0,  4,  8],         code: "+",     symbol: [false, "+",    "" ],     name: "Augmented" },
	{ pitches: [0, -3, -6],         code: "o",     symbol: [true,  "",     "o"],     name: "Diminished" },
	
	{ pitches: [0,  0,  1,  0],     code: "5",     symbol: [false, "",     "5"],     name: "Power", ext: 3 },
	
	{ pitches: [0,  4,  1,  3],     code: "6",     symbol: [false, "",     "6"],     name: "Major Sixth", startGroup: "Sixths" },
	{ pitches: [0, -3,  1,  3],     code: "m6",    symbol: [true,  "",     "6"],     name: "Minor Sixth" },
	
	{ pitches: [0,  4,  1, -2],     code: "7",     symbol: [false, "",     "7"],     name: "Dominant Seventh", startGroup: "Sevenths" },
	{ pitches: [0,  4,  1,  5],     code: "maj7",  symbol: [false, "",     "M7"],    name: "Major Seventh" },
	{ pitches: [0, -3,  1, -2],     code: "m7",    symbol: [true,  "",     "7"],     name: "Minor Seventh" },
	{ pitches: [0, -3,  1,  5],     code: "mmaj7", symbol: [true,  "",     "M7"],    name: "Minor-Major Seventh" },
	{ pitches: [0,  4,  8, -2],     code: "+7",    symbol: [false, "+",    "7"],     name: "Augmented Seventh" },
	{ pitches: [0,  4,  8,  5],     code: "+maj7", symbol: [false, "+",    "M7"],    name: "Augmented Major Seventh" },
	{ pitches: [0, -3, -6, -9],     code: "o7",    symbol: [true,  "",     "o7"],    name: "Diminished Seventh" },
	{ pitches: [0, -3, -6, -2],     code: "%7",    symbol: [true,  "",     "ø7"],    name: "Half-Diminished Seventh" },
	
	{ pitches: [0,  4,  1, -2,  2], code: "9",     symbol: [false, "",     "9"],     name: "Dominant Ninth", ext: 4, startGroup: "Ninths" },
	{ pitches: [0,  4,  1,  5,  2], code: "maj9",  symbol: [false, "",     "M9"],    name: "Major Ninth", ext: 4 },
	{ pitches: [0, -3,  1, -2,  2], code: "m9",    symbol: [true,  "",     "9"],     name: "Minor Ninth", ext: 4 },
	{ pitches: [0, -3,  1,  5,  2], code: "mmaj9", symbol: [true, "",      "M9"],    name: "Minor-Major Ninth", ext: 4 },
	{ pitches: [0,  4,  8, -2,  2], code: "+9",    symbol: [false, "+",    "9"],     name: "Augmented Ninth", ext: 4 },
	{ pitches: [0,  4,  8,  5,  2], code: "+maj9", symbol: [false, "+",    "M9"],    name: "Augmented Major Ninth", ext: 4 },
	{ pitches: [0, -3, -6, -9,  2], code: "o9",    symbol: [true,  "",     "o9"],    name: "Diminished Ninth", ext: 4 },
	{ pitches: [0, -3, -6, -9, -5], code: "ob9",   symbol: [true,  "",     "o♭9"],   name: "Diminished Minor Ninth", ext: 4 },
	{ pitches: [0, -3, -6, -2,  2], code: "%9",    symbol: [true,  "",     "ø9"],    name: "Half-Diminished Ninth", ext: 4 },
	{ pitches: [0, -3, -6, -2, -5], code: "%b9",   symbol: [true,  "",     "ø♭9"],   name: "Half-Diminished Minor Ninth", ext: 4 }
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


// // //
Theory.getScaleDegree = function(pitch)
{
	return mod(pitch * 4, 7); // zero-based
}


Theory.getSharps = function(scaleIndex, pitch, usePopularNotation = true)
{
	if (!usePopularNotation)
	{
		var degree = Theory.getScaleDegree(pitch);
		pitch -= Theory.getPitchForScaleInterval(scaleIndex, 0, degree);
	}
	return Math.floor((pitch + 1) / 7);
}


Theory.getSemitones = function(pitch)
{
	return mod(pitch * 7, 12);
}


Theory.getPitchForScaleInterval = function(scaleIndex, degreeLo, degreeHi)
{
	const pitches = Theory.scales[scaleIndex].pitches;
	return pitches[mod(degreeHi, pitches.length)] - pitches[mod(degreeLo, pitches.length)];
}


Theory.getAccidentalString = function(offset)
{
	if (offset > 0)
		return ("♯").repeat(offset);
	if (offset < 0)
		return ("♭").repeat(-offset);
	return "";
}


Theory.getMeterLabel = function(numerator, denominator)
{
	return "" + numerator + " / " + denominator;
}


Theory.getIndependentPitchLabel = function(pitch)
{
	// // //
	const labels = ["C", "D", "E", "F", "G", "A", "B"];
	return labels[Theory.getScaleDegree(pitch)] + Theory.getAccidentalString(Theory.getSharps(0, pitch));
}


// // //
Theory.getKeyLabel = function(scaleIndex, pitch)
{
	// TODO: Take scale into consideration.
	return Theory.getIndependentPitchLabel(pitch) + " " + Theory.scales[scaleIndex].name;
}


Theory.getChordRootLabel = function(scaleIndex, pitch, usePopularNotation = true)
{
	const labels = ["I", "II", "III", "IV", "V", "VI", "VII"];
	const name = labels[Theory.getScaleDegree(pitch)];
	const acc = Theory.getSharps(scaleIndex, pitch, usePopularNotation);
	return Theory.getAccidentalString(acc) + name;
}


Theory.getChordLabelMain = function(scaleIndex, chordKindIndex, pitch, embelishments, usePopularNotation = true)
{
	var rootLabel = Theory.getChordRootLabel(scaleIndex, pitch, usePopularNotation);
	
	if (Theory.chordKinds[chordKindIndex].symbol[0])
		rootLabel = rootLabel.toLowerCase();
	
	return rootLabel + Theory.chordKinds[chordKindIndex].symbol[1];
}


Theory.getChordLabelSuperscript = function(scaleIndex, chordKindIndex, pitch, embelishments, usePopularNotation = true)
{
	return Theory.chordKinds[chordKindIndex].symbol[2];
}


Theory.calculateChordPitches = function(chordKindIndex, rootPitch, embelishments)
{
	var pitches = [];
	let chord = Theory.chordKinds[chordKindIndex];
	
	var octave = 12 * 4;
	let rootMidiPitch = Theory.getSemitones(rootPitch);		// // //
	if (rootMidiPitch >= 6)
		octave -= 12;
	
	for (var i = 0; i < chord.pitches.length; i++)
	{
		if (i == chord.ext)
			octave += 12;
		let pitch = chord.pitches[i];
		pitches.push(octave + rootMidiPitch + Theory.getSemitones(pitch));
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


Theory.findChordKindForDegree = function(scaleIndex, degree)
{
	var scale = Theory.scales[scaleIndex].pitches;
	
	var chordPitches = [];
	for (var i = 0; i < 3; i++)
	{
		chordPitches.push(scale[mod(degree + i * 2, scale.length)]);		// // //
	}
	
	return Theory.findChordKindIndex(chordPitches);
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
			if (relativePitches[j] - relativePitches[0] != chordKind.pitches[j] - chordKind.pitches[0]) {
				match = false;
				break;
			}
		}
		
		if (match)
			return i;
	}
	
	return null;
}


Theory.findPitchForSemitones = function(keyPitch, scaleIndex, semitones, downward)
{
	let scale = Theory.scales[scaleIndex];
	let table = downward ? scale.midi.down : scale.midi.up;
	return table[mod(semitones - Theory.getSemitones(keyPitch), 12)] + keyPitch;
}


Theory.playSampleNote = function(synth, midiPitch)
{
	synth.clear();
	synth.stop();
	synth.addNoteOn(0, 0, midiPitch, 1);
	synth.addNoteOff(0.1, 0, midiPitch);
	synth.play();
}


Theory.playSampleChord = function(synth, chordKindIndex, rootPitch, embelishments)
{
	synth.clear();
	synth.stop();
	
	var pitches = Theory.calculateChordPitches(chordKindIndex, rootPitch, embelishments);
	
	for (var j = 0; j < pitches.length; j++)
	{
		synth.addNoteOn(0, 1, pitches[j], 1);
		synth.addNoteOff(0.1, 1, pitches[j], 1);
	}
	
	synth.play();
}


// // //
Theory.getPitchColor = function(scaleIndex, pitch, usePopularNotation = true)
{
	let step = Theory.getScaleDegree(pitch) * 2 + Math.sign(Theory.getSharps(scaleIndex, pitch, usePopularNotation));
	switch (step)
	{
		case  0: return ["#f00", "#fdd"];
		case  2: return ["#f80", "#fed"];
		case  4: return ["#fd0", "#fed"];
		case  6: return ["#0d0", "#dfd"];
		case  8: return ["#00f", "#ddf"];
		case 10: return ["#80f", "#edf"];
		case 12: return ["#f0f", "#fdf"];
		
		case  1: return ["#800", "#fdd"];
		case  3: return ["#840", "#fed"];
		case  5: return ["#860", "#fed"];
		case  7: return ["#060", "#dfd"];
		case  9: return ["#008", "#ddf"];
		case 11: return ["#408", "#edf"];
		case -1:
		case 13: return ["#808", "#fdf"];
		
		default: return ["#888", "#eee"];
	}
}


for (let i = 0; i < Theory.scales.length; i++)
{
	let scale = Theory.scales[i];
	scale.midi = { up: [], down: [] };
	for (let j = 0; j < scale.pitches.length; j++)
	{
		let semitones = Theory.getSemitones(scale.pitches[j]);
		scale.midi.up[semitones] = scale.pitches[j];
		scale.midi.down[semitones] = scale.pitches[j];
	}
	for (let s = 0; s < 12; s++)
	{
		if (scale.midi.up[s] == undefined)
			scale.midi.up[s] = scale.midi.up[mod(s - 1, 12)] + 7;
		if (scale.midi.down[s] == undefined)
			scale.midi.down[s] = scale.midi.down[mod(s + 1, 12)] - 7;
	}
}
