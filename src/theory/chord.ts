import * as Theory from "./index.ts"


interface ChordMetadata
{
	id: string
	name: string

	add3?: number
	add5?: number
	add7?: number
	add9?: number
	add11?: number
	add13?: number

	suspended?: boolean

	nameBase?: string
	nameSup?: string
	nameSub?: string

	romanSup?: string
	romanSub?: string
	roman7?: number
}


export const chordKinds: ChordMetadata[] =
[
	{
		id: "M",
		name: "Major",
		add3: 0,
		add5: 0,
	},
	{
		id: "m",
		name: "Minor",
		add3: -1,
		add5: 0,
		nameBase: "m",
	},
	{
		id: "+",
		name: "Augmented",
		add3: 0,
		add5: 1,
		nameSup: "+",
		romanSup: "+",
	},
	{
		id: "o",
		name: "Diminished",
		add3: -1,
		add5: -1,
		nameSup: "o",
		romanSup: "o",
	},
	{
		id: "oo",
		name: "Doubly-diminished",
		add3: -2,
		add5: -1,
		nameSup: "oo",
		romanSup: "oo",
	},
	{
		id: "dom7",
		name: "Dominant Seventh",
		add3: 0,
		add5: 0,
		add7: -1,
		nameBase: "7",
		roman7: -1,
	},
	{
		id: "maj7",
		name: "Major Seventh",
		add3: 0,
		add5: 0,
		add7: 0,
		nameBase: "maj7",
	},
	{
		id: "min7",
		name: "Minor Seventh",
		add3: -1,
		add5: 0,
		add7: -1,
		nameBase: "m7",
		roman7: -1,
	},
	{
		id: "minmaj7",
		name: "Minor-major Seventh",
		add3: -1,
		add5: 0,
		add7: 0,
		nameBase: "mM7",
	},
	{
		id: "aug7",
		name: "Augmented Seventh",
		add3: 0,
		add5: 1,
		add7: -1,
		nameBase: "7",
		nameSup: "(\u{266f}5)",
		romanSup: "+",
	},
	{
		id: "augmaj7",
		name: "Augmented Major Seventh",
		add3: 0,
		add5: 1,
		add7: 0,
		nameBase: "maj7",
		nameSup: "(\u{266f}5)",
		romanSup: "+",
	},
	{
		id: "dim7",
		name: "Diminished Seventh",
		add3: -1,
		add5: -1,
		add7: -2,
		nameSup: "o7",
		romanSup: "o",
		roman7: -2,
	},
	{
		id: "halfdim7",
		name: "Half-diminished Seventh",
		add3: -1,
		add5: -1,
		add7: -1,
		nameBase: "m7",
		nameSup: "(\u{266d}5)",
		romanSup: "ø",
		roman7: -1,
	},
]

/*	{ pitches: [0, 4, 7], id: "M", symbol: [false, "", null], name: "Major", startGroup: "Triads" },
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
]*/


export interface ChordSuggestion
{
	chord: Chord
	matches: number
	misses: number
}


export default class Chord
{
	static kinds: ChordMetadata[] = chordKinds


	rootChroma: number
	degree: number
	inversion: number

	sus2?: number
	add3?: number
	sus4?: number
	add5?: number
	add7?: number
	add9?: number
	add11?: number
	add13?: number

	
	constructor(rootChroma: number, inversion: number = 0)
	{
        this.rootChroma = rootChroma
        this.inversion = inversion
    }


	clone()
	{
		const cloned = Object.assign({}, this)
		Object.setPrototypeOf(cloned, Chord.prototype)
		return cloned
	}


	withRoot(newRootChroma: number, newDegree: number)
	{
		const cloned = this.clone()
		cloned.rootChroma = newRootChroma
		cloned.degree = newDegree
		return cloned
	}
	
	
	/*withChanges(obj: any): Chord
	{
		return Object.assign(new Chord(this.rootChroma, this.kind, this.inversion, this.modifiers), obj)
	}*/


	static fromDiatonicTriad(key: Theory.Key, rootDegree: number)
	{
		const rootChroma  = (key.tonic.chroma + key.scale.chromas[(rootDegree + 0) % key.scale.chromas.length]) % 12
		const chord = new Chord(rootChroma)
		chord.degree = rootDegree
		chord.add3 = Chord.diatonicDegree(key, 2, rootChroma, rootDegree)
		chord.add5 = Chord.diatonicDegree(key, 4, rootChroma, rootDegree)
		return chord
	}


	static diatonicDegree(
		key: Theory.Key,
		degree: number,
		rootChroma: number,
		rootDegree: number)
	{
		const chroma = Theory.Utils.mod(
			key.tonic.chroma +
				key.scale.chromas[(rootDegree + degree) % key.scale.chromas.length],
			12)

		return Theory.Utils.modAccidental(
			chroma -
			(rootChroma + Theory.Scale.majorScale.chromas[degree]))
	}


	withSuspended2(key: Theory.Key)
	{
		const chord = this.clone()
		chord.sus2 = Chord.diatonicDegree(key, 1, this.rootChroma, this.degree)
		return chord
	}


	withRemoved3()
	{
		const chord = this.clone()
		chord.add3 = undefined
		return chord
	}


	withSuspended4(key: Theory.Key)
	{
		const chord = this.clone()
		chord.sus4 = Chord.diatonicDegree(key, 3, this.rootChroma, this.degree)
		return chord
	}


	withAdded7(key: Theory.Key)
	{
		const chord = this.clone()
		chord.add7 = Chord.diatonicDegree(key, 6, this.rootChroma, this.degree)
		return chord
	}


	static kindFromId(id: string): number
	{
		return chordKinds.findIndex(k => k.id === id)
	}


	/*static kindFromPitches(pitches: number[]): number
	{
		return chordKinds.findIndex(k =>
			k.pitches.length === pitches.length &&
			k.pitches.every((p, i) => pitches[i] === p))
	}


	static suggestChordsForPitches(pitches: number[]): ChordSuggestion[]
	{
		const suggestions: ChordSuggestion[] = []

		for (let k = 0; k < chordKinds.length; k++)
		{
			const kind = chordKinds[k]

			for (let root = 0; root < pitches.length; root++)
			{
				const rootPitch = pitches[root]
				const matches = new Set<number>()
				let misses = 0

				for (let i = 0; i < pitches.length; i++)
				{
					const pitch = pitches[(root + i) % pitches.length]
					const relPitch = MathUtils.mod(pitch - rootPitch, 12)

					const kindMatch = kind.pitches.findIndex(p => p === relPitch)
					if (kindMatch >= 0)
						matches.add(kindMatch)
					else
						misses++
				}

				suggestions.push({
					chord: new Chord(MathUtils.mod(rootPitch, 12), k, 0, []),
					matches: matches.size,
					misses,
				})
			}
		}

		suggestions.sort((a, b) =>
		{
			if (a.misses != b.misses)
				return a.misses - b.misses

			return b.matches - a.matches
		})

		//console.log("suggestions", pitches, suggestions)
		return suggestions.slice(0, 10)
	}*/


	chordKind(): ChordMetadata | undefined
	{
		const compare = (a: number | undefined, b: number | undefined) => {
			if (a === b)
				return true

			if (a === undefined ||
				b === undefined)
				return false

			return Theory.Utils.mod(a, 12) === Theory.Utils.mod(b, 12)
		}

		for (const meta of chordKinds)
		{
			if (compare(meta.add3, this.add3) &&
				compare(meta.add5, this.add5) &&
				compare(meta.add7, this.add7))
			{
				return meta
			}
		}

		return undefined
	}


	accidentalStrForRoman(key: Theory.Key, degree: number, accidental: number)
	{
		const chroma = key.chromaForDegree(this.degree + degree)
		const chromaInCMajor = this.rootChroma + Theory.Scale.majorScale.chromas[degree]
		return Theory.Utils.accidentalToStr(
			Theory.Utils.modAccidental(
				chroma - chromaInCMajor - accidental))
	}


	static accidentalStrForName(accidental: number)
	{
		return Theory.Utils.accidentalToStr(Theory.Utils.modAccidental(accidental))
	}
	
	
	str(key: Theory.Key)
	{
		const kind = this.chordKind() ?? {
			id: "custom",
			name: "Custom",
		}

        let roman = this.degree % key.scale.chromas.length
		let romanChroma = key.chromaForDegree(roman)
        let accidental = Theory.Utils.accidentalFor(this.rootChroma, romanChroma)

		if (accidental < -1 || accidental > 1)
		{
			for (let r = 0; r < 7; r++)
			{
				const newRoman = (this.degree + r) % key.scale.chromas.length
				const newRomanChroma = key.chromaForDegree(newRoman)
        		const newAccidental = Theory.Utils.accidentalFor(this.rootChroma, newRomanChroma)
				if (Math.abs(newAccidental) < Math.abs(accidental))
				{
					roman = newRoman
					romanChroma = newRomanChroma
					accidental = newAccidental
				}
			}
		}

		let accidentalStr = Theory.Utils.accidentalToStr(accidental, true)

		const isLowercase =
			kind !== undefined &&
			this.add3 !== undefined &&
			this.add3 < 0
		
		let nameBase =
			Theory.Utils.lowercaseIf(
				key.nameForChroma(this.rootChroma).strUnicode,
				isLowercase) +
			(kind.nameBase ?? "")

		let nameSup = kind.nameSup ?? ""
		let nameSub = kind.nameSub ?? ""

		let romanBase =
			accidentalStr +
			Theory.Utils.lowercaseIf(
				Theory.Utils.degreeToRomanStr(roman),
				isLowercase)

		let romanSup = kind.romanSup ?? ""
		let romanSub = kind.romanSub ?? ""

		const isSuspended =
			this.sus2 !== undefined ||
			this.sus4 !== undefined

		if (this.sus2 !== undefined &&
			this.sus4 !== undefined)
		{
			nameSub += `sus${ Chord.accidentalStrForName(this.sus2) }2${ Chord.accidentalStrForName(this.sus4) }4`
			romanSub += `sus${ this.accidentalStrForRoman(key, 1, this.sus2) }2${ this.accidentalStrForRoman(key, 3, this.sus4) }4`
		}
		else if (this.sus2 !== undefined)
		{
			nameSub += `sus${ Chord.accidentalStrForName(this.sus2) }2`
			romanSub += `sus${ this.accidentalStrForRoman(key, 1, this.sus2) }2`
		}
		else if (this.sus4 !== undefined)
		{
			nameSub += `sus${ Chord.accidentalStrForName(this.sus4) }4`
			romanSub += `sus${ this.accidentalStrForRoman(key, 3, this.sus4) }4`
		}

		if (kind.add3 === undefined)
		{
			if (this.add3 === undefined &&
				!isSuspended)
			{
				const no3Str = `(no3)`
				nameSup += no3Str
				romanSup += no3Str
			}
			else if (this.add3 !== undefined &&
				this.add3 !== 0)
			{
				nameSup += `(${ Chord.accidentalStrForName(this.add3) }3)`
				romanSup += `(${ Chord.accidentalStrForName(this.add3) }3)`
			}
		}

		if (kind.add5 === undefined)
		{
			if (this.add5 === undefined)
			{
				const no5Str = `(no5)`
				nameSup += no5Str
				romanSup += no5Str
			}
			else if (this.add5 !== 0)
			{
				nameSup += `(${ Chord.accidentalStrForName(this.add5) }5)`
				romanSup += `(${ Chord.accidentalStrForName(this.add5) }5)`
			}
		}

		if (this.add7 !== undefined)
		{
			if (kind.add7 === undefined)
			{
				nameSup += `(${ Chord.accidentalStrForName(this.add7) }7)`
				romanSup += `(${ this.accidentalStrForRoman(key, 6, this.add7) }7)`
			}
			else
			{
				romanSup += `${ this.accidentalStrForRoman(key, 6, this.add7) }7`
			}
		}

		return {
			nameBase,
			nameSup,
			nameSub,
			romanBase,
			romanSup,
			romanSub,
		}
	}
	
	
	get pitchesRelativeToRoot(): number[]
	{
		const pitches = [0]

		if (this.sus2 !== undefined)
			pitches.push(this.sus2 + Theory.Scale.majorScale.chromas[1])

		if (this.add3 !== undefined &&
			this.sus2 === undefined &&
			this.sus4 === undefined)
			pitches.push(this.add3 + Theory.Scale.majorScale.chromas[2])

		if (this.sus4 !== undefined)
			pitches.push(this.sus4 + Theory.Scale.majorScale.chromas[3])

		if (this.add5 !== undefined)
			pitches.push(this.add5 + Theory.Scale.majorScale.chromas[4])

		if (this.add7 !== undefined)
			pitches.push(this.add7 + Theory.Scale.majorScale.chromas[6])

		return pitches
	}
	
	
	get pitches(): number[]
	{
		const rootMidi = Theory.Utils.mod(this.rootChroma, 12)
		return this.pitchesRelativeToRoot.map(p => p + rootMidi)
	}
	
	
	get strummingPitches(): number[]
	{
		const rootMidi = Theory.Utils.mod(this.rootChroma, 12)
		let pitches = this.pitches
		if (pitches.length == 0)
			return []
		
		let octave = 12 * 4
		if (rootMidi >= 6)
			octave -= 12
		
		pitches = pitches.map(p => p + octave)
		
		if (pitches.length <= 3)
			pitches.push(pitches[0] + 12)
		
		pitches = pitches.sort((x, y) => (x - y))

		let sum = pitches.reduce((x, y) => (x + y)) / pitches.length
		while (sum < 60)
		{
			const x = pitches.shift()!
			pitches.push(x + 12)
			sum += 12 / pitches.length
		}
		
		if (pitches.length >= 4)
		{
			pitches[0] += 12
			pitches[3] -= 12
		}
		
		pitches.unshift(octave + rootMidi)
		return pitches
	}
}