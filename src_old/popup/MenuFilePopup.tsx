import React from "react"
import PopupButton from "../popup/PopupButton"
import Rect from "../util/rect"
import { useAppManager } from "../AppContext"
import Project from "../project/project2"
import IoMidi from "../project/ioMidi"


interface MenuFilePopupProps
{
}


export default function MenuFilePopup(props: MenuFilePopupProps)
{
    const appManager = useAppManager()
    
    const doNew = () =>
    {
        appManager.mergeAppState({ project: Project.getDefault() })
        appManager.dispatch()
    }

    const doOpen = () =>
    {
        document.getElementById("gInputFileOpen")!.click()
    }

    React.useEffect(() =>
    {
        const handleOpenFile = (ev: Event) =>
        {
            const elem = ev.target as HTMLInputElement

            if (elem.files!.length != 1)
                return
            
            let reader = new FileReader()
            reader.readAsArrayBuffer(elem.files![0])
            reader.onload = () =>
            {
                const bytes = new Uint8Array(reader.result as any)
    
                const project = IoMidi.read(bytes)
                appManager.mergeAppState({ project })
                appManager.dispatch()
            }
        }
    
        const input = document.getElementById("gInputFileOpen") as HTMLInputElement
        input!.addEventListener("change", handleOpenFile)

        return () =>
        {
            //input!.removeEventListener("change", handleOpenFile)
        }

    }, [])

    return <>
        <PopupButton
            icon="📄"
            label="New"
            onClick={ doNew }
        />
        <PopupButton
            icon="📂"
            label="Open..."
            onClick={ doOpen }
        />
        <PopupButton
            label="Open Recent"
        >
            <PopupButton label="Test!"/>
            <PopupButton label="Test!"/>
            <PopupButton label="Test!"/>
            <PopupButton label="Test!"/>
        </PopupButton>
    </>
}