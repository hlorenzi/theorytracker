import React from "react"
import * as Playback from "./index"
import * as Project from "../project"
import { RefState, useRefState } from "../util/refState"
import Rect from "../util/rect"
import Rational from "../util/rational"
import Range from "../util/range"


export interface PlaybackContextProps
{
    synth: Playback.Manager
    playing: boolean
    timestamp: number
    playTimeMs: number
    playTimeMsPrev: number
    playTime: Rational
    playTimePrev: Rational
    refreshTimeMs: number
    curAnimationFrameRef: number
}


export const PlaybackContext = React.createContext<RefState<PlaybackContextProps>>(null!)



export function usePlayback(): RefState<PlaybackContextProps>
{
    return React.useContext(PlaybackContext)
}


export function usePlaybackInit(projectRef: RefState<Project.Root>): RefState<PlaybackContextProps>
{
    const synth = useRefState<PlaybackContextProps>(() =>
    {
        return {
            synth: new Playback.Manager(),
            playing: false,
            timestamp: 0,
            playTimeMs: 0,
            playTimeMsPrev: 0,
            playTime: new Rational(0),
            playTimePrev: new Rational(0),
            refreshTimeMs: 0,

            curAnimationFrameRef: 0,
        }
    })

    React.useEffect(() =>
    {
        function processFrame(timestamp: number)
        {
            const prevTimestamp = synth.ref.current.timestamp
            const deltaTimeMs = (prevTimestamp < 0 ? 0 : timestamp - prevTimestamp)

            synth.ref.current.timestamp = timestamp
            synth.ref.current.playTimeMsPrev = synth.ref.current.playTimeMs
            synth.ref.current.playTimePrev = synth.ref.current.playTime

            synth.ref.current.refreshTimeMs += deltaTimeMs
            
            if (deltaTimeMs > 0 && deltaTimeMs < 250)
            {
                const measuresPerSecond = (120 / 4 / 60)
                
                synth.ref.current.synth.process(deltaTimeMs)
                synth.ref.current.playTimeMs += deltaTimeMs * measuresPerSecond
                synth.ref.current.playTime = Rational.fromFloat(synth.ref.current.playTimeMs / 1000, 10000)

                Playback.feedNotes(
                    synth.ref.current.synth,
                    projectRef.ref.current,
                    new Range(
                        synth.ref.current.playTimePrev,
                        synth.ref.current.playTime,
                        true,
                        true))

                if (synth.ref.current.refreshTimeMs > 1000 / 20)
                {
                    synth.ref.current.refreshTimeMs = 0
                    synth.commit()
                }
            }

            synth.ref.current.curAnimationFrameRef =
                requestAnimationFrame(processFrame)
        }

        function setPlaying(playing: boolean)
        {
            if (synth.ref.current.curAnimationFrameRef != 0)
            {
                synth.ref.current.synth.stopAll()
                cancelAnimationFrame(synth.ref.current.curAnimationFrameRef)
                synth.ref.current.curAnimationFrameRef = 0
            }

            synth.ref.current.playing = playing
            synth.ref.current.timestamp = 0
            synth.ref.current.playTimeMs = 0
            synth.ref.current.playTimeMsPrev = 0
            synth.ref.current.playTime = new Rational(0)
            synth.ref.current.playTimePrev = new Rational(0)
            synth.ref.current.refreshTimeMs = 0

            if (playing)
            {
                synth.ref.current.curAnimationFrameRef =
                    requestAnimationFrame(processFrame)
            }

            synth.commit()
        }

        window.addEventListener("playbackSetPlaying", () => setPlaying(true))
        window.addEventListener("playbackStopPlaying", () => setPlaying(false))
        window.addEventListener("playbackTogglePlaying", () => setPlaying(!synth.ref.current.playing))

    }, [])

    return synth
}