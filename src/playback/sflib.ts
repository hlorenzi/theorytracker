export const sflibUrl = "/library/"


export interface SflibMeta
{
    ready: boolean
    collections: SflibCollectionMeta[]
}


export interface SflibCollectionMeta
{
    id: string
    name: string
    instruments: SflibInstrumentMeta[]
}


export interface SflibInstrumentMeta
{
    id: string
    filename: string
    filesize: number
    name: string
    midiBank: number
    midiPreset: number
}


export interface SflibInstrument
{
    id: string
    name: string
    midiPreset: number
    midiBank: number
    zones: SflibInstrumentZone[]
    samples: string[]
}


export interface SflibInstrumentZone
{
    sampleIndex: number
    sampleRate: number

    loopStartIndex: number
    loopEndIndex: number
    loopMode: string

    midiPitchMin: number
    midiPitchMax: number
    midiPitchBase: number
    midiVelMin: number
    midiVelMax: number

    volEnvDelaySec: number
    volEnvAttackSec: number
    volEnvHoldSec: number
    volEnvDecaySec: number
    volEnvSustain: number
    volEnvReleaseSec: number

    exclusiveClass: number | null
}


async function loadSflibMeta(): Promise<SflibMeta>
{
    const data = await fetch(sflibUrl + "library.json")
    const meta: SflibMeta = await data.json()
    meta.ready = true
    console.log("loaded sflib meta", meta)
    return meta
}


let sflibMeta: SflibMeta | null = null
loadSflibMeta()
    .then(meta => sflibMeta = meta)


export function getSflibMeta()
{
    return sflibMeta
}


// FIXME: Apparently, some kind of `WeakValueMap` is what I actually wanted here.
const sflibCache = new WeakMap<SflibInstrumentMeta, SflibInstrument>()


export async function sflibGetInstrument(collectionId: string, instrumentId: string): Promise<SflibInstrument | null>
{
    if (!sflibMeta)
        return null

    const collMeta = sflibMeta.collections.find(c => c.id == collectionId)
    if (!collMeta)
        return null
    
    const instrMeta = collMeta.instruments.find(i => i.id == instrumentId)
    if (!instrMeta)
        return null

    const cached = sflibCache.get(instrMeta)
    if (cached)
        return cached
    
    const instrFilename = instrMeta.filename

    const data = await fetch(sflibUrl + collectionId + "/" + instrFilename)
    const dataCompressed = await data.json()
    console.log(dataCompressed)
    const instr: SflibInstrument = dataCompressed//JSON.parse(new TextDecoder().decode(dataCompressed))

    console.log("loaded sflib instrument", instr)

    sflibCache.set(instrMeta, instr)
    return instr
}