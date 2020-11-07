import React from "react"
import * as Project from "./project"
import * as Menubar from "./menubar"
import * as Popup from "./popup"
import * as Playback from "./playback"


export default function MenuFile()
{
    const project = Project.useProject()


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
                const bytes = new Uint8Array(reader.result as any)
    
                project.ref.current = Project.midiImport(bytes)
                project.commit()
                window.dispatchEvent(new Event("refreshProjectTracks"))
                window.dispatchEvent(new Event("timelineRewind"))
            }
        }
    
        const input = document.getElementById("inputOpenFile") as HTMLInputElement
        input!.addEventListener("change", onOpenFileChange)

        return () =>
        {
            input!.removeEventListener("change", onOpenFileChange)
        }

    }, [])


    const onNew = () =>
    {
        project.ref.current = Project.getDefault()
        project.commit()
        window.dispatchEvent(new Event("refreshProjectTracks"))
        window.dispatchEvent(new Event("timelineRewind"))
    }


    const onOpen = () =>
    {
        document.getElementById("inputOpenFile")!.click()
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
            </Popup.Root>
        </Menubar.Item>

        <input
            id="inputOpenFile"
            type="file"
            accept=".mid,.json,.txt"
            style={{
                display: "none",
        }}/>
    </>
}