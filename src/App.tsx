import React, { useRef } from "react"
import * as Dockable from "./dockable"
import * as Project from "./project"
import * as Playback from "./playback"
import * as Prefs from "./prefs"
import * as Popup from "./popup"
import * as Menubar from "./menubar"
import { useRefState } from "./util/refState"
import PlaybackToolbar from "./PlaybackToolbar"
import MenuFile from "./MenuFile"
import MenuWindow from "./MenuWindow"
import "./types"


export default function App()
{
    const dockableCtx = Dockable.useDockableInit()
    const projectCtx = useRefState(() => Project.getDefault())
    const playbackCtx = Playback.usePlaybackInit(projectCtx)
    const prefsCtx = useRefState(() => Prefs.getDefault())
    const popupCtx = useRefState(() => Popup.getDefaultCtx())

    return <>
        <Dockable.DockableContext.Provider value={ dockableCtx }>
        <Project.ProjectContext.Provider value={ projectCtx }>
        <Playback.PlaybackContext.Provider value={ playbackCtx }>
        <Prefs.PrefsContext.Provider value={ prefsCtx }>
        <Popup.PopupContext.Provider value={ popupCtx }>
            <div style={{
                display: "grid",
                gridTemplate: "auto 1fr / 1fr",
                width: "100vw",
                height: "100vh",
            }}>

                <Menubar.Root>
                    <MenuFile/>
                    <MenuWindow/>
                    <PlaybackToolbar/>
                </Menubar.Root>

                <Dockable.Container/>

            </div>

            { !popupCtx.ref.current.elem ? null :
                <popupCtx.ref.current.elem/>
            }
        </Popup.PopupContext.Provider>
        </Prefs.PrefsContext.Provider>
        </Playback.PlaybackContext.Provider>
        </Project.ProjectContext.Provider>
        </Dockable.DockableContext.Provider>
    </>
}