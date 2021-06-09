import React from "react"
import * as Dockable from "./dockable"
import * as Command from "./command"
import * as Project from "./project"
import * as Menubar from "./menubar"
import * as Popup from "./popup"
import * as Playback from "./playback"
import * as Windows from "./windows"


export default function MenuFile()
{
    const dockable = Dockable.useDockable()


    React.useEffect(() =>
    {
        const onOpenFileChange = (ev: Event) =>
        {
            const elem = ev.target as HTMLInputElement

            if (elem.files!.length != 1)
                return
            
            let reader = new FileReader()
            reader.readAsArrayBuffer(elem.files![0])
            reader.onload = () =>
            {
                Playback.setPlaying(false)

                const filename = elem.files![0].name
                const bytes = new Uint8Array(reader.result as any)
                Command.openFromFile(filename, null, bytes)
            }
        }
    
        const input = document.getElementById("inputOpenFile") as HTMLInputElement
        input!.addEventListener("change", onOpenFileChange)

        return () =>
        {
            input!.removeEventListener("change", onOpenFileChange)
        }

    }, [])


    React.useEffect(() =>
    {
        window.addEventListener("beforeunload", (ev) =>
        {
            if (Project.isUnsaved())
            {
                ev.preventDefault()
                ev.returnValue = ""
                return ""
            }
        })

    }, [])


    const onRender = () =>
    {
        dockable.ref.current.createFloating(Windows.Render, null)
    }


    return <>
        <Menubar.Item label="File">
            <Popup.Root>
                <Popup.Button command={ Command.newProject }/>
                <Popup.Button command={ Command.openFile }/>
                <Popup.Divider/>
                <Popup.Button command={ Command.saveProject }/>
                <Popup.Button command={ Command.saveProjectAs }/>
                <Popup.Divider/>
                <Popup.Button command={ Command.openFileBrowser }/>
                <Popup.Button command={ Command.downloadProjectBrowser }/>
                <Popup.Button command={ Command.previewProjectBrowser }/>
                <Popup.Divider/>
                <Popup.Button
                    icon="💿"
                    label="Render..."
                    onClick={ onRender }
                />
            </Popup.Root>
        </Menubar.Item>

        <input
            id="inputOpenFile"
            type="file"
            accept=".mid,.ttproj,.json,.txt"
            style={{
                display: "none",
        }}/>
    </>
}