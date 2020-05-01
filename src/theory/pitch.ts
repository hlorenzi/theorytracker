import PitchName from "./pitchName"
import Utils from "./utils"


export default class Pitch
{
	midi: number


	constructor(midi: number)
	{
		this.midi = midi
	}
	

	static fromMidi(midi: number): Pitch
	{
		return new Pitch(midi)
	}
	
	
	static fromOctaveAndChroma(octave: number, chroma: number): Pitch
	{
		return Pitch.fromMidi(12 * octave + chroma)
	}
	
	
	static fromOctaveAndName(octave: number, pitchName: any): Pitch
	{
		return Pitch.fromMidi(12 * octave + pitchName.midi)
	}
	
	
	static parse(str: string): Pitch
	{
		const pitchName = PitchName.parse(str)
		
		str = str.toLowerCase().trim()
		
		// Determine octave
		let octave = 0
		for (let i = 1; i < str.length; i++)
		{
			const c = str.charCodeAt(i)
			
			if (c == "-".charCodeAt(0) || (c >= "0".charCodeAt(0) && c <= "9".charCodeAt(0)))
			{
				octave = parseInt(str.substr(i))
				break
			}
		}
		
		if (octave === undefined || octave === null || isNaN(octave) || !isFinite(octave))
			throw "invalid pitch string"
		
		return Pitch.fromOctaveAndName(octave, pitchName)
	}
	
	
	get frequency(): number
	{
		return Math.pow(2, (this.midi - 69) / 12) * 440
	}
	
	
	get octave(): number
	{
		return Math.floor(this.midi / 12)
	}
	
	
	get chroma(): number
	{
		return Utils.mod(this.midi, 12)
	}
	
	
	get name(): PitchName
	{
		return PitchName.fromMidi(this.midi)
	}
	
	
	get str(): string
	{
		return this.name.str + this.octave.toString()
	}
	
	
	toString(): string
	{
		return this.str
	}
}