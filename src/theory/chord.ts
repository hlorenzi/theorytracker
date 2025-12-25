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
	suppress5?: boolean

	nameBase?: string
	nameSup?: string
	nameSub?: string

	romanSup?: string
	romanSub?: string
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
		suppress5: true,
		nameSup: "+",
		romanSup: "+",
	},
	{
		id: "o",
		name: "Diminished",
		add3: -1,
		add5: -1,
		suppress5: true,
		nameSup: "o",
		romanSup: "o",
	},
	{
		id: "oo",
		name: "Doubly-diminished",
		add3: -2,
		add5: -1,
		suppress5: true,
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
		suppress5: true,
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
		suppress5: true,
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
		suppress5: true,
		nameSup: "o7",
		romanSup: "o",
	},
	{
		id: "halfdim7",
		name: "Half-diminished Seventh",
		add3: -1,
		add5: -1,
		add7: -1,
		suppress5: true,
		nameBase: "m7",
		nameSup: "(\u{266d}5)",
		romanSup: "ø",
	},
	{
		id: "dom9",
		name: "Dominant Ninth",
		add3: 0,
		add5: 0,
		add7: -1,
		add9: 0,
		nameBase: "9",
	},
	{
		id: "maj9",
		name: "Major Ninth",
		add3: 0,
		add5: 0,
		add7: 0,
		add9: 0,
		nameBase: "maj9",
	},
	{
		id: "min9",
		name: "Minor Ninth",
		add3: -1,
		add5: 0,
		add7: -1,
		add9: 0,
		nameBase: "m9",
	},
	{
		id: "minmaj9",
		name: "Minor-major Ninth",
		add3: -1,
		add5: 0,
		add7: 0,
		add9: 0,
		nameBase: "mM9",
	},
	{
		id: "dom11",
		name: "Dominant Eleventh",
		add3: 0,
		add5: 0,
		add7: -1,
		add9: 0,
		add11: 0,
		nameBase: "11",
	},
	{
		id: "maj11",
		name: "Major Eleventh",
		add3: 0,
		add5: 0,
		add7: 0,
		add9: 0,
		add11: 0,
		nameBase: "maj11",
	},
	{
		id: "min11",
		name: "Minor Eleventh",
		add3: -1,
		add5: 0,
		add7: -1,
		add9: 0,
		add11: 0,
		nameBase: "m11",
	},
	{
		id: "minmaj11",
		name: "Minor-major Eleventh",
		add3: -1,
		add5: 0,
		add7: 0,
		add9: 0,
		add11: 0,
		nameBase: "mM11",
	},
	{
		id: "dom13",
		name: "Dominant Thirteenth",
		add3: 0,
		add5: 0,
		add7: -1,
		add9: 0,
		add11: 0,
		add13: 0,
		nameBase: "13",
	},
	{
		id: "maj13",
		name: "Major Thirteenth",
		add3: 0,
		add5: 0,
		add7: 0,
		add9: 0,
		add11: 0,
		add13: 0,
		nameBase: "maj13",
	},
	{
		id: "min13",
		name: "Minor Thirteenth",
		add3: -1,
		add5: 0,
		add7: -1,
		add9: 0,
		add11: 0,
		add13: 0,
		nameBase: "m13",
	},
	{
		id: "minmaj13",
		name: "Minor-major Thirteenth",
		add3: -1,
		add5: 0,
		add7: 0,
		add9: 0,
		add11: 0,
		add13: 0,
		nameBase: "mM13",
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
	baseDegree: number
	inversion: number

	sus2?: number
	add3?: number
	no3?: boolean
	sus4?: number
	add5?: number
	no5?: boolean
	add7?: number
	add9?: number
	add11?: number
	add13?: number

	
	constructor(rootChroma: number, inversion: number = 0)
	{
        this.rootChroma = rootChroma
        this.inversion = inversion
    }


	isEqual(other: Chord): boolean
	{
		return this.rootChroma === other.rootChroma &&
			this.baseDegree === other.baseDegree &&
			this.inversion === other.inversion &&
			this.sus2 === other.sus2 &&
			this.add3 === other.add3 &&
			this.no3 === other.no3 &&
			this.sus4 === other.sus4 &&
			this.add5 === other.add5 &&
			this.no5 === other.no5 &&
			this.add7 === other.add7 &&
			this.add9 === other.add9 &&
			this.add11 === other.add11 &&
			this.add13 === other.add13
	}


	clone(): Chord
	{
		const cloned = Object.assign({}, this)
		Object.setPrototypeOf(cloned, Chord.prototype)
		return cloned
	}


	withRoot(newRootChroma: number, newDegree: number)
	{
		const cloned = this.clone()
		cloned.rootChroma = newRootChroma
		cloned.baseDegree = newDegree
		return cloned
	}


	static fromDiatonicTriad(key: Theory.Key, rootDegree: number)
	{
		const rootChroma  = (key.tonic.chroma + key.scale.chromas[(rootDegree + 0) % key.scale.chromas.length]) % 12
		const chord = new Chord(rootChroma)
		chord.baseDegree = rootDegree
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
			(rootChroma + Theory.Scale.majorScale.chromas[degree % 7]))
	}


	withSuspended2(key: Theory.Key)
	{
		const chord = this.clone()
		chord.sus2 = Chord.diatonicDegree(key, 1, this.rootChroma, this.baseDegree)
		return chord
	}


	withNo3()
	{
		const chord = this.clone()
		chord.no3 = true
		return chord
	}


	withSuspended4(key: Theory.Key)
	{
		const chord = this.clone()
		chord.sus4 = Chord.diatonicDegree(key, 3, this.rootChroma, this.baseDegree)
		return chord
	}


	withAdded5(key: Theory.Key, accidental: number = 0)
	{
		const chord = this.clone()
		chord.add5 = Chord.diatonicDegree(key, 4, this.rootChroma, this.baseDegree) + accidental
		return chord
	}


	withNo5()
	{
		const chord = this.clone()
		chord.no5 = true
		return chord
	}


	withAdded7(key: Theory.Key)
	{
		const chord = this.clone()
		chord.add7 = Chord.diatonicDegree(key, 6, this.rootChroma, this.baseDegree)
		return chord
	}


	withAdded9(key: Theory.Key, accidental: number = 0)
	{
		const chord = this.clone()
		chord.add9 = Chord.diatonicDegree(key, 8, this.rootChroma, this.baseDegree) + accidental
		return chord
	}


	withAdded11(key: Theory.Key, accidental: number = 0)
	{
		const chord = this.clone()
		chord.add11 = Chord.diatonicDegree(key, 10, this.rootChroma, this.baseDegree) + accidental
		return chord
	}


	withAdded13(key: Theory.Key, accidental: number = 0)
	{
		const chord = this.clone()
		chord.add13 = Chord.diatonicDegree(key, 12, this.rootChroma, this.baseDegree) + accidental
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

			if (Theory.Utils.mod(a, 12) === Theory.Utils.mod(b, 12))
				return true

			return false
		}

		let chosenKind: ChordMetadata | undefined = undefined
		let highestScore = 0

		for (const meta of chordKinds)
		{
			let score =
				(compare(meta.add3, this.add3) ? 1 : 0) +
				(compare(meta.add5, this.add5) ? 1 : 0) +
				(compare(meta.add7, this.add7) ? 1 : 0) +
				(this.add7 !== undefined &&
					compare(meta.add9, this.add9) ? 1 : 0) +
				(this.add7 !== undefined &&
					this.add9 !== undefined &&
					compare(meta.add11, this.add11) ? 1 : 0) +
				(this.add7 !== undefined &&
					this.add9 !== undefined &&
					this.add11 !== undefined &&
					compare(meta.add13, this.add13) ? 1 : 0)
			
			/*let score = 0
			if (compare(meta.add3, this.add3) &&
				compare(meta.add5, this.add5))
			{
				score += 1
				if (compare(meta.add7, this.add7))
				{
					score += 1
					if (compare(meta.add9, this.add9))
					{
						score += 1
						if (compare(meta.add11, this.add11))
						{
							score += 1
							if (compare(meta.add13, this.add13))
								score += 1
						}
					}
				}
			}*/

			if (score > highestScore)
			{
				highestScore = score
				chosenKind = meta
			}
		}

		return chosenKind
	}


	accidentalStrForRoman(
		key: Theory.Key,
		degree: number,
		accidental: number)
	{
		const chroma = key.chromaForDegree(this.baseDegree + degree)
		const chromaInCMajor = this.rootChroma + Theory.Scale.majorScale.chromas[degree % 7] + accidental
		const finalAccidental = Theory.Utils.modAccidental(chromaInCMajor - chroma)
		return Theory.Utils.accidentalToStr(finalAccidental)
	}


	static accidentalStrForName(accidental: number)
	{
		const finalAccidental = Theory.Utils.modAccidental(accidental)
		return Theory.Utils.accidentalToStr(finalAccidental)
	}
	
	
	str(key: Theory.Key)
	{
		const kind = this.chordKind() ?? {
			id: "custom",
			name: "Custom",
		}

        let roman = this.baseDegree % key.scale.chromas.length
		let romanChroma = key.chromaForDegree(roman)
        let accidental = Theory.Utils.accidentalFor(this.rootChroma, romanChroma)

		if (accidental < -1 || accidental > 1)
		{
			for (let r = 0; r < 7; r++)
			{
				const newRoman = (this.baseDegree + r) % key.scale.chromas.length
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

		if (this.sus2 !== undefined)
		{
			nameSub += `sus${ Chord.accidentalStrForName(this.sus2) }2`
			romanSub += `sus${ this.accidentalStrForRoman(key, 1, this.sus2) }2`
		}
		
		if (this.sus4 !== undefined)
		{
			nameSub += `sus${ Chord.accidentalStrForName(this.sus4) }4`
			romanSub += `sus${ this.accidentalStrForRoman(key, 3, this.sus4) }4`
		}

		let add3Name = this.add3
		let add3Roman = this.add3
		let add5Name = this.add5
		let add5Roman = this.add5
		let add7Name = this.add7
		let add7Roman = this.add7
		let add9Name = this.add9
		let add9Roman = this.add9
		let add11Name = this.add11
		let add11Roman = this.add11
		let add13Name = this.add13
		let add13Roman = this.add13

		if (kind.suppress5)
		{
			add5Name = undefined
			add5Roman = undefined
		}

		if (kind.add5 === 0 &&
			this.add5 === 0)
		{
			add5Name = undefined
			add5Roman = undefined
		}

		if (add7Roman === -1 &&
			add5Roman === -1 &&
			add3Roman === -1)
		{
			romanSup += `ø`
			add5Roman = undefined
			add3Roman = undefined
		}

		if (add5Roman === -1 &&
			add3Roman === -2)
		{
			romanSup += `oo`
			add5Roman = undefined
			add3Roman = undefined
		}

		if (add5Roman === -1 &&
			add3Roman === -1)
		{
			romanSup += `o`
			add5Roman = undefined
			add3Roman = undefined
		}
		
		if (add5Roman === 1 &&
			add3Roman === 0)
		{
			romanSup += `+`
			add5Roman = undefined
		}

		if (add13Roman !== undefined &&
			add11Roman !== undefined &&
			add9Roman !== undefined &&
			add7Roman !== undefined)
		{
			romanSup += `${ this.accidentalStrForRoman(key, 12, add13Roman) }13`
			add13Roman = undefined
			add11Roman = undefined
			add9Roman = undefined
			add7Roman = undefined
		}

		if (add11Roman !== undefined &&
			add9Roman !== undefined &&
			add7Roman !== undefined)
		{
			romanSup += `${ this.accidentalStrForRoman(key, 10, add11Roman) }11`
			add11Roman = undefined
			add9Roman = undefined
			add7Roman = undefined
		}

		if (add9Roman !== undefined &&
			add7Roman !== undefined)
		{
			romanSup += `${ this.accidentalStrForRoman(key, 8, add9Roman) }9`
			add9Roman = undefined
			add7Roman = undefined
		}

		if (add7Roman !== undefined)
		{
			romanSup += `${ this.accidentalStrForRoman(key, 6, add7Roman) }7`
			add7Roman = undefined
		}

		if (this.no3)
			romanSup += `(no3)`

		if (this.no5)
			romanSup += `(no5)`

		if (!this.no5 &&
			add5Roman !== undefined &&
			(kind.add5 === undefined || add5Roman !== kind.add5))
		{
			const accidentalStr = Chord.accidentalStrForName(add5Roman)
			if (accidentalStr !== "")
			{
				romanSup += `(${ accidentalStr }5)`
				add5Roman = undefined
			}
		}


		if (this.no3)
			nameSup += `(no3)`

		if (this.no5)
			nameSup += `(no5)`

		if (!this.no5 &&
			add5Name !== undefined &&
			(kind.add5 === undefined || add5Name !== kind.add5))
		{
			nameSup += `(${ Chord.accidentalStrForName(add5Name) }5)`
			add5Name = undefined
		}

		if (add7Name !== undefined &&
			(kind.add7 === undefined || add7Name !== kind.add7))
			nameSup += `(${ Chord.accidentalStrForName(add7Name) }7)`

		if (add7Roman !== undefined)
			romanSup += `(${ this.accidentalStrForRoman(key, 6, add7Roman) }7)`

		const hasAdd9 =
			this.add7 === undefined

		const hasAdd11 =
			this.add7 === undefined ||
			this.add9 === undefined

		const hasAdd13 =
			this.add7 === undefined ||
			this.add9 === undefined ||
			this.add11 === undefined

		if (add9Name !== undefined &&
			(kind.add9 === undefined || add9Name !== kind.add9))
			nameSup += `(${ hasAdd9 ? "add" : ""}${ Chord.accidentalStrForName(add9Name) }9)`

		if (add9Roman !== undefined)
			romanSup += `(${ hasAdd9 ? "add" : ""}${ this.accidentalStrForRoman(key, 8, add9Roman) }9)`

		if (add11Name !== undefined &&
			(kind.add11 === undefined || add11Name !== kind.add11))
			nameSup += `(${ hasAdd11 ? "add" : ""}${ Chord.accidentalStrForName(add11Name) }11)`

		if (add11Roman !== undefined)
			romanSup += `(${ hasAdd11 ? "add" : ""}${ this.accidentalStrForRoman(key, 10, add11Roman) }11)`

		if (add13Name !== undefined &&
			(kind.add13 === undefined || add13Name !== kind.add13))
			nameSup += `(${ hasAdd13 ? "add" : ""}${ Chord.accidentalStrForName(add13Name) }13)`

		if (add13Roman !== undefined)
			romanSup += `(${ hasAdd13 ? "add" : ""}${ this.accidentalStrForRoman(key, 12, add13Roman) }13)`

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
			!this.no3 &&
			this.sus2 === undefined &&
			this.sus4 === undefined)
			pitches.push(this.add3 + Theory.Scale.majorScale.chromas[2])

		if (this.sus4 !== undefined)
			pitches.push(this.sus4 + Theory.Scale.majorScale.chromas[3])

		if (this.add5 !== undefined &&
			!this.no5)
			pitches.push(this.add5 + Theory.Scale.majorScale.chromas[4])

		if (this.add7 !== undefined)
			pitches.push(this.add7 + Theory.Scale.majorScale.chromas[6])

		if (this.add9 !== undefined)
			pitches.push(12 + this.add9 + Theory.Scale.majorScale.chromas[1])

		if (this.add11 !== undefined)
			pitches.push(12 + this.add11 + Theory.Scale.majorScale.chromas[3])

		if (this.add13 !== undefined)
			pitches.push(12 + this.add13 + Theory.Scale.majorScale.chromas[5])

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