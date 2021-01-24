export function mod(x: number, m: number): number
{
    return (x % m + m) % m
}


export function quantize(x: number, step: number): number
{
    return Math.floor(x * step) / step
}


export function midiToHertz(midi: number): number
{
    return Math.pow(2, (midi - 69) / 12) * 440
}


export function dbToLinearGain(db: number): number
{
    return Math.pow(10, db / 20)
}


export function linearGainToDb(linearGain: number): number
{
    return 20 * Math.log10(linearGain)
}


export function midiVolumeToDb(midiVol: number): number
{
    if (midiVol <= 0)
        return 0
    
    const minDbLevel = -15
    return minDbLevel * (1 - midiVol)
}


export function midiVolumeToLinearGain(midiVol: number): number
{
    if (midiVol <= 0)
        return 0
    
    return dbToLinearGain(midiVolumeToDb(midiVol))
}