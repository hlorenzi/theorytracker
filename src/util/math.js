export function mod(x, m)
{
	return (x % m + m) % m
}


export function midiToHertz(midi)
{
	return Math.pow(2, (midi - 69) / 12) * 440
}


export default
{
	mod,
	midiToHertz,
}