import React from "react"
import * as Playback from "./index"
import * as Project from "../project"
import { RefState, useRefState } from "../util/refState"
import Rect from "../util/rect"
import Rational from "../util/rational"
import Range from "../util/range"


export interface PlaybackContextProps
{
    synth: Playback.SynthManager
    playing: boolean
    timestamp: number
    startTime: Rational
    playTimeFloat: number
    playTimeFloatPrev: number
    playTime: Rational
    playTimePrev: Rational
    refreshTimeMs: number
    requestAnimationFrameId: number

    setStartTime: (startTime: Rational) => void
    startPlaying: () => void
    stopPlaying: () => void
    togglePlaying: () => void
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
            playing: false,
            timestamp: 0,
            startTime: new Rational(0),
            playTimeFloat: 0,
            playTimeFloatPrev: 0,
            playTime: new Rational(0),
            playTimePrev: new Rational(0),
            refreshTimeMs: 0,

            requestAnimationFrameId: 0,

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
        }
    })

    React.useEffect(() =>
    {
        function processFrame(timestamp: number)
        {
            const prevTimestamp = playback.ref.current.timestamp
            const deltaTimeMs = (prevTimestamp < 0 ? 0 : timestamp - prevTimestamp)

            playback.ref.current.timestamp = timestamp
            playback.ref.current.playTimeFloatPrev = playback.ref.current.playTimeFloat
            playback.ref.current.playTimePrev = playback.ref.current.playTime

            
            if (deltaTimeMs > 0 && deltaTimeMs < 250)
            {
                const measuresPerSecond = (projectRef.ref.current.baseBpm / 4 / 60)
                
                playback.ref.current.synth.process(deltaTimeMs)
                playback.ref.current.playTimeFloat += deltaTimeMs / 1000 * measuresPerSecond
                playback.ref.current.playTime = Rational.fromFloat(playback.ref.current.playTimeFloat, 10000)

                Playback.feedNotes(
                    playback.ref.current.synth,
                    projectRef.ref.current,
                    playback.ref.current.playTimePrev.compare(playback.ref.current.startTime) == 0,
                    playback.ref.current.startTime,
                    new Range(
                        playback.ref.current.playTimePrev,
                        playback.ref.current.playTime,
                        true,
                        true))

                playback.ref.current.refreshTimeMs += deltaTimeMs
                if (playback.ref.current.refreshTimeMs > 1000 / 30)
                {
                    playback.ref.current.refreshTimeMs = 0
                    playback.commit()
                }
            }

            playback.ref.current.requestAnimationFrameId =
                requestAnimationFrame(processFrame)
        }

        function setPlaying(playing: boolean)
        {
            if (playback.ref.current.requestAnimationFrameId != 0)
            {
                playback.ref.current.synth.stopAll()
                cancelAnimationFrame(playback.ref.current.requestAnimationFrameId)
                playback.ref.current.requestAnimationFrameId = 0
            }

            playback.ref.current.playing = playing
            playback.ref.current.timestamp = 0
            playback.ref.current.playTime = playback.ref.current.playTimePrev =
                playback.ref.current.startTime
            playback.ref.current.playTimeFloat = playback.ref.current.playTimeFloatPrev =
                playback.ref.current.startTime.asFloat()
            playback.ref.current.refreshTimeMs = 0

            if (playing)
            {
                playback.ref.current.requestAnimationFrameId =
                    requestAnimationFrame(processFrame)
            }

            playback.commit()
        }

        window.addEventListener("playbackSetStartTime", (ev: Event) =>
        {
            const data = (ev as CustomEvent).detail
            playback.ref.current.startTime = data.startTime
            playback.commit()
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