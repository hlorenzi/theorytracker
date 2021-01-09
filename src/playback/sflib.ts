import * as AsyncUtils from "../util/async"


export const sflibUrl = "/library/"


export interface SflibMeta
{
    ready: boolean
    collections: SflibCollectionMeta[]
    collectionsById: Map<string, SflibCollectionMeta>
}


export interface SflibCollectionMeta
{
    id: string
    name: string
    instruments: SflibInstrumentMeta[]
    instrumentsById: Map<string, SflibInstrumentMeta>
    instrumentsByPreset: Map<number, SflibInstrumentMeta>
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
    audioBuffers: AudioBuffer[]
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

    meta.collectionsById = new Map<string, SflibCollectionMeta>()

    for (const coll of meta.collections)
    {
        meta.collectionsById.set(coll.id, coll)

        coll.instrumentsById = new Map<string, SflibInstrumentMeta>()
        coll.instrumentsByPreset = new Map<number, SflibInstrumentMeta>()
        for (const instr of coll.instruments)
        {
            const preset = instr.midiBank * 128 + instr.midiPreset
            coll.instrumentsById.set(instr.id, instr)
            coll.instrumentsByPreset.set(preset, instr)
        }

        coll.instruments.sort((a, b) =>
        {
            const aDrumkit = a.midiBank == 128
            const bDrumkit = b.midiBank == 128

            if (aDrumkit && bDrumkit)
                return a.midiPreset - b.midiPreset

            if (aDrumkit != bDrumkit)
                return (aDrumkit ? 1 : 0) - (bDrumkit ? 1 : 0)

            // group similar presets, not banks
            return (a.midiBank + a.midiPreset * 128) - (b.midiBank + b.midiPreset * 128)
        })
    }

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


const sflibGetInstrumentLock = new AsyncUtils.Mutex()


export async function sflibGetInstrument(
    collectionId: string,
    instrumentId: string,
    audioCtx: AudioContext)
    : Promise<SflibInstrument | null>
{
    if (!sflibMeta)
        return null

    const collMeta = sflibMeta.collectionsById.get(collectionId)
    if (!collMeta)
        return null
    
    const instrMeta = collMeta.instrumentsById.get(instrumentId)
    if (!instrMeta)
        return null

    await sflibGetInstrumentLock.acquire()
    
    const cached = sflibCache.get(instrMeta)
    if (cached)
    {
        await sflibGetInstrumentLock.release()
        return cached
    }

    const instrFilename = instrMeta.filename

    const data = await fetch(sflibUrl + collectionId + "/" + instrFilename)
    const instr: SflibInstrument = await data.json()

    let yieldCount = 0

    instr.audioBuffers = []
    const sampleRate = instr.zones[0].sampleRate
    for (const sampleRaw of instr.samples)
    {
        const bytes = Uint8Array.from(atob(sampleRaw), c => c.charCodeAt(0))
        const audioBuffer = audioCtx.createBuffer(1, bytes.length / 2, sampleRate)
        const audioBufferData = audioBuffer.getChannelData(0)
        for (let i = 0; i < bytes.length / 2; i++)
        {
            const b0 = bytes[i * 2]
            const b1 = bytes[i * 2 + 1]
            let uint16 = (b0 << 8) | b1
            if ((uint16 & 0x8000) != 0)
                uint16 = -(0x10000 - uint16)

            audioBufferData[i] = (uint16 / 0x8000) * 2 - 1

            yieldCount++
            if (yieldCount >= 100000)
            {
                yieldCount = 0
                await AsyncUtils.waitFrame()
            }
        }

        instr.audioBuffers.push(audioBuffer)
    }

    console.log("loaded sflib instrument", instr)

    sflibCache.set(instrMeta, instr)

    await sflibGetInstrumentLock.release()
    return instr
}