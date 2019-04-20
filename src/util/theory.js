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
	
	doubleHarmonic: { pitches: [0, 1, 4, 5, 7, 8, 11], mode: 0, name: "Double Harmonic Major" },
}


export const chords =
[
	{ pitches: [0, 4, 7], code: "",  symbol: [false, "", null], name: "Major", startGroup: "Triads" },
	{ pitches: [0, 3, 7], code: "m", symbol: [true,  "", null], name: "Minor" },
	{ pitches: [0, 4, 8], code: "+", symbol: [false, "", "+"],  name: "Augmented" },
	{ pitches: [0, 3, 6], code: "o", symbol: [true,  "", "o"],  name: "Diminished" },
	{ pitches: [0, 2, 6], code: "oo", symbol: [true,  "", "oo"],  name: "Doubly-Diminished" },
	{ pitches: [0, 4, 6], code: "b5", symbol: [false,  "", "(b5)"],  name: "Flat-Fifth" },
	
	{ pitches: [0, 0, 7, 12], code: "5", symbol: [false, "", "5"], name: "Power" },
	
	{ pitches: [0, 4, 7,  9], code: "6",  symbol: [false, "", "6"], name: "Major Sixth", startGroup: "Sixths" },
	{ pitches: [0, 3, 7,  9], code: "m6", symbol: [true,  "", "6"], name: "Minor Sixth" },
	
	{ pitches: [0, 4, 7, 10], code: "7",     symbol: [false, "",  "7"],  name: "Dominant Seventh", startGroup: "Sevenths" },
	{ pitches: [0, 4, 7, 11], code: "maj7",  symbol: [false, "",  "M7"], name: "Major Seventh" },
	{ pitches: [0, 3, 7, 10], code: "m7",    symbol: [true,  "",  "7"],  name: "Minor Seventh" },
	{ pitches: [0, 3, 7, 11], code: "mmaj7", symbol: [true,  "",  "M7"], name: "Minor-Major Seventh" },
	{ pitches: [0, 4, 8, 10], code: "+7",    symbol: [false, "+", "7"],  name: "Augmented Seventh" },
	{ pitches: [0, 4, 8, 11], code: "+maj7", symbol: [false, "+", "M7"], name: "Augmented Major Seventh" },
	{ pitches: [0, 3, 6,  9], code: "o7",    symbol: [true,  "",  "o7"], name: "Diminished Seventh" },
	{ pitches: [0, 3, 6, 10], code: "%7",    symbol: [true,  "",  "ø7"], name: "Half-Diminished Seventh" },
	
	{ pitches: [0, 4, 7, 10, 14], code: "9",     symbol: [false, "",  "9"],   name: "Dominant Ninth", startGroup: "Ninths" },
	{ pitches: [0, 4, 7, 11, 14], code: "maj9",  symbol: [false, "",  "M9"],  name: "Major Ninth" },
	{ pitches: [0, 3, 7, 10, 14], code: "m9",    symbol: [true,  "",  "9"],   name: "Minor Ninth" },
	{ pitches: [0, 3, 7, 11, 14], code: "mmaj9", symbol: [true, "",   "M9"],  name: "Minor-Major Ninth" },
	{ pitches: [0, 3, 7, 10, 13], code: "9?",    symbol: [true, "",   "9?"],  name: "???" },
	{ pitches: [0, 4, 8, 10, 14], code: "+9",    symbol: [false, "+", "9"],   name: "Augmented Ninth" },
	{ pitches: [0, 4, 8, 11, 14], code: "+maj9", symbol: [false, "+", "M9"],  name: "Augmented Major Ninth" },
	{ pitches: [0, 3, 6,  9, 14], code: "o9",    symbol: [true,  "",  "o9"],  name: "Diminished Ninth" },
	{ pitches: [0, 3, 6,  9, 13], code: "ob9",   symbol: [true,  "",  "o♭9"], name: "Diminished Minor Ninth" },
	{ pitches: [0, 3, 6, 10, 14], code: "%9",    symbol: [true,  "",  "ø9"],  name: "Half-Diminished Ninth" },
	{ pitches: [0, 3, 6, 10, 13], code: "%b9",   symbol: [true,  "",  "ø♭9"], name: "Half-Diminished Minor Ninth" },
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


export function getChordKindFromPitches(pitches)
{
	return Object.values(chords).findIndex(chord =>
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
	
	return degree + 7 * (Math.floor((pitch - (key.tonicPitch + key.tonicAccidental)) / 12) - 5)
}


export function getPitchForScaleDegree(key, degree)
{
	const degreeClamped = mod(degree, 7)
	const degreeOctave = Math.floor(degree / 7) + 5
	
	return key.tonicPitch + key.tonicAccidental + key.scalePitches[Math.floor(degreeClamped)] + degreeOctave * 12
}


export function getNameForPitch(key, pitch)
{
	const baseLabels = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]
	const baseAccidentals = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
	const letterStrs = ["C", "D", "E", "F", "G", "A", "B"]
	const letterPitches = [0, 2, 4, 5, 7, 9, 11]
	
	pitch = mod(pitch, 12)
	const degree = mod(getScaleDegreeForPitch(key, pitch), 7)
	
	const keyLetter = baseLabels[key.tonicPitch]
	const noteLetter = mod(keyLetter + Math.floor(degree), 7)
	const accidental = mod(pitch - letterPitches[noteLetter] + 6, 12) - 6
	
	const accidentalStr = 
		accidental == 0 ? "" :
		accidental >  0 ? "♯".repeat(accidental) :
		"♭".repeat(-accidental)
	
	return letterStrs[noteLetter] + accidentalStr
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


export class Chord
{
	constructor(rootPitch, rootAccidental, kind, modifiers = {})
	{
		this.rootPitch = rootPitch
		this.rootAccidental = rootAccidental
		this.kind = kind
		this.modifiers = modifiers
	}
	
	
	getNameBase(key)
	{
		const degree = getScaleDegreeForPitch(key, this.rootPitch)
		const chordKind = chords[this.kind] || { symbol: [false, "", "?"] }
		
		let baseStr = getRomanNumeralScaleDegreeStr(degree, this.rootAccidental)
		if (chordKind.symbol[0])
			baseStr = baseStr.toLowerCase()
		
		return baseStr + chordKind.symbol[1]
	}
	
	
	getNameSup(key)
	{
		const chordKind = chords[this.kind] || { symbol: [false, "", "?"] }
		
		let supStr = chordKind.symbol[2] || ""
		
		if (this.modifiers)
		{
			if (this.modifiers.add9)
				supStr += "(add9)"
			
			if (this.modifiers.add11)
				supStr += "(add11)"
			
			if (this.modifiers.add13)
				supStr += "(add13)"
			
			if (this.modifiers.no3)
				supStr += "(no3)"
			
			if (this.modifiers.no5)
				supStr += "(no5)"
		}
		
		return supStr
	}
	
	
	getNameSub(key)
	{
		let subStr = ""
		
		if (this.modifiers)
		{
			if (this.modifiers.sus2)
			{
				if (this.modifiers.sus4)
					subStr += "sus24"
				else
					subStr += "sus2"
			}
			else if (this.modifiers.sus4)
				subStr += "sus4"
		}
		
		return subStr
	}
	
	
	getColor(key)
	{
		const degree = getScaleDegreeForPitch(key, this.rootPitch)
		const colorRotation = getColorRotationForScale(key.scalePitches)
		const color = getColorForScaleDegree(colorRotation + degree)
		return color
	}
}