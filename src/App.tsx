import React from "react"
import * as Dockable from "./dockable"
import * as Command from "./command"
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

    const [version, setVersion] = React.useState("")

    React.useEffect(() =>
    {
        ;(async () =>
        {
            const versionFile = await fetch("build/build_version.txt")
            const versionTxt = await versionFile.text()
            if (versionTxt.startsWith("v0-"))
                setVersion("v0." + versionTxt.match(".*?\-(.*?)\-")![1])
        })()

    }, [])


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
                let handled = false

                for (const command of Command.allCommands)
                {
                    if (!command.shortcut)
                        continue

                    if (command.isShortcutAvailable && !command.isShortcutAvailable())
                        continue

                    if (command.isAvailable && !command.isAvailable({}))
                        continue

                    for (const shortcut of command.shortcut)
                    {
                        if (!!shortcut.ctrl !== ev.ctrlKey)
                            continue

                        if (!!shortcut.shift !== ev.shiftKey)
                            continue

                        if (key !== shortcut.key)
                            continue

                        //console.log("handled keyboard command: ", command.name)
                        command.func({})
                        handled = true
                        break
                    }

                    if (handled)
                        break
                }

                if (!handled)
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
                    <span style={{
                        color: "#aaa",
                        alignSelf: "center",
                        marginLeft: "1em",
                    }}>
                        { version }
                    </span>
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