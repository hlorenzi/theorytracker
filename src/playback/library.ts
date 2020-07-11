import React from "react"
import { AppManager } from "../AppState"


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


export function useSoundfontLibrary(appManager: AppManager)
{
    React.useEffect(() =>
    {
        window.requestAnimationFrame(async () =>
        {
            const sflib = await loadSflibMeta()
            appManager.mergeAppState({ sflib })
            appManager.dispatch()
        })

    }, [])
}