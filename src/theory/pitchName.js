import * as Utils from "./utils.js"


export class PitchName
{
	constructor(letter, accidental)
	{
		this.letter = Utils.mod(letter, 7)
		this.accidental = accidental
	}
	

	static fromMidi(midi)
	{
		const chroma = Utils.mod(midi, 12)
		
		const letter     = Utils.chromaToLetter(chroma)
		const accidental = Utils.chromaToAccidental(chroma)
		
		return new PitchName(letter, accidental)
	}
	

	static fromChroma(chroma)
	{
		return PitchName.fromMidi(chroma)
	}
	
	
	static parse(str)
	{
		if (str.length < 1)
			throw "invalid pitch string"
		
		str = str.toLowerCase().trim()
		
		// Determine letter
		const letterStr = str[0]
		const letter = Utils.strToLetter(letterStr)
		
		if (letter === undefined)
			throw "invalid pitch string"
		
		// Determine accidental
		let accidental = 0
		for (let i = 1; i < str.length; i++)
		{
			const c = str.charCodeAt(i)
			
			if (c == "b".charCodeAt(0) || c == "♭".charCodeAt(0))
				accidental -= 1
				
			else if (c == "#".charCodeAt(0) || c == "♯".charCodeAt(0))
				accidental += 1
		}
		
		return new PitchName(letter, accidental)
	}
	
	
	get midi()
	{
		return Utils.letterToChroma(this.letter) + this.accidental
	}
	
	
	get chroma()
	{
		return Utils.mod(this.midi, 12)
	}
	
	
	altered(additionalAccidental)
	{
		return new PitchName(this.letter, this.accidental + additionalAccidental)
	}


	get simplified()
	{
		if (this.accidental === 0)
			return this
		else
			return PitchName.fromMidi(this.midi)
	}
	
	
	get str()
	{
		const letterStr     = Utils.letterToStr(this.letter)
		const accidentalStr = Utils.accidentalToStr(this.accidental)
			
		return letterStr + accidentalStr
	}
	
	
	get strUnicode()
	{
		const letterStr     = Utils.letterToStr(this.letter)
		const accidentalStr = Utils.accidentalToStr(this.accidental, true)
			
		return letterStr + accidentalStr
	}
	
	
	toString()
	{
		return this.str
	}
}