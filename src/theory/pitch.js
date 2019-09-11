import { PitchName } from "./pitchName.js"
import * as Utils from "./utils.js"


export class Pitch
{
	constructor(midi)
	{
		this.midi = midi
	}
	

	static fromMidi(midi)
	{
		return new Pitch(midi)
	}
	
	
	static fromOctaveAndChroma(octave, chroma)
	{
		return Pitch.fromMidi(12 * octave + chroma)
	}
	
	
	static fromOctaveAndName(octave, pitchName)
	{
		return Pitch.fromMidi(12 * octave + pitchName.midi)
	}
	
	
	static parse(str)
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
	
	
	get frequency()
	{
		return Math.pow(2, (this.midi - 69) / 12) * 440
	}
	
	
	get octave()
	{
		return Math.floor(this.midi / 12)
	}
	
	
	get chroma()
	{
		return Utils.mod(this.midi, 12)
	}
	
	
	get name()
	{
		return PitchName.fromMidi(this.midi)
	}
	
	
	get str()
	{
		return this.name.str + this.octave.toString()
	}
	
	
	toString()
	{
		return this.str
	}
}