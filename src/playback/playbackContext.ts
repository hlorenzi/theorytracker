import React from "react"
import * as Playback from "./index"
import * as Project from "../project"
import { RefState, useRefState } from "../util/refState"
import Rect from "../util/rect"
import Rational from "../util/rational"
import Range from "../util/range"
import MathUtils from "../util/mathUtils"


export interface PlaybackContextProps
{
    synth: Playback.SynthManager
    synthLoaded: boolean

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

    playNotePreview: (trackId: Project.ID, midiPitch: number, volume: number) => void
}


export const PlaybackContext = React.createContext<RefState<PlaybackContextProps>>(null!)



export function usePlayback(): RefState<PlaybackContextProps>
{
    return React.useContext(PlaybackContext)
}


export function usePlaybackInit(projectRef: RefState<Project.Root>): RefState<PlaybackContextProps>
{
    const playback = useRefState<PlaybackContextProps>(() =>
    {
        return {
            synth: new Playback.SynthManager(),
            synthLoaded: false,

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

            playNotePreview: (trackId: Project.ID, midiPitch: number, volume: number) =>
            {
                window.dispatchEvent(new CustomEvent("playbackPlayNotePreview", {
                    detail: { trackId, midiPitch, volume },
                }))
            }
        }
    })

    React.useEffect(() =>
    {
        playback.ref.current.synthLoaded = false

        playback.ref.current.synth.prepare(projectRef.ref.current)
            .then(() => playback.ref.current.synthLoaded = true)

    }, [Playback.getSflibMeta(), playback.ref.current.playing, projectRef.ref.current.tracks])

    React.useEffect(() =>
    {
        function processFrame(deltaTimeMs: number, canRedrawScreen: boolean)
        {
            playback.ref.current.playTimeFloatPrev = playback.ref.current.playTimeFloat
            playback.ref.current.playTimePrev = playback.ref.current.playTime

            const measuresPerSecond = (projectRef.ref.current.baseBpm / 4 / 60)
            
            playback.ref.current.synth.process(deltaTimeMs)
            playback.ref.current.playTimeFloat += deltaTimeMs / 1000 * measuresPerSecond
            playback.ref.current.playTime = Rational.fromFloat(playback.ref.current.playTimeFloat, 10000)

            Playback.feedNotes(
                playback.ref.current.synth,
                projectRef.ref.current,
                playback.ref.current.firstPlayingFrame,
                playback.ref.current.startTime,
                new Range(
                    playback.ref.current.playTimePrev,
                    playback.ref.current.playTime,
                    true,
                    true))

            playback.ref.current.refreshTimeMs += deltaTimeMs
            if (canRedrawScreen)// && playback.ref.current.refreshTimeMs >= 1000 / 30)
            {
                playback.ref.current.refreshTimeMs = 0
                playback.commit()
            }

            playback.ref.current.firstPlayingFrame = false
        }

        function processAnimationFrame(timestamp: number)
        {
            const prevTimestamp = playback.ref.current.requestAnimationFrameTimestamp
            playback.ref.current.requestAnimationFrameTimestamp = timestamp

            playback.ref.current.requestAnimationFrameDate = new Date()

            const deltaTimeMs =
                !playback.ref.current.synthLoaded ? 0 :
                (prevTimestamp < 0 ? 0 : timestamp - prevTimestamp)

            if (deltaTimeMs > 0 && deltaTimeMs < 250)
            {
                processFrame(
                    playback.ref.current.firstPlayingFrame ? 1 : deltaTimeMs,
                    true)
            }

            playback.ref.current.requestAnimationFrameId =
                requestAnimationFrame(processAnimationFrame)
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
                    setInterval(() => processInterval(1000 / 60), 1000 / 60)
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

            playback.ref.current.synth.stopAll()
            playback.ref.current.synth.playNote(
                data.trackId, 0,
                MathUtils.midiToHertz(data.midiPitch),
                data.volume)

            setTimeout(() =>
            {
                playback.ref.current.synth.releaseNote(data.trackId, 0)

            }, 100)
        })

        window.addEventListener("playbackStartPlaying", () => setPlaying(true))
        window.addEventListener("playbackStopPlaying", () => setPlaying(false))
        window.addEventListener("playbackTogglePlaying", () => setPlaying(!playback.ref.current.playing))

        window.addEventListener("keydown", (ev: KeyboardEvent) =>
        {
            if (document.activeElement && document.activeElement.tagName == "INPUT")
                return

            if (ev.key.toLowerCase() == " ")
            {
                ev.preventDefault()
                ev.stopPropagation()
                setPlaying(!playback.ref.current.playing)
            }
        })

    }, [])

    return playback
}