import React from "react"
import * as Dockable from "../dockable"
import * as Project from "../project"
import * as Playback from "../playback"
import * as Prefs from "../prefs"
import * as UI from "../ui"
import Range from "../util/range"
import { useRefState } from "../util/refState"
import styled from "styled-components"
import Rational from "../util/rational"
import * as WavEncoder from "../util/wavEncode"


interface PrefsProps
{
    readonly prefs: Prefs.Prefs
}


export function Render()
{
    const prefs = Prefs.usePrefs()
    const playback = Playback.usePlayback()
    const projectCtx = Project.useProject()

    const windowCtx = Dockable.useWindow()
    windowCtx.setTitle("Render")
    windowCtx.setPreferredSize(600, 450)


    const [rendering, setRendering] = Dockable.useWindowState(() => false)
    const [progress, setProgress] = Dockable.useWindowState(() => 0)


    const onRenderAndDownload = () =>
    {
        setRendering(true)
        setProgress(0)

        ;(async () =>
        {
            try
            {
                const project = projectCtx.ref.current.project
                const range = project.range
                    //Range.fromStartDuration(playback.ref.current.startTime, new Rational(1))

                const audioBuffer = await playback.ref.current.renderToBuffer(range, setProgress)

                const wavBuffer = WavEncoder.encode(audioBuffer)
                console.log("wavBuffer", wavBuffer)

                const blob = new Blob([wavBuffer], { type: "octet/stream" })
                const url = window.URL.createObjectURL(blob)

                const element = document.createElement("a")
                element.setAttribute("href", url)
                element.setAttribute("download", "song.wav")
            
                element.style.display = "none"
                document.body.appendChild(element)
                element.click()
                document.body.removeChild(element)

                /*const audioCtx = playback.ref.current.synth.audioCtx
                const sourceNode = audioCtx.createBufferSource()
                sourceNode.buffer = audioBuffer
                sourceNode.connect(audioCtx.destination)
                sourceNode.start()*/
            }
            catch (e)
            {
                console.error(e)
                window.alert("An error occurred!\n\n" + e)
            }
            finally
            {
                setRendering(false)
                setProgress(0)
            }
        })()
    }


    return <div style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",

		padding: "1em",

        display: "grid",
        gridTemplate: "auto / 1fr",
        justifyContent: "start",
        justifyItems: "start",
        alignContent: "start",
        gap: "0.5em",
    }}>

        <div>
            Output Format
        </div>

        <UI.DropdownMenu
            selected="wav"
            items={[
                { label: ".wav", value: "wav" },
            ]}
        />
        
        <div/>

        <UI.Button
            label="Render and Download"
            onClick={ onRenderAndDownload }
            disabled={ rendering }
        />

        <UI.LoadingBar
            progress={ progress }
        />

    </div>
}