import { Rational } from "./rational.js"


export function mod(x, m)
{
	return (x % m + m) % m
}


export const scales =
[
	{ pitches: [0, 2, 4, 5, 7, 9, 11], mode: 0, name: "Major" },
	{ pitches: [0, 2, 3, 5, 7, 9, 10], mode: 1, name: "Dorian" },
	{ pitches: [0, 1, 3, 5, 7, 8, 10], mode: 2, name: "Phrygian" },
	{ pitches: [0, 2, 4, 6, 7, 9, 11], mode: 3, name: "Lydian" },
	{ pitches: [0, 2, 4, 5, 7, 9, 10], mode: 4, name: "Mixolydian" },
	{ pitches: [0, 2, 3, 5, 7, 8, 10], mode: 5, name: "Natural Minor" },
	{ pitches: [0, 1, 3, 5, 6, 8, 10], mode: 6, name: "Locrian" },
	
	{ pitches: [0, 1, 4, 5, 7, 8, 11], mode: 0, name: "Double Harmonic Major" },
]


export const chords =
[
	{ pitches: [0, 4, 7], id: "M", symbol: [false, "", null], name: "Major", startGroup: "Triads" },
	{ pitches: [0, 3, 7], id: "m", symbol: [true,  "", null], name: "Minor" },
	{ pitches: [0, 4, 8], id: "+", symbol: [false, "", "+"],  name: "Augmented" },
	{ pitches: [0, 3, 6], id: "o", symbol: [true,  "", "o"],  name: "Diminished" },
	{ pitches: [0, 2, 6], id: "oo", symbol: [true,  "", "oo"],  name: "Doubly-Diminished" },
	{ pitches: [0, 4, 6], id: "b5", symbol: [false,  "", "(b5)"],  name: "Flat-Fifth" },
	
	{ pitches: [0, 7], id: "5", symbol: [false, "", "5"], name: "Power" },
	
	{ pitches: [0, 4, 7,  9], id: "6",  symbol: [false, "", "6"], name: "Major Sixth", startGroup: "Sixths" },
	{ pitches: [0, 3, 7,  9], id: "m6", symbol: [true,  "", "6"], name: "Minor Sixth" },
	
	{ pitches: [0, 4, 7, 10], id: "7",     symbol: [false, "",  "7"],  name: "Dominant Seventh", startGroup: "Sevenths" },
	{ pitches: [0, 4, 7, 11], id: "maj7",  symbol: [false, "",  "M7"], name: "Major Seventh" },
	{ pitches: [0, 3, 7, 10], id: "m7",    symbol: [true,  "",  "7"],  name: "Minor Seventh" },
	{ pitches: [0, 3, 7, 11], id: "mmaj7", symbol: [true,  "",  "M7"], name: "Minor-Major Seventh" },
	{ pitches: [0, 4, 8, 10], id: "+7",    symbol: [false, "+", "7"],  name: "Augmented Seventh" },
	{ pitches: [0, 4, 8, 11], id: "+maj7", symbol: [false, "+", "M7"], name: "Augmented Major Seventh" },
	{ pitches: [0, 3, 6,  9], id: "o7",    symbol: [true,  "",  "o7"], name: "Diminished Seventh" },
	{ pitches: [0, 3, 6, 10], id: "%7",    symbol: [true,  "",  "ø7"], name: "Half-Diminished Seventh" },
	
	{ pitches: [0, 4, 7, 10, 14], id: "9",     symbol: [false, "",  "9"],   name: "Dominant Ninth", startGroup: "Ninths" },
	{ pitches: [0, 4, 7, 11, 14], id: "maj9",  symbol: [false, "",  "M9"],  name: "Major Ninth" },
	{ pitches: [0, 3, 7, 10, 14], id: "m9",    symbol: [true,  "",  "9"],   name: "Minor Ninth" },
	{ pitches: [0, 3, 7, 11, 14], id: "mmaj9", symbol: [true, "",   "M9"],  name: "Minor-Major Ninth" },
	{ pitches: [0, 3, 7, 10, 13], id: "9?",    symbol: [true, "",   "9?"],  name: "???" },
	{ pitches: [0, 4, 8, 10, 14], id: "+9",    symbol: [false, "+", "9"],   name: "Augmented Ninth" },
	{ pitches: [0, 4, 8, 11, 14], id: "+maj9", symbol: [false, "+", "M9"],  name: "Augmented Major Ninth" },
	{ pitches: [0, 3, 6,  9, 14], id: "o9",    symbol: [true,  "",  "o9"],  name: "Diminished Ninth" },
	{ pitches: [0, 3, 6,  9, 13], id: "ob9",   symbol: [true,  "",  "o♭9"], name: "Diminished Minor Ninth" },
	{ pitches: [0, 3, 6, 10, 14], id: "%9",    symbol: [true,  "",  "ø9"],  name: "Half-Diminished Ninth" },
	{ pitches: [0, 3, 6, 10, 13], id: "%b9",   symbol: [true,  "",  "ø♭9"], name: "Half-Diminished Minor Ninth" },
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


export function getChordKindFromId(id)
{
	return chords.findIndex(chord => chord.id == id)
}


export function getChordKindFromPitches(pitches)
{
	return chords.findIndex(chord =>
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
	
	return degree + 7 * (Math.floor((pitch - mod(key.tonicPitch + key.tonicAccidental, 12)) / 12) - 5)
}


export function getPitchForScaleDegree(key, degree)
{
	const degreeClamped = mod(degree, 7)
	const degreeOctave = Math.floor(degree / 7) + 5
	
	return mod(key.tonicPitch + key.tonicAccidental, 12) + key.scalePitches[Math.floor(degreeClamped)] + degreeOctave * 12
}


export function getNameForPitch(key, pitch, accidental = 0)
{
	const baseLabels = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]
	const baseAccidentals = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]
	const letterStrs = ["C", "D", "E", "F", "G", "A", "B"]
	const letterPitches = [0, 2, 4, 5, 7, 9, 11]
	
	pitch = mod(pitch, 12)
	const degree = mod(getScaleDegreeForPitch(key, pitch), 7)
	
	const keyLetter = baseLabels[key.tonicPitch]
	const noteLetter = mod(keyLetter + Math.floor(degree), 7)
	accidental += mod(pitch - letterPitches[noteLetter] + 6, 12) - 6
	
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


const fillPatterns = new Map()
export function getFillStyleForScaleDegree(ctx, degree)
{
	if (Math.floor(degree) == degree)
		return getColorForScaleDegree(degree)
	
	if (fillPatterns.has(degree))
		return fillPatterns.get(degree)
	
	const colorBefore = getColorForScaleDegree(Math.floor(degree))
	const colorAfter  = getColorForScaleDegree(Math.ceil(degree))
	
	const canvas = document.createElement("canvas")
	canvas.width = "24"
	canvas.height = "24"
	canvas.style.display = "none"
	document.body.appendChild(canvas)
	
	let ctxPatt = canvas.getContext("2d")
	ctxPatt.fillStyle = colorBefore
	ctxPatt.fillRect(0, 0, 24, 24)
	
	ctxPatt.fillStyle = colorAfter
	ctxPatt.beginPath()
	ctxPatt.moveTo(12, 0)
	ctxPatt.lineTo(24, 0)
	ctxPatt.lineTo(0, 24)
	ctxPatt.lineTo(-12, 24)
	
	ctxPatt.moveTo(24 + 12, 0)
	ctxPatt.lineTo(24 + 24, 0)
	ctxPatt.lineTo(24 + 0, 24)
	ctxPatt.lineTo(24 - 12, 24)
	ctxPatt.fill()
	
	const pattern = ctx.createPattern(canvas, "repeat")
	fillPatterns.set(degree, pattern)
	return pattern
}


export function getChordStrummingPattern(meter)
{
	// [[beat kind, duration], ...]
	// Beat kinds:
	//   0: Full chord
	//   1: Full chord minus bass
	//   2: Only bass
	const one   = [[0, new Rational(1)]]
	const two   = [[0, new Rational(1)], [1, new Rational(1, 2)], [2, new Rational(1, 2)]]
	const three = [[0, new Rational(1)], [1, new Rational(1)   ], [1, new Rational(1)   ]]
	
	switch (meter.numerator)
	{
		case 2: return two
		case 3: return three
		case 4: return two.concat(two)
		case 5: return three.concat(two)
		case 6: return three.concat(three)
		case 7: return three.concat(two).concat(two)
		case 8: return two.concat(two).concat(two).concat(two)
		case 9: return three.concat(three).concat(three)
		
		default:
		{
			let pattern = []
			for (let i = 0; i < meter.numerator; i++)
				pattern = pattern.concat(one)
			return pattern
		}
	}
}


export function drawChordOnCanvas(ctx, rect, chord, key, selected, hovering)
{
	const decorationHeight = 8
	
	const scaleDegreeLabel = getScaleDegreeForPitch(key, chord.rootPitch)
	const scaleDegreeColor = getScaleDegreeForPitch(key, chord.rootPitch + chord.rootAccidental)
	const scaleDegreeRotation = getColorRotationForScale(key.scalePitches)
	
	ctx.fillStyle = "#eee"
	ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
	
	ctx.fillStyle = chord.getFillStyle(ctx, key)
	ctx.fillRect(rect.x, rect.y, rect.w, decorationHeight)
	ctx.fillRect(rect.x, rect.y + rect.h - decorationHeight, rect.w, decorationHeight)
	
	const nameBase = chord.getNameBase(key)
	const nameSup = chord.getNameSup(key)
	const nameSub = chord.getNameSub(key)
	const nameRootPitch = getNameForPitch(key, chord.rootPitch, chord.rootAccidental)
	
	ctx.fillStyle = "#000"
	ctx.textAlign = "left"
	ctx.textBaseline = "middle"
	
	ctx.font = "20px Verdana"
	const nameBaseW = ctx.measureText(nameBase).width
	ctx.font = "15px Verdana"
	const nameSupW = ctx.measureText(nameSup).width
	const nameSubW = ctx.measureText(nameSub).width
	const nameTotalW = nameBaseW + nameSupW + nameSubW
	
	const nameScale = Math.min(1, (rect.w - 6) / nameTotalW)
	
	if (nameScale > 0)
	{
		ctx.font = "20px Verdana"
		ctx.fillText(nameBase, rect.x + rect.w / 2 + nameScale * (-nameTotalW / 2), rect.y + rect.h / 2 - 4, nameScale * nameBaseW)
		ctx.font = "15px Verdana"
		ctx.fillText(nameSup, rect.x + rect.w / 2 + nameScale * (-nameTotalW / 2 + nameBaseW), rect.y + rect.h / 2 - 4 - 8, nameScale * nameSupW)
		ctx.fillText(nameSub, rect.x + rect.w / 2 + nameScale * (-nameTotalW / 2 + nameBaseW + nameSupW), rect.y + rect.h / 2 - 4 + 8, nameScale * nameSubW)
		
		ctx.font = "12px Verdana"
		ctx.textAlign = "center"
		ctx.fillText(nameRootPitch, rect.x + rect.w / 2, rect.y + rect.h / 2 + 16, rect.w - 6)
	}
	
	if (selected)
	{
		ctx.globalAlpha = 0.5
		ctx.fillStyle = "#fff"
		ctx.fillRect(rect.x + (rect.cutStart ? 0 : 3), rect.y + 3, rect.w - (rect.cutEnd ? 0 : 3) - (rect.cutStart ? 0 : 3), rect.h - 6)
		
		ctx.globalAlpha = 1
	}
	
	if (hovering)
	{
		ctx.globalAlpha = 0.5
		ctx.fillStyle = "#fee"
		ctx.fillRect(rect.x, rect.y, rect.w, rect.h)
		
		ctx.globalAlpha = 1
	}
}


export class Key
{
	constructor(tonicPitch, tonicAccidental, scalePitches)
	{
		this.tonicPitch = mod(tonicPitch, 12)
		this.tonicAccidental = tonicAccidental
		this.scalePitches = scalePitches
	}
	
	
	withChanges(obj)
	{
		return Object.assign(new Key(this.tonicPitch, this.tonicAccidental, this.scalePitches), obj)
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
		this.rootPitch = mod(rootPitch, 12)
		this.rootAccidental = rootAccidental
		this.kind = kind
		this.modifiers = modifiers
	}
	
	
	withChanges(obj)
	{
		return Object.assign(new Chord(this.rootPitch, this.rootAccidental, this.kind, this.modifiers), obj)
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
	
	
	getFillStyle(ctx, key)
	{
		const degree = getScaleDegreeForPitch(key, this.rootPitch + this.rootAccidental)
		const colorRotation = getColorRotationForScale(key.scalePitches)
		return getFillStyleForScaleDegree(ctx, colorRotation + degree)
	}
	
	
	getPitches()
	{
		const chordData = chords[this.kind]
		
		const rootPitch = mod(this.rootPitch + this.rootAccidental, 12)
		
		let pitches = []
		for (let i = 0; i < chordData.pitches.length; i++)
			pitches.push(rootPitch + chordData.pitches[i])
		
		if (this.modifiers.sus2)
			pitches[1] = rootPitch + 2
		
		if (this.modifiers.sus4)
		{
			if (this.modifiers.sus2)
				pitches.splice(2, 0, rootPitch + 5)
			else
				pitches[1] = rootPitch + 5
		}
		
		return pitches
	}
	
	
	getStrummingPitches()
	{
		const rootPitch = mod(this.rootPitch + this.rootAccidental, 12)
		const pitches = this.getPitches()
		
		let octave = 12 * 4
		if (rootPitch >= 6)
			octave -= 12
		
		if (pitches.length <= 3)
			pitches.push(rootPitch + 12)
		
		pitches = pitches.sort((x, y) => (x > y))

		let sum = pitches.reduce((x, y) => (x + y)) / pitches.length
		while (sum < 60)
		{
			const x = pitches.shift()
			pitches.push(x + 12)
			sum += 12 / pitches.length
		}
		
		if (pitches.length >= 4)
		{
			pitches[0] += 12
			pitches[3] -= 12
		}
		
		pitches.unshift(octave + rootPitch)
		return pitches
	}
	
	
	getKindId()
	{
		return chords[this.kind].id
	}
	
	
	getModifierArray()
	{
		let array = []
		
		for (const key of Object.keys(this.modifiers))
		{
			if (this.modifiers[key])
				array.push(key)
		}
		
		return array
	}
}