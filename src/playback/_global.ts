import React from "react"
import * as Playback from "./index"
import * as Project from "../project"
import * as Theory from "../theory"
import Rational from "../util/rational"
import Range from "../util/range"
import { SynthManager } from "./synthManager"
import * as AynscUtils from "../util/async"
import * as GlobalObservable from "../util/globalObservable"


export interface GlobalData
{
    synth: Playback.SynthManager
    synthLoading: boolean

    playing: boolean
    firstPlayingFrame: boolean
    startTime: Rational
    nextStartTime: Rational
    playTimeFloat: number
    playTimeFloatPrev: number
    playTime: Rational
    playTimePrev: Rational
    refreshTimeMs: number

    requestAnimationFrameId: number
    requestAnimationFrameTimestamp: number
    requestAnimationFrameDate: Date
    setIntervalId: number
}


export let global: GlobalData = null!


export function initGlobal()
{
    global =
    {
        synth: new Playback.SynthManager(false),
        synthLoading: false,

        playing: false,
        firstPlayingFrame: false,
        startTime: new Rational(0),
        nextStartTime: new Rational(0),
        playTimeFloat: 0,
        playTimeFloatPrev: 0,
        playTime: new Rational(0),
        playTimePrev: new Rational(0),
        refreshTimeMs: 0,
        
        requestAnimationFrameId: 0,
        requestAnimationFrameTimestamp: 0,
        requestAnimationFrameDate: new Date(),
        setIntervalId: 0,
    }
}


export const globalObservable = GlobalObservable.makeGlobalObservable()
export function useGlobal()
{
    GlobalObservable.useGlobalObservable(globalObservable)


    React.useEffect(() =>
    {
        global.synthLoading = true
        globalObservable.notifyObservers()

        global.synth.prepare(Project.global.project).then(() =>
        {
            global.synthLoading = false
            globalObservable.notifyObservers()
        })

    }, [Playback.getSflibMeta(), global.playing, Project.global.project.tracks])
}


export function notifyObservers()
{
    globalObservable.notifyObservers()
}


function processFrame(deltaTimeMs: number, canRedrawScreen: boolean)
{
    if (deltaTimeMs > 70)
        return

    global.playTimeFloatPrev = global.playTimeFloat
    global.playTimePrev = global.playTime

    const measuresPerSecond = (Project.global.project.baseBpm / 4 / 60)
    
    global.synth.process(deltaTimeMs)
    global.playTimeFloat += deltaTimeMs / 1000 * measuresPerSecond
    global.playTime = Rational.fromFloat(global.playTimeFloat, 10000)

    Playback.feedNotes(
        global.synth,
        Project.global.project,
        global.firstPlayingFrame,
        0.05 + global.synth.audioCtx.currentTime * 1000,
        global.startTime,
        new Range(
            global.playTimePrev,
            global.playTime,
            true,
            false))

    global.refreshTimeMs += deltaTimeMs
    if (canRedrawScreen)// && global.refreshTimeMs >= 1000 / 30)
    {
        global.refreshTimeMs = 0
        notifyObservers()
    }

    global.firstPlayingFrame = false

    if (global.playTime.compare(Project.global.project.range.end) > 0 &&
        global.synth.isFinished())
    {
        setPlaying(false)
    }
}

function processAnimationFrame(timestamp: number)
{
    const prevTimestamp = global.requestAnimationFrameTimestamp
    global.requestAnimationFrameTimestamp = timestamp

    global.requestAnimationFrameDate = new Date()

    const deltaTimeMs =
        global.synthLoading ? 0 :
        (prevTimestamp < 0 ? 0 : timestamp - prevTimestamp)

    if (deltaTimeMs > 0 && deltaTimeMs < 250)
    {
        processFrame(deltaTimeMs, true)
    }

    if (global.playing)
    {
        global.requestAnimationFrameId =
            requestAnimationFrame(processAnimationFrame)
    }
}

function processInterval(deltaTimeMs: number)
{
    // Take over from requestAnimationFrame and
    // process playback on the setInterval callback only if
    // requestAnimationFrame was blocked (by e.g. being in the background)

    const msSinceLastRequestAnimationFrame = 
        (new Date().getTime()) -
        global.requestAnimationFrameDate.getTime()

    if (msSinceLastRequestAnimationFrame > 250 &&
        deltaTimeMs > 0 && deltaTimeMs < 250)
    {
        processFrame(deltaTimeMs, false)
    }
}

export function setPlaying(playing: boolean)
{
    if (global.requestAnimationFrameId != 0)
    {
        global.synth.stopAll()

        cancelAnimationFrame(global.requestAnimationFrameId)
        global.requestAnimationFrameId = 0

        clearInterval(global.setIntervalId)
        global.setIntervalId = 0
    }

    global.playing = playing
    global.firstPlayingFrame = true
    global.startTime = global.nextStartTime
    global.playTime = global.nextStartTime
    global.playTimePrev = global.nextStartTime
    global.playTimeFloat = global.nextStartTime.asFloat()
    global.playTimeFloatPrev = global.nextStartTime.asFloat()
    global.refreshTimeMs = 0

    if (playing)
    {
        global.requestAnimationFrameId =
            requestAnimationFrame(processAnimationFrame)

        global.requestAnimationFrameTimestamp = 0
        global.requestAnimationFrameDate = new Date()
        
        global.setIntervalId =
            +setInterval(() => processInterval(1000 / 60), 1000 / 60)
    }

    notifyObservers()
}


export function setStartTime(startTime: Rational)
{
    global.nextStartTime = startTime
    notifyObservers()
}


export function togglePlaying()
{
    setPlaying(!global.playing)
}


export function playNotePreview(
    trackId: Project.ID,
    midiPitch: number,
    volumeDb: number,
    velocity: number)
{
    if (global.playing)
        return

    const time = 0.05 + 1000 * global.synth.audioCtx.currentTime

    //global.synth.stopAll()
    global.synth.playNote({
        trackId,
        noteId: -1,
        
        startMs: time,
        durationMs: 100,

        midiPitchSeq: [{ timeMs: time, value: midiPitch }],
        volumeSeq: [{ timeMs: time, value: volumeDb }],
        velocitySeq: [{ timeMs: time, value: velocity }],
    })
}


export function playChordPreview(
    trackId: Project.ID,
    chord: Theory.Chord,
    volumeDb: number,
    velocity: number)
{
    if (global.playing)
        return

    const time = 0.05 + 1000 * global.synth.audioCtx.currentTime

    for (const midiPitch of chord.strummingPitches)
    {
        global.synth.playNote({
            trackId: trackId,
            noteId: -1,
            
            startMs: time,
            durationMs: 250,

            midiPitchSeq: [{ timeMs: time, value: midiPitch }],
            volumeSeq: [{ timeMs: time, value: volumeDb }],
            velocitySeq: [{ timeMs: time, value: velocity }],
        })
    }
}


export async function renderToBuffer(
    range: Range,
    onProgress: (p: number) => void)
    : Promise<AudioBuffer>
{
    const project = Project.global.project
    const startMs = Project.getMillisecondsAt(project, range.start)

    // FIXME: Compute correct release time for last notes in the song
    const endMs = 1000 + Project.getMillisecondsAt(project, range.end)
    const durationMs = endMs - startMs

    const sampleRate = 44100
    const sampleCount = sampleRate * Math.ceil(durationMs / 1000)

    console.log(
        "renderToBuffer",
        "range", range,
        "durationMs", durationMs,
        "sampleCount", sampleCount)

    const offlineSynth = new SynthManager(true, sampleCount, sampleRate)
    await offlineSynth.prepare(project)

    Playback.feedNotes(
        offlineSynth,
        project,
        true,
        0,
        range.start,
        range)

    const offlineCtx = offlineSynth.audioCtx as OfflineAudioContext

    let audioBuffer: AudioBuffer | null = null
    offlineCtx.startRendering().then(b => audioBuffer = b)

    while (!audioBuffer)
    {
        const progress = offlineCtx.currentTime / (durationMs / 1000)
        onProgress(progress)
        await AynscUtils.waitSeconds(0.2)
    }

    await offlineSynth.destroy()

    onProgress(1)
    await AynscUtils.waitSeconds(0.2)

    return audioBuffer
}