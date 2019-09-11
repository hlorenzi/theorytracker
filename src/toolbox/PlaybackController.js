import React from "react"
import PlaybackSynth from "../project/playbackSynth.js"
import Rational from "../util/rational.js"
import MathUtils from "../util/math.js"


export function usePlaybackController(state, dispatch, synth)
{
    const stateRef = React.useRef(state)
    stateRef.current = state

    const playbackPrevStart = React.useRef(null)
    const playbackPrevTimestamp = React.useRef(-1)
    const playbackInterval = React.useRef(null)

    const sampleInterval = React.useRef(null)
    const samplePrevTimestamp = React.useRef(null)

    function cancelPlaybackInterval()
    {
        if (playbackInterval.current)
        {
            window.cancelAnimationFrame(playbackInterval.current)
            playbackInterval.current = null
        }
    }

    function cancelSampleInterval()
    {
        if (sampleInterval.current)
        {
            window.cancelAnimationFrame(sampleInterval.current)
            sampleInterval.current = null
        }
    }

    function playbackStep(timestamp)
    {
        const deltaTime = (playbackPrevTimestamp.current < 0 ? 0 : timestamp - playbackPrevTimestamp.current)
        playbackPrevTimestamp.current = timestamp
        
        if (deltaTime > 0 && deltaTime < 250)
        {
            const measuresPerSecond = (stateRef.current.project.baseBpm / 4 / 60)
            
            synth.process(deltaTime / 1000)
            const timeAsFloat = stateRef.current.playback.timeAsFloat + deltaTime / 1000 * measuresPerSecond
            dispatch({ type: "playbackStep", timeAsFloat })
        }
        
        if (stateRef.current.playback.time.compare(stateRef.current.project.range.end.add(new Rational(1, 4))) > 0)
            dispatch({ type: "playbackSet", playing: false })
        
        if (stateRef.current.playback.playing)
            playbackInterval.current = window.requestAnimationFrame(playbackStep)
    }
    
    function playbackSet(playing)
    {
        const time = state.cursor.time1.min(state.cursor.time2)
        dispatch({ type: "playbackSet", playing, time })
    }
    
    function sampleStep(timestamp)
    {
        const deltaTime = (samplePrevTimestamp.current < 0 ? 0 : timestamp - samplePrevTimestamp.current)
        samplePrevTimestamp.current = timestamp
        
        if (deltaTime > 0 && deltaTime < 250)
            synth.process(deltaTime / 1000)
        
        if (!synth.isFinished())
            sampleInterval.current = window.requestAnimationFrame(sampleStep)
    }

    if (state.playback.playing)
    {
        if (!playbackPrevStart.current || state.playback.startTime.compare(playbackPrevStart.current) != 0)
        {
            cancelSampleInterval()
            cancelPlaybackInterval()
            synth.stopAll()
            
            PlaybackSynth.feedToSynth(state.project, synth, state.playback.startTime)
            synth.play()
            
            playbackPrevStart.current = state.playback.startTime
            playbackPrevTimestamp.current = -1
            playbackInterval.current = window.requestAnimationFrame(playbackStep)
        }
    }
    else
    {
        if (playbackInterval.current)
        {
            cancelPlaybackInterval()
            synth.stopAll()
            playbackPrevStart.current = null
        }
    }

    if (state.soundPreview)
    {
        cancelSampleInterval()
        synth.stopAll()

        if (state.soundPreview.kind == "note")
            synth.addNoteEvent(0, 0, MathUtils.midiToHertz(state.soundPreview.pitch), 1, 0.5)
        else if (state.soundPreview.kind == "chord")
        {
            for (const pitch of state.soundPreview.chord.strummingPitches)
                synth.addNoteEvent(0, 0, MathUtils.midiToHertz(pitch), 1, 0.75)
        }

        synth.play()
        samplePrevTimestamp.current = -1
        sampleInterval.current = window.requestAnimationFrame(sampleStep)
        dispatch({ type: "clearSoundPreview" })
    }

    const togglePlaying = () =>
    {
        playbackSet(!state.playback.playing)
    }

    return {
        togglePlaying,
    }
}