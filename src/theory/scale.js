import { PitchName } from "./pitchName.js"


export const knownScales =
[
	{ chromas: [0, 2, 4, 5, 7, 9, 11], mode: 0, id: "maj", names: ["Major", "Ionian"] },
	{ chromas: [0, 2, 3, 5, 7, 9, 10], mode: 1, id: "dor", names: ["Dorian"] },
	{ chromas: [0, 1, 3, 5, 7, 8, 10], mode: 2, id: "phr", names: ["Phrygian"] },
	{ chromas: [0, 2, 4, 6, 7, 9, 11], mode: 3, id: "lyd", names: ["Lydian"] },
	{ chromas: [0, 2, 4, 5, 7, 9, 10], mode: 4, id: "mix", names: ["Mixolydian"] },
	{ chromas: [0, 2, 3, 5, 7, 8, 10], mode: 5, id: "min", names: ["Natural Minor", "Minor", "Aeolian"] },
	{ chromas: [0, 1, 3, 5, 6, 8, 10], mode: 6, id: "loc", names: ["Locrian"] },
	
	{ chromas: [0, 1, 4, 5, 7, 8, 11], mode: 0, id: "dharmaj", names: ["Double Harmonic Major"] },
]


export class Scale
{
	static list = knownScales

	
	constructor(chromas)
	{
		if (chromas.length <= 1 || chromas.length > 12)
			throw "invalid scale length"
		
		this.chromas = chromas
		
		this.metadata = knownScales.find(s =>
			s.chromas.length == this.chromas.length &&
			s.chromas.every((p, index) => p == this.chromas[index]))
	}
	
	
	static fromChromas(chromas)
	{
		return new Scale(chromas)
	}
	
	
	static fromId(id)
	{
		return new Scale(knownScales.find(s => s.id === id).chromas)
	}
	
	
	static parse(str)
	{
		str = str.toLowerCase().trim()
		
		const knownScale = knownScales.find(s => s.names.some(n => n.toLowerCase() == str))
		if (!knownScale)
			throw "no known scale with given name"
		
		return new Scale(knownScale.chromas)
	}


	get id()
	{
		if (!this.metadata)
			return null
		
		return this.metadata.id
	}
	
	
	get name()
	{
		if (!this.metadata)
			return null
		
		return this.metadata.names[0]
	}
	
	
	get alterationsFromMajor()
	{
		if (this.chromas.length != 7)
			throw "not a seven-note scale"
		
		return this.chromas.map((pitch, i) => pitch - knownScales[0].chromas[i])
	}
	
	
	get str()
	{
		return this.name || ("[" + this.chromas.map(chroma => PitchName.fromChroma(chroma).name).join(", ") + "]")
	}
	
	
	toString()
	{
		return this.str
	}
}