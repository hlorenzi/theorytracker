import React from "react"
import { useAppManager } from "../AppContext"


export default function PlaybackToolbox(props: {})
{
    const appManager = useAppManager()
    const togglePlayback = () =>
    {
        appManager.mergeAppState({ playback: { ...appManager.appState.playback,
            playing: !appManager.appState.playback.playing,
        }})
        appManager.dispatch()
    }


    React.useEffect(() =>
    {
        const handleSpacebarKey = (ev: KeyboardEvent) =>
        {
            if (ev.key == " ")
                togglePlayback()
        }

        window.addEventListener("keydown", handleSpacebarKey)

        return () =>
        {
            window.removeEventListener("keydown", handleSpacebarKey)
        }

    }, [])


    return <div
        style={{
            backgroundColor: "#111",
            borderBottom: "1px solid #888",
            display: "grid",
            gridTemplate: "1fr / auto",
            gridAutoFlow: "column",
            justifyContent: "start",
    }}>

        <button
            onClick={ togglePlayback }
        >
            Play
        </button>
        
    </div>
}