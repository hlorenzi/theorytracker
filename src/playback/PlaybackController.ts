import React from "react"
import { AppManager } from "../AppState"
import { Synth } from "./synth"
import SynthFeed from "./synthFeed"
import Rational from "../util/rational"


let synth: Synth | null = null


export function usePlaybackController(appManager: AppManager)
{
    const playData = React.useRef({
        playing: false,
        timestamp: -1,
    })

    function processFrame(timestamp: number)
    {
        if (!appManager.appState.playback.playing && playData.current.playing)
        {
            requestAnimationFrame(() =>
            {
                playData.current.playing = false

                if (synth)
                    synth.stopAll()

                appManager.mergeAppState({
                    playback: { ...appManager.appState.playback,
                        playing: false,
                    }
                })
                appManager.dispatch()
            })
            return
        }

        const prevTimestamp = playData.current.timestamp
        const deltaTime = (prevTimestamp < 0 ? 0 : timestamp - prevTimestamp)
        playData.current.timestamp = timestamp
        
        if (deltaTime > 0 && deltaTime < 250)
        {
            const measuresPerSecond = (120 / 4 / 60)
            
            synth!.process(deltaTime / 1000)
            const timeAsFloat = appManager.appState.playback.timeAsFloat + deltaTime / 1000 * measuresPerSecond
            appManager.mergeAppState({
                playback: { ...appManager.appState.playback,
                    timeAsFloat,
                    time: Rational.fromFloat(timeAsFloat, 64),
                }
            })
            appManager.dispatch()
        }
        
        requestAnimationFrame(processFrame)
    }

    if (appManager.appState.playback.playing && !playData.current.playing)
    {
        requestAnimationFrame(() =>
        {
            if (!synth)
                synth = new Synth()

            synth.reset()
            SynthFeed.feed(appManager.appState.project, synth, appManager.appState.playback.timeStart)
            synth.play()
            
            playData.current.playing = true
            playData.current.timestamp = -1

            appManager.mergeAppState({
                playback: { ...appManager.appState.playback,
                    time: appManager.appState.playback.timeStart,
                    timeAsFloat: appManager.appState.playback.timeStart.asFloat(),
                }
            })
            appManager.dispatch()

            requestAnimationFrame(async () =>
            {
                await synth!.prepare(appManager.appState.sflib, appManager.appState.project)
                requestAnimationFrame(processFrame)
            })
        })
    }
}