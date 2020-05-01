export default class Utils
{
	static mod(x: number, m: number)
	{
		return (x % m + m) % m
	}


	static chromaToLetter     = (chroma: number): number => [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][chroma]
	static chromaToAccidental = (chroma: number): number => [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0][chroma]
	static chromaToDegreeInCMajor = (chroma: number): number => [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6][chroma]

	static letterToChroma = (letter: number): number => [0, 2, 4, 5, 7, 9, 11][letter]
	static letterToStr    = (letter: number): string => ["C", "D", "E", "F", "G", "A", "B"][letter]
	static strToLetter    = (str: string): number    =>
	{
		const map: any = { c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6 }
		return map[str]
	}

	static degreeToRomanStr = (degree: number): string => ["I", "II", "III", "IV", "V", "VI", "VII"][degree]
	static degreeToColor    = (degree: number): string => ["#f00", "#f80", "#fd0", "#0d0", "#00f", "#80f", "#f0f"][degree]


	static accidentalToStr(accidental: number, useUnicode: boolean = false): string
	{
		if (accidental < 0)
			return (useUnicode ? "\u{266d}" : "b").repeat(-accidental)
		else
			return (useUnicode ? "\u{266f}" : "#").repeat(accidental)
	}
}