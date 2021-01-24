import React from "react"
import * as Playback from "./index"
import * as Project from "../project"
import * as Theory from "../theory"
import { RefState, useRefState } from "../util/refState"
import Rect from "../util/rect"
import Rational from "../util/rational"
import Range from "../util/range"
import * as MathUtils from "../util/mathUtils"
import { SynthManager } from "./synthManager"
import { Utils } from "../theory"
import * as AynscUtils from "../util/async"


export interface PlaybackContextProps
{
    synth: Playback.SynthManager
    synthLoading: boolean

    playing: boolean
    firstPlayingFrame: boolean
    startTime: Rational
    playTimeFloat: number
    playTimeFloatPrev: number
    playTime: Rational
    playTimePrev: Rational
    refreshTimeMs: number

    requestAnimationFrameId: number
    requestAnimationFrameTimestamp: number
    requestAnimationFrameDate: Date
    setIntervalId: number

    setStartTime: (startTime: Rational) => void
    startPlaying: () => void
    stopPlaying: () => void
    togglePlaying: () => void

    playNotePreview: (trackId: Project.ID, midiPitch: number, volumeDb: number, velocity: number) => void
    playChordPreview: (trackId: Project.ID, chord: Theory.Chord, volumeDb: number, velocity: number) => void

    renderToBuffer: (range: Range, onProgress: (p: number) => void) => Promise<AudioBuffer>
}


export const PlaybackContext = React.createContext<RefState<PlaybackContextProps>>(null!)



export function usePlayback(): RefState<PlaybackContextProps>
{
    return React.useContext(PlaybackContext)
}


export function usePlaybackInit(projectRef: RefState<Project.ProjectContextProps>): RefState<PlaybackContextProps>
{
    const playback = useRefState<PlaybackContextProps>(() =>
    {
        return {
            synth: new Playback.SynthManager(false),
            synthLoading: false,

            playing: false,
            firstPlayingFrame: false,
            startTime: new Rational(0),
            playTimeFloat: 0,
            playTimeFloatPrev: 0,
            playTime: new Rational(0),
            playTimePrev: new Rational(0),
            refreshTimeMs: 0,
            
            requestAnimationFrameId: 0,
            requestAnimationFrameTimestamp: 0,
            requestAnimationFrameDate: new Date(),
            setIntervalId: 0,

            setStartTime: (startTime: Rational) =>
            {
                window.dispatchEvent(new CustomEvent("playbackSetStartTime", {
                    detail: { startTime },
                }))
            },

            startPlaying: () =>
            {
                window.dispatchEvent(new CustomEvent("playbackStartPlaying"))
            },

            stopPlaying: () =>
            {
                window.dispatchEvent(new CustomEvent("playbackStopPlaying"))
            },

            togglePlaying: () =>
            {
                window.dispatchEvent(new CustomEvent("playbackTogglePlaying"))
            },

            playNotePreview: (trackId: Project.ID, midiPitch: number, volumeDb: number, velocity: number) =>
            {
                window.dispatchEvent(new CustomEvent("playbackPlayNotePreview", {
                    detail: { trackId, midiPitch, volumeDb, velocity },
                }))
            },

            playChordPreview: (trackId: Project.ID, chord: Theory.Chord, volumeDb: number, velocity: number) =>
            {
                window.dispatchEvent(new CustomEvent("playbackPlayChordPreview", {
                    detail: { trackId, chord, volumeDb, velocity },
                }))
            },

            renderToBuffer: null!,
        }
    })

    React.useEffect(() =>
    {
        playback.ref.current.synthLoading = true

        playback.ref.current.synth.prepare(projectRef.ref.current.project)
            .then(() => playback.ref.current.synthLoading = false)

    }, [Playback.getSflibMeta(), playback.ref.current.playing, projectRef.ref.current.project.tracks])

    React.useEffect(() =>
    {
        function processFrame(deltaTimeMs: number, canRedrawScreen: boolean)
        {
            if (deltaTimeMs > 70)
                return

            playback.ref.current.playTimeFloatPrev = playback.ref.current.playTimeFloat
            playback.ref.current.playTimePrev = playback.ref.current.playTime

            const measuresPerSecond = (projectRef.ref.current.project.baseBpm / 4 / 60)
            
            playback.ref.current.synth.process(deltaTimeMs)
            playback.ref.current.playTimeFloat += deltaTimeMs / 1000 * measuresPerSecond
            playback.ref.current.playTime = Rational.fromFloat(playback.ref.current.playTimeFloat, 10000)

            Playback.feedNotes(
                playback.ref.current.synth,
                projectRef.ref.current.project,
                playback.ref.current.firstPlayingFrame,
                0.05 + playback.ref.current.synth.audioCtx.currentTime * 1000,
                playback.ref.current.startTime,
                new Range(
                    playback.ref.current.playTimePrev,
                    playback.ref.current.playTime,
                    true,
                    false))

            playback.ref.current.refreshTimeMs += deltaTimeMs
            if (canRedrawScreen)// && playback.ref.current.refreshTimeMs >= 1000 / 30)
            {
                playback.ref.current.refreshTimeMs = 0
                playback.commit()
            }

            playback.ref.current.firstPlayingFrame = false

            if (playback.ref.current.playTime.compare(projectRef.ref.current.project.range.end) > 0 &&
                playback.ref.current.synth.isFinished())
            {
                playback.ref.current.stopPlaying()
            }
        }

        function processAnimationFrame(timestamp: number)
        {
            const prevTimestamp = playback.ref.current.requestAnimationFrameTimestamp
            playback.ref.current.requestAnimationFrameTimestamp = timestamp

            playback.ref.current.requestAnimationFrameDate = new Date()

            const deltaTimeMs =
                playback.ref.current.synthLoading ? 0 :
                (prevTimestamp < 0 ? 0 : timestamp - prevTimestamp)

            if (deltaTimeMs > 0 && deltaTimeMs < 250)
            {
                processFrame(deltaTimeMs, true)
            }

            if (playback.ref.current.playing)
            {
                playback.ref.current.requestAnimationFrameId =
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
                playback.ref.current.requestAnimationFrameDate.getTime()

            if (msSinceLastRequestAnimationFrame > 250 &&
                deltaTimeMs > 0 && deltaTimeMs < 250)
            {
                processFrame(deltaTimeMs, false)
            }
        }

        function setPlaying(playing: boolean)
        {
            if (playback.ref.current.requestAnimationFrameId != 0)
            {
                playback.ref.current.synth.stopAll()

                cancelAnimationFrame(playback.ref.current.requestAnimationFrameId)
                playback.ref.current.requestAnimationFrameId = 0

                clearInterval(playback.ref.current.setIntervalId)
                playback.ref.current.setIntervalId = 0
            }

            playback.ref.current.playing = playing
            playback.ref.current.firstPlayingFrame = true

            playback.ref.current.playTime = playback.ref.current.playTimePrev =
                playback.ref.current.startTime
            playback.ref.current.playTimeFloat = playback.ref.current.playTimeFloatPrev =
                playback.ref.current.startTime.asFloat()
            playback.ref.current.refreshTimeMs = 0

            if (playing)
            {
                playback.ref.current.requestAnimationFrameId =
                    requestAnimationFrame(processAnimationFrame)

                playback.ref.current.requestAnimationFrameTimestamp = 0
                playback.ref.current.requestAnimationFrameDate = new Date()
                
                playback.ref.current.setIntervalId =
                    +setInterval(() => processInterval(1000 / 60), 1000 / 60)
            }

            playback.commit()
        }

        window.addEventListener("playbackSetStartTime", (ev: Event) =>
        {
            const data = (ev as CustomEvent).detail
            playback.ref.current.startTime = data.startTime
            playback.commit()
        })

        window.addEventListener("playbackPlayNotePreview", (ev: Event) =>
        {
            const data = (ev as CustomEvent).detail

            if (playback.ref.current.playing)
                return

            const time = 0.05 + 1000 * playback.ref.current.synth.audioCtx.currentTime

            //playback.ref.current.synth.stopAll()
            playback.ref.current.synth.playNote({
                trackId: data.trackId,
                noteId: -1,
                
                startMs: time,
                durationMs: 100,

                midiPitchSeq: [{ timeMs: time, value: data.midiPitch }],
                volumeSeq: [{ timeMs: time, value: data.volumeDb }],
                velocitySeq: [{ timeMs: time, value: data.velocity }],
            })
        })

        window.addEventListener("playbackPlayChordPreview", (ev: Event) =>
        {
            const data = (ev as CustomEvent).detail

            if (playback.ref.current.playing)
                return

            const time = 0.05 + 1000 * playback.ref.current.synth.audioCtx.currentTime
            const chord = data.chord as Theory.Chord

            for (const midiPitch of chord.strummingPitches)
            {
                playback.ref.current.synth.playNote({
                    trackId: data.trackId,
                    noteId: -1,
                    
                    startMs: time,
                    durationMs: 250,

                    midiPitchSeq: [{ timeMs: time, value: midiPitch }],
                    volumeSeq: [{ timeMs: time, value: data.volumeDb }],
                    velocitySeq: [{ timeMs: time, value: data.velocity }],
                })
            }
        })

        window.addEventListener("playbackStartPlaying", () => setPlaying(true))
        window.addEventListener("playbackStopPlaying", () => setPlaying(false))
        window.addEventListener("playbackTogglePlaying", () => setPlaying(!playback.ref.current.playing))

    }, [])

    playback.ref.current.renderToBuffer = (range: Range, onProgress: (p: number) => void) =>
        renderToBuffer(playback, projectRef, range, onProgress)

    return playback
}


async function renderToBuffer(
    playback: RefState<Playback.PlaybackContextProps>,
    projectCtx: RefState<Project.ProjectContextProps>,
    range: Range,
    onProgress: (p: number) => void)
    : Promise<AudioBuffer>
{
    const project = projectCtx.ref.current.project
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