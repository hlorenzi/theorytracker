import PitchName from "./pitchName.ts"


export interface ScaleMetadata
{
	id: string
	names: string[]
	chromas: number[]
	mode: number
	circleOfFifthsOffset?: number
}


export const knownScales: ScaleMetadata[] = [
	{
		id: "maj",
		names: ["Major", "Ionian"],
		chromas: [0, 2, 4, 5, 7, 9, 11],
		mode: 0,
		circleOfFifthsOffset: 0,
	},
	{
		id: "dor",
		names: ["Dorian"],
		chromas: [0, 2, 3, 5, 7, 9, 10],
		mode: 1,
		circleOfFifthsOffset: 2,
	},
	{
		id: "phr",
		names: ["Phrygian"],
		chromas: [0, 1, 3, 5, 7, 8, 10],
		mode: 2,
		circleOfFifthsOffset: 4,
	},
	{
		id: "lyd",
		names: ["Lydian"],
		chromas: [0, 2, 4, 6, 7, 9, 11],
		mode: 3,
		circleOfFifthsOffset: -1,
	},
	{
		id: "mix",
		names: ["Mixolydian"],
		chromas: [0, 2, 4, 5, 7, 9, 10],
		mode: 4,
		circleOfFifthsOffset: 1,
	},
	{
		id: "min",
		names: ["Natural Minor", "Minor", "Aeolian"],
		chromas: [0, 2, 3, 5, 7, 8, 10],
		mode: 5,
		circleOfFifthsOffset: 3,
	},
	{
		id: "loc",
		names: ["Locrian"],
		chromas: [0, 1, 3, 5, 6, 8, 10],
		mode: 6,
		circleOfFifthsOffset: 5,
	},
	
	{
		id: "phrdom",
		names: ["Phrygian Dominant"],
		chromas: [0, 1, 4, 5, 7, 8, 10],
		mode: 2,
		circleOfFifthsOffset: 4,
	},
	
	{
		id: "dharmaj",
		names: ["Double Harmonic Major"],
		chromas: [0, 1, 4, 5, 7, 8, 11],
		mode: 0,
		circleOfFifthsOffset: 0,
	},
	
	{
		id: "whole",
		names: ["Whole-tone"],
		chromas: [0, 2, 4, 6, 8, 10],
		mode: 0,
		circleOfFifthsOffset: 0,
	},
]


export default class Scale
{
	static list = knownScales

	chromas: number[]
	metadata: ScaleMetadata | undefined

	
	constructor(chromas: number[])
	{
		if (chromas.length <= 1 || chromas.length > 12)
			throw "invalid scale length"
		
		this.chromas = chromas
		
		this.metadata = knownScales.find(s =>
			s.chromas.length === this.chromas.length &&
			s.chromas.every((p, index) => p === this.chromas[index]))
	}
	
	
	static fromChromas(chromas: number[]): Scale
	{
		return new Scale(chromas)
	}
	
	
	static fromId(id: string): Scale
	{
		const meta = knownScales.find(s => s.id === id)
		if (!meta)
			throw "scale id not found"

		return new Scale(meta.chromas)
	}
	
	
	static parse(str: string): Scale
	{
		str = str.toLowerCase().trim()
		
		const knownScale = knownScales.find(s => s.names.some(n => n.toLowerCase() === str))
		if (!knownScale)
			throw "no known scale with given name"
		
		return new Scale(knownScale.chromas)
	}


	get id(): string | undefined
	{
		if (!this.metadata)
			return undefined
		
		return this.metadata.id
	}
	
	
	get name(): string | undefined
	{
		if (!this.metadata)
			return undefined
		
		return this.metadata.names[0]
	}
	
	
	get alterationsFromMajor(): number[]
	{
		if (this.chromas.length !== 7)
			throw "not a seven-note scale"
		
		return this.chromas.map((pitch, i) => pitch - knownScales[0].chromas[i])
	}
	
	
	get str(): string
	{
		return this.name || ("[" + this.chromas.map(chroma => PitchName.fromChroma(chroma).str).join(", ") + "]")
	}
	
	
	toString(): string
	{
		return this.str
	}
}