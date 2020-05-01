import Key from "./key"
import Utils from "./utils"


interface ChordMetadata
{
	pitches: number[]
	id: string
	symbol: [boolean, string, string | null]
	name: string
	startGroup?: string
}


export const chordKinds: ChordMetadata[] =
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


export default class Chord
{
	static kinds: ChordMetadata[] = chordKinds


	rootMidi: number
	rootAccidental: number
	kind: number
	inversion: number
	modifiers: any

	
	constructor(rootMidi: number, rootAccidental: number, kind: number, inversion: number = 0, modifiers: any[] = [])
	{
        this.rootMidi = rootMidi
        this.rootAccidental = rootAccidental
        this.kind = kind
        this.inversion = inversion
        this.modifiers = modifiers
    }
	
	
	withChanges(obj: any): Chord
	{
		return Object.assign(new Chord(this.rootMidi, this.rootAccidental, this.kind, this.inversion, this.modifiers), obj)
	}


	static kindFromId(id: string): number
	{
		return chordKinds.findIndex(k => k.id === id)
	}


	static kindFromPitches(pitches: number[]): number
	{
		return chordKinds.findIndex(k =>
			k.pitches.length === pitches.length &&
			k.pitches.every((p, i) => pitches[i] === p))
	}


	get kindId(): string
	{
		return chordKinds[this.kind].id
	}
	
	
	romanBase(key: Key): string
	{
		const degree = key.degreeForMidi(this.rootMidi)
		const chordKind = chordKinds[this.kind] || { symbol: [false, "", "?"] }
        
        const roman = Math.floor(degree)
        const accidental = Math.floor(degree) != degree ? 1 : 0

		let baseStr = Utils.accidentalToStr(this.rootAccidental + accidental, true) + Utils.degreeToRomanStr(roman)
		if (chordKind.symbol[0])
			baseStr = baseStr.toLowerCase()
		
		return baseStr + chordKind.symbol[1]
	}
	
	
	romanSup(key: Key): string
	{
		const chordKind = chordKinds[this.kind] || { symbol: [false, "", "?"] }
		
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
	
	
	romanSub(key: Key): string
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
	
	
	get pitches(): number[]
	{
		const chordData = chordKinds[this.kind]
		if (!chordData)
			return []
		
		const rootMidi = Utils.mod(this.rootMidi + this.rootAccidental, 12)
		
		let pitches = []
		for (let i = 0; i < chordData.pitches.length; i++)
			pitches.push(rootMidi + chordData.pitches[i])
		
		if (this.modifiers.sus2)
			pitches[1] = rootMidi + 2
		
		if (this.modifiers.sus4)
		{
			if (this.modifiers.sus2)
				pitches.splice(2, 0, rootMidi + 5)
			else
				pitches[1] = rootMidi + 5
		}
		
		return pitches
	}
	
	
	get strummingPitches(): number[]
	{
		const rootMidi = Utils.mod(this.rootMidi + this.rootAccidental, 12)
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