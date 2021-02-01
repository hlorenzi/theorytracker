import React from "react"
import * as Dockable from "./dockable"
import * as Project from "./project"
import * as Menubar from "./menubar"
import * as Popup from "./popup"
import * as Playback from "./playback"
import * as Windows from "./windows"


export default function MenuFile()
{
    const dockable = Dockable.useDockable()
    const project = Project.useProject()
    const playback = Playback.usePlayback()


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
                playback.ref.current.stopPlaying()

                const filename = elem.files![0].name
                const bytes = new Uint8Array(reader.result as any)
    
                if (filename.endsWith(".mid"))
                {
                    project.ref.current.open(Project.midiImport(bytes))
                }
                else if (filename.endsWith(".json") || filename.endsWith(".ttproj"))
                {
                    const text = new TextDecoder("utf-8").decode(bytes)
                    const json = JSON.parse(text)
                    project.ref.current.open(Project.jsonImport(json))
                }
                else
                {
                    window.alert("Unrecognized file format!")
                }
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
            if (project.ref.current.isUnsaved())
            {
                ev.preventDefault()
                ev.returnValue = ""
                return ""
            }
        })

    }, [])


    const confirmDiscard = () =>
    {
        if (!project.ref.current.isUnsaved())
            return true

        return window.confirm("Discard current song?")
    }


    const onNew = () =>
    {
        if (!confirmDiscard())
            return

        project.ref.current.setNew()
        playback.ref.current.stopPlaying()
    }

    const onOpen = () =>
    {
        if (!confirmDiscard())
            return

        document.getElementById("inputOpenFile")!.click()
    }

    const onJsonDownload = () =>
    {
        const jsonStr = Project.jsonExport(project.ref.current.project)

        const element = document.createElement("a")
        element.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr))
        element.setAttribute("download", "song.ttproj")
    
        element.style.display = "none"
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    const onJsonPreview = () =>
    {
        const jsonStr = Project.jsonExport(project.ref.current.project)

        const newWindow = window.open()!
        newWindow.document.write("<code style='white-space:pre'>")
        newWindow.document.write(jsonStr)
        newWindow.document.write("</code>")
    }

    const onRender = () =>
    {
        dockable.ref.current.createFloating(Windows.Render, null)
    }


    return <>
        <Menubar.Item label="File">
            <Popup.Root>
                <Popup.Button
                    icon="📄"
                    label="New"
                    onClick={ onNew }
                />
                <Popup.Button
                    icon="📂"
                    label="Open..."
                    onClick={ onOpen }
                />
                <Popup.Divider/>
                {/*<Popup.Button
                    icon="💾"
                    label="Save"
                    onClick={ onOpen }
                />
                <Popup.Button
                    icon="💾"
                    label="Save As..."
                    onClick={ onOpen }
                />*/}
                <Popup.Button
                    icon="📥"
                    label="Download project (JSON)"
                    onClick={ onJsonDownload }
                />
                <Popup.Button
                    icon="📥"
                    label="Preview as JSON"
                    onClick={ onJsonPreview }
                />
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