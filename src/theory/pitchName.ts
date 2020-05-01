import Utils from "./utils"


export default class PitchName
{
	letter: number
	accidental: number


	constructor(letter: number, accidental: number)
	{
		this.letter = Utils.mod(letter, 7)
		this.accidental = accidental
	}
	

	static fromMidi(midi: number): PitchName
	{
		const chroma = Utils.mod(midi, 12)
		
		const letter     = Utils.chromaToLetter(chroma)
		const accidental = Utils.chromaToAccidental(chroma)
		
		return new PitchName(letter, accidental)
	}
	

	static fromChroma(chroma: number): PitchName
	{
		return PitchName.fromMidi(chroma)
	}
	
	
	static parse(str: string): PitchName
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
	
	
	get midi(): number
	{
		return Utils.letterToChroma(this.letter) + this.accidental
	}
	
	
	get chroma(): number
	{
		return Utils.mod(this.midi, 12)
	}
	
	
	altered(additionalAccidental: number): PitchName
	{
		return new PitchName(this.letter, this.accidental + additionalAccidental)
	}


	get simplified(): PitchName
	{
		if (this.accidental === 0)
			return this
		else
			return PitchName.fromMidi(this.midi)
	}
	
	
	get str(): string
	{
		const letterStr     = Utils.letterToStr(this.letter)
		const accidentalStr = Utils.accidentalToStr(this.accidental)
			
		return letterStr + accidentalStr
	}
	
	
	get strUnicode(): string
	{
		const letterStr     = Utils.letterToStr(this.letter)
		const accidentalStr = Utils.accidentalToStr(this.accidental, true)
			
		return letterStr + accidentalStr
	}
	
	
	toString(): string
	{
		return this.str
	}
}