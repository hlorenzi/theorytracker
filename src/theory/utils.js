export function mod(x, m)
{
	return (x % m + m) % m
}


export const chromaToLetter     = (chroma) => [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][chroma]
export const chromaToAccidental = (chroma) => [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0][chroma]
export const chromaToDegreeInCMajor = (chroma) => [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6][chroma]

export const letterToChroma = (letter) => [0, 2, 4, 5, 7, 9, 11][letter]
export const letterToStr    = (letter) => ["C", "D", "E", "F", "G", "A", "B"][letter]
export const strToLetter    = (str)    => ({ c: 0, d: 1, e: 2, f: 3, g: 4, a: 5, b: 6 }[str])

export const degreeToRomanStr = (degree) => ["I", "II", "III", "IV", "V", "VI", "VII"][degree]
export const degreeToColor    = (degree) => ["#f00", "#f80", "#fd0", "#0d0", "#00f", "#80f", "#f0f"][degree]


export function accidentalToStr(accidental, useUnicode = false)
{
	if (accidental < 0)
		return (useUnicode ? "\u{266d}" : "b").repeat(-accidental)
	else
		return (useUnicode ? "\u{266f}" : "#").repeat(accidental)
}


export default
{
	chromaToLetter,
	chromaToAccidental,
	chromaToDegreeInCMajor,
	letterToChroma,
	letterToStr,
	strToLetter,
	degreeToRomanStr,
	degreeToColor,
	accidentalToStr,
}