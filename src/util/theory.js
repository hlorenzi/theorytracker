function mod(x, m)
{
	return (x % m + m) % m
}


export const scales =
{
	major:      { pitches: [0, 2, 4, 5, 7, 9, 11], mode: 0, name: "Major" },
	dorian:     { pitches: [0, 2, 3, 5, 7, 9, 10], mode: 1, name: "Dorian" },
	phrygian:   { pitches: [0, 1, 3, 5, 7, 8, 10], mode: 2, name: "Phrygian" },
	lydian:     { pitches: [0, 2, 4, 6, 7, 9, 11], mode: 3, name: "Lydian" },
	mixolydian: { pitches: [0, 2, 4, 5, 7, 9, 10], mode: 4, name: "Mixolydian" },
	minor:      { pitches: [0, 2, 3, 5, 7, 8, 10], mode: 5, name: "Natural Minor" },
	locrian:    { pitches: [0, 1, 3, 5, 6, 8, 10], mode: 6, name: "Locrian" },
}


export const chords =
{
	// `symbol` = [isLowercase, complement, superscriptComplement]
	
	major:      { pitches: [0, 4, 7], code: "",  symbol: [false, "",  "" ], name: "Major", startGroup: "Triads" },
	minor:      { pitches: [0, 3, 7], code: "m", symbol: [true,  "",  "" ], name: "Minor" },
	augmented:  { pitches: [0, 4, 8], code: "+", symbol: [false, "+", "" ], name: "Augmented" },
	diminished: { pitches: [0, 3, 6], code: "o", symbol: [true,  "",  "o"], name: "Diminished" },
	
	power: { pitches: [0, 0, 7, 12], code: "5", symbol: [false, "", "5"], name: "Power" },
	
	major6: { pitches: [0, 4, 7,  9], code: "6",  symbol: [false, "", "6"], name: "Major Sixth", startGroup: "Sixths" },
	minor6: { pitches: [0, 3, 7,  9], code: "m6", symbol: [true,  "", "6"], name: "Minor Sixth" },
	
	dominant7:       { pitches: [0, 4, 7, 10], code: "7",     symbol: [false, "",  "7"],  name: "Dominant Seventh", startGroup: "Sevenths" },
	major7:          { pitches: [0, 4, 7, 11], code: "maj7",  symbol: [false, "",  "M7"], name: "Major Seventh" },
	minor7:          { pitches: [0, 3, 7, 10], code: "m7",    symbol: [true,  "",  "7"],  name: "Minor Seventh" },
	minorMajor7:     { pitches: [0, 3, 7, 11], code: "mmaj7", symbol: [true,  "",  "M7"], name: "Minor-Major Seventh" },
	augmented7:      { pitches: [0, 4, 8, 10], code: "+7",    symbol: [false, "+", "7"],  name: "Augmented Seventh" },
	augmentedMajor7: { pitches: [0, 4, 8, 11], code: "+maj7", symbol: [false, "+", "M7"], name: "Augmented Major Seventh" },
	diminished7:     { pitches: [0, 3, 6,  9], code: "o7",    symbol: [true,  "",  "o7"], name: "Diminished Seventh" },
	halfDiminished7: { pitches: [0, 3, 6, 10], code: "%7",    symbol: [true,  "",  "ø7"], name: "Half-Diminished Seventh" },
	
	dominant9:            { pitches: [0, 4, 7, 10, 14], code: "9",     symbol: [false, "",  "9"],   name: "Dominant Ninth", startGroup: "Ninths" },
	major9:               { pitches: [0, 4, 7, 11, 14], code: "maj9",  symbol: [false, "",  "M9"],  name: "Major Ninth" },
	minor9:               { pitches: [0, 3, 7, 10, 14], code: "m9",    symbol: [true,  "",  "9"],   name: "Minor Ninth" },
	minorMajor9:          { pitches: [0, 3, 7, 11, 14], code: "mmaj9", symbol: [true, "",   "M9"],  name: "Minor-Major Ninth" },
	augmented9:           { pitches: [0, 4, 8, 10, 14], code: "+9",    symbol: [false, "+", "9"],   name: "Augmented Ninth" },
	augmentedMajor9:      { pitches: [0, 4, 8, 11, 14], code: "+maj9", symbol: [false, "+", "M9"],  name: "Augmented Major Ninth" },
	diminished9:          { pitches: [0, 3, 6,  9, 14], code: "o9",    symbol: [true,  "",  "o9"],  name: "Diminished Ninth" },
	diminishedMinor9:     { pitches: [0, 3, 6,  9, 13], code: "ob9",   symbol: [true,  "",  "o♭9"], name: "Diminished Minor Ninth" },
	halfDiminished9:      { pitches: [0, 3, 6, 10, 14], code: "%9",    symbol: [true,  "",  "ø9"],  name: "Half-Diminished Ninth" },
	halfDiminishedMinor9: { pitches: [0, 3, 6, 10, 13], code: "%b9",   symbol: [true,  "",  "ø♭9"], name: "Half-Diminished Minor Ninth" },
}


export const chordList =
[
	chords.major, chords.minor, chords.augmented, chords.diminished, chords.power, chords.major6, chords.minor6,
	chords.dominant7, chords.major7, chords.minor7, chords.minorMajor7, chords.augmented7, chords.augmentedMajor7,
	chords.diminished7, chords.halfDiminished7,
	chords.dominant9, chords.major9, chords.minor9, chords.minorMajor9, chords.augmented9, chords.augmentedMajor9,
	chords.diminished9, chords.diminishedMinor9, chords.halfDiminished9, chords.halfDiminishedMinor9,
]


export function getScaleRecordFromPitches(pitches)
{
	return Object.values(scales).find(scale =>
	(
		scale.pitches.length == pitches.length &&
		scale.pitches.every((p, index) => p == pitches[index])
	))
}


export function getChordRecordFromPitches(pitches)
{
	return Object.values(chords).find(chord =>
	(
		chord.pitches.length == pitches.length &&
		chord.pitches.every((p, index) => p == pitches[index])
	))
}


export function getAbsolutePitchStr(pitch, accidental)
{
	const baseLabels = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]
	const baseAccidentals = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
	const labelStrs = ["C", "D", "E", "F", "G", "A", "B"]
	
	pitch = mod(pitch, 12)
	accidental += baseAccidentals[pitch]
	
	const accidentalStr = 
		accidental == 0 ? "" :
		accidental >  0 ? "♯".repeat(accidental) :
		"♭".repeat(-accidental)
	
	return labelStrs[baseLabels[pitch]] + accidentalStr
}


export function getRomanNumeralPitchStr(pitch, accidental)
{
	const baseLabels = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6]
	const baseAccidentals = [0, -1, 0, -1, 0, 0, -1, 0, -1, 0, -1, 0]
	const labelStrs = ["I", "II", "III", "IV", "V", "VI", "VII"]
	
	pitch = mod(pitch, 12)
	accidental += baseAccidentals[pitch]
	
	const accidentalStr = 
		accidental == 0 ? "" :
		accidental >  0 ? "♯".repeat(accidental) :
		"♭".repeat(-accidental)
	
	return accidentalStr + labelStrs[baseLabels[pitch]]
}


export function getRomanNumeralScaleDegreeStr(degree, accidental)
{
	const labelStrs = ["I", "II", "III", "IV", "V", "VI", "VII"]
	
	if (Math.floor(degree) != degree)
	{
		degree = Math.floor(degree) + 1
		accidental -= 1
	}
	
	const accidentalStr = 
		accidental == 0 ? "" :
		accidental >  0 ? "♯".repeat(accidental) :
		"♭".repeat(-accidental)
	
	return accidentalStr + labelStrs[mod(degree, 7)]
}


export function getTonicPitchRowOffset(tonicPitch)
{
	const rowOffsets = [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6]
	
	return rowOffsets[mod(tonicPitch, 12)]
}


export function getScaleDegreeForPitch(key, pitch)
{
	const relativePitch = mod(pitch - (key.tonicPitch + key.tonicAccidental), 12)
	
	let degree = 6.5
	for (let i = 0; i < key.scalePitches.length; i++)
	{
		if (relativePitch == key.scalePitches[i])
		{
			degree = i
			break
		}
		
		if (relativePitch < key.scalePitches[i])
		{
			degree = (i + 7 - 0.5) % 7
			break
		}
	}
	
	return degree
}


export function getScaleOctaveForPitch(key, pitch)
{
	return Math.floor((pitch - (key.tonicPitch + key.tonicAccidental)) / 12)
}


export function getColorForScaleDegree(degree)
{
	switch (mod(degree, 7))
	{
		case 0: return "#f00"
		case 1: return "#f80"
		case 2: return "#fd0"
		case 3: return "#0d0"
		case 4: return "#00f"
		case 5: return "#80f"
		case 6: return "#f0f"
		default: return "#aaa"
	}
}


export function getColorRotationForScale(pitches)
{
	const scale = getScaleRecordFromPitches(pitches)
	return scale.mode
}


export class Key
{
	constructor(tonicPitch, tonicAccidental, scalePitches)
	{
		this.tonicPitch = tonicPitch
		this.tonicAccidental = tonicAccidental
		this.scalePitches = scalePitches
	}
	
	
	getName()
	{
		const scaleRecord = getScaleRecordFromPitches(this.scalePitches) || { name: "Unknown Scale" }
		
		return getAbsolutePitchStr(this.tonicPitch, this.tonicAccidental) + " " + scaleRecord.name
	}
}