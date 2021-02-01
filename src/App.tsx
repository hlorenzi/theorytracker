import React from "react"
import * as Dockable from "./dockable"
import * as Project from "./project"
import * as Playback from "./playback"
import * as Prefs from "./prefs"
import * as Popup from "./popup"
import * as Menubar from "./menubar"
import * as UI from "./ui"
import { useRefState } from "./util/refState"
import * as GlobalObservable from "./util/globalObservable"
import PlaybackToolbar from "./PlaybackToolbar"
import MenuFile from "./MenuFile"
import MenuWindow from "./MenuWindow"
import "./types"


let initializedGlobals = false


export default function App()
{
    if (!initializedGlobals)
    {
        initializedGlobals = true
        Prefs.initGlobal()
        Project.initGlobal()
        Playback.initGlobal()
    }

    Project.useGlobal()
    Playback.useGlobal()

    const dockableCtx = Dockable.useDockableInit()
    const popupCtx = useRefState(() => Popup.getDefaultCtx())


    React.useEffect(() =>
    {
        window.addEventListener("keydown", (ev: KeyboardEvent) =>
        {
            if (document.activeElement && document.activeElement.tagName == "INPUT")
                return

            const key = ev.key.toLowerCase()

            if (key == " ")
            {
                Playback.togglePlaying()
            }
            else if ((key == "y" && ev.ctrlKey) || (key == "z" && ev.ctrlKey && ev.shiftKey))
            {
                Project.redo()
            }
            else if (key == "z" && ev.ctrlKey)
            {
                Project.undo()
            }
            else
            {
                return
            }

            ev.preventDefault()
            ev.stopPropagation()
        })

    }, [])


    return <>
        <Dockable.DockableContext.Provider value={ dockableCtx }>
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
                    <a
                        href="https://github.com/hlorenzi/theorytracker#how-to-use"
                        style={{
                            color: "#fff",
                            alignSelf: "center",
                            marginLeft: "1em",
                            fontSize: "1.25em",
                    }}>
                        How to use the app
                    </a>
                </Menubar.Root>

                { !Playback.global.synthLoading ? null :
                    <UI.LoadingBar floating/>
                }

                <Dockable.Container/>

            </div>

            { !popupCtx.ref.current.elem ? null :
                <popupCtx.ref.current.elem/>
            }
        </Popup.PopupContext.Provider>
        </Dockable.DockableContext.Provider>
    </>
}