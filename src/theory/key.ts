import PitchName from "./pitchName"
import Pitch from "./pitch"
import Scale from "./scale"
import Utils from "./utils"


export default class Key
{
	tonic: PitchName
	scale: Scale
	_chromaToDegree: number[]


	constructor(tonic: PitchName, scale: Scale)
	{
		this.tonic = tonic
		this.scale = scale
		
		this._chromaToDegree = []
		for (let degree = 0; degree < this.scale.chromas.length; degree++)
		{
			let chroma = Utils.mod(this.tonic.midi + this.scale.chromas[degree], 12)
			this._chromaToDegree[chroma] = degree
			
			const nextDegree = (degree + 1) % this.scale.chromas.length
			
			let nextChroma = chroma + 1
			while (true)
			{
				let testNextChroma = Utils.mod(this.tonic.midi + this.scale.chromas[nextDegree], 12)
				while (testNextChroma < chroma)
					testNextChroma += 12
				
				if (nextChroma >= testNextChroma)
					break
				
				this._chromaToDegree[nextChroma % 12] = (degree + 0.5) % this.scale.chromas.length
				nextChroma += 1
			}
		}
	}
	
	
	static fromTonicAndScale(tonic: PitchName, scale: Scale): Key
	{
		return new Key(tonic, scale)
	}
	
	
	static parse(str: string): Key
	{
		str = str.toLowerCase().trim()
		
		const separator = str.indexOf(" ")
		if (separator < 1)
			throw "invalid key string"
		
		const tonicStr = str.substr(0, separator)
		const scaleStr = str.substr(separator)
		
		const tonic = PitchName.parse(tonicStr)
		const scale = Scale.parse(scaleStr)
		
		return new Key(tonic, scale)
	}
	
	
	get str(): string
	{
		const scaleStr = this.scale.name || "Unknown Scale"
		const tonicStr = this.tonic.str
		
		return tonicStr + " " + scaleStr
	}
	
	
	toString(): string
	{
		return this.str
	}
	
	
	degreeForChroma(chroma: number): number
	{
		return this._chromaToDegree[chroma]
	}
	
	
	degreeForMidi(midi: number): number
	{
		return this.degreeForChroma(Utils.mod(midi, 12))
	}
	
	
	degreeForPitch(pitch: Pitch | PitchName): number
	{
		return this.degreeForMidi(pitch.midi)
	}
	
	
	octavedDegreeForMidi(midi: number): number
	{
		const degree = this.degreeForMidi(midi)
		const degreeOctave = Math.floor((midi - this.tonic.midi) / 12)
		
		return degree + this.scale.chromas.length * degreeOctave
	}
	
	
	octavedDegreeForPitch(pitch: Pitch | PitchName): number
	{
		return this.octavedDegreeForMidi(pitch.midi)
	}
	
	
	midiForDegree(octavedDegree: number): number
	{
		const degree = Utils.mod(octavedDegree, this.scale.chromas.length)
		const degreeOctave = Math.floor(octavedDegree / this.scale.chromas.length)
		
		return this.tonic.midi + this.scale.chromas[degree] + degreeOctave * 12
	}
	
	
	pitchForDegree(octavedDegree: number): Pitch
	{
		return Pitch.fromMidi(this.midiForDegree(octavedDegree))
	}
	
	
	chromaForDegree(octavedDegree: number): number
	{
		return Utils.mod(this.midiForDegree(octavedDegree), 12)
	}
	
	
	nameForMidi(midi: number): PitchName
	{
		const degree = this.degreeForMidi(midi)
		
		const letter1     = Utils.mod(this.tonic.letter + Math.floor(degree), 7)
		const accidental1 = Utils.mod(midi - Utils.letterToChroma(letter1) + 6, 12) - 6

		if (degree == Math.floor(degree))
			return new PitchName(letter1, accidental1)

		const letter2     = Utils.mod(letter1 + 1, 7)
		const accidental2 = Utils.mod(midi - Utils.letterToChroma(letter2) + 6, 12) - 6

		const letter3     = Utils.mod(letter1 - 1, 7)
		const accidental3 = Utils.mod(midi - Utils.letterToChroma(letter3) + 6, 12) - 6

		const attempts = [
			[letter1, accidental1],
			[letter2, accidental2],
			[letter3, accidental3],
		]

		attempts.sort((a, b) => Math.abs(a[1]) - Math.abs(b[1]))

		return new PitchName(attempts[0][0], attempts[0][1])
	}
	
	
	nameForPitch(pitch: Pitch | PitchName): PitchName
	{
		return this.nameForMidi(pitch.midi)
	}
	
	
	nameForChroma(chroma: number): PitchName
	{
		return this.nameForMidi(chroma)
	}
	
	
	nameForDegree(degree: number): PitchName
	{
		return this.nameForMidi(this.midiForDegree(degree))
	}
	
	
	get midi(): number[]
	{
		return this.scale.chromas.map(chroma => chroma + this.tonic.midi)
	}
	
	
	get chroma(): number[]
	{
		return this.scale.chromas.map(chroma => Utils.mod(chroma + this.tonic.midi, 12))
	}
	
	
	get namedPitches(): PitchName[]
	{
		return this.scale.chromas.map(chroma => this.nameForMidi(chroma + this.tonic.midi))
	}
}