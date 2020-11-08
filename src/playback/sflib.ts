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
    startLoop: number
    endLoop: number
    loopMode: string

    minPitch: number
    maxPitch: number
    basePitch: number
    minVel: number
    maxVel: number

    delayVolEnv?: number
    attackVolEnv?: number
    holdVolEnv?: number
    decayVolEnv?: number
    sustainVolEnv?: number
    releaseVolEnv?: number
    exclusiveClass?: number
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


const sflibCache = new Map<string, SflibInstrument>()


export async function sflibGetInstrument(collectionId: string, instrumentId: string): Promise<SflibInstrument | null>
{
    const id = collectionId + "/" + instrumentId
    const cached = sflibCache.get(id)
    if (cached)
        return cached

    if (!sflibMeta)
        return null

    const collMeta = sflibMeta.collections.find(c => c.id == collectionId)
    if (!collMeta)
        return null
    
    const instrMeta = collMeta.instruments.find(i => i.id == instrumentId)
    if (!instrMeta)
        return null

    const instrFilename = instrMeta.filename

    const data = await fetch(sflibUrl + collectionId + "/" + instrFilename)
    const dataCompressed = await data.json()
    console.log(dataCompressed)
    const instr: SflibInstrument = dataCompressed//JSON.parse(new TextDecoder().decode(dataCompressed))

    console.log("loaded sflib instrument", instr)

    sflibCache.set(id, instr)
    return instr
}