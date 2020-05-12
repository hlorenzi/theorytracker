export default class MathUtils
{
    static mod(x: number, m: number): number
    {
        return (x % m + m) % m
    }


    static midiToHertz(midi: number): number
    {
        return Math.pow(2, (midi - 69) / 12) * 440
    }
}