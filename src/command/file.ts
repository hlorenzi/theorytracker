import * as Command from "./index.ts"
import * as Global from "../state.ts"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Playback from "../playback"


let fileHandleForSaving: FileSystemFileHandle | undefined = undefined


function isProjectSaved()
{
    const state = Global.get()
    return state.project.root === state.lastSavedProject
}


function confirmDiscard()
{
    if (isProjectSaved())
        return true

    return window.confirm("Discard current song?")
}


function newProject()
{
    openProject(Project.makeNew())
}


function openProject(project: Project.ImmutableRoot)
{
    const state = Global.get()
    state.playback.stopAll()
    state.project.root = project
    state.lastSavedProject = project
    Timeline.cursorSetTime(state.timeline, project.range.start, project.range.start)
    Timeline.cursorSetLaneIndex(state.timeline, 0, 0)
    Timeline.scrollTimeIntoView(state.timeline, project.range.start)
    Global.refresh()
}


function isFileSystemAccessApiAvailable(showAlert?: boolean)
{
    if ("showOpenFilePicker" in (window as any))
        return true

    if (showAlert)
    {
        window.alert(
            "Your browser doesn't support the File System Access API.\n\n" +
            "Use the other commands labeled as \"Browser\", or " +
            "switch to a browser with support to that API, like Chrome.")
    }

    return false
}


export function openFromFile(
    filename: string,
    fileHandle: FileSystemFileHandle | undefined,
    bytes: Uint8Array)
    : boolean
{
    if (filename.endsWith(".ttproj") || filename.endsWith(".json"))
    {
        const text = new TextDecoder("utf-8").decode(bytes)
        const json = JSON.parse(text)
        openProject(Project.jsonImport(json))
        fileHandleForSaving = fileHandle
    }
    else if (filename.endsWith(".mid"))
    {
        //openProject(Project.midiImport(bytes))
        fileHandleForSaving = undefined
    }
    else
    {
        window.alert("Unrecognized file format!")
        return false
    }

    return true
}


export const commandNewProject: Command.Command =
{
    name: "New Project",
    icon: "📄",
    shortcut: [{ shift: true, key: "n" }],
    func: async () =>
    {
        if (!confirmDiscard())
            return
    
        newProject()
    }
}


export const openFile: Command.Command =
{
    name: "Open...",
    icon: "📂",
    shortcut: [{ ctrl: true, key: "o" }],
    isShortcutAvailable: () => isFileSystemAccessApiAvailable(),
    func: async () =>
    {
        if (!confirmDiscard())
            return

        if (!isFileSystemAccessApiAvailable(true))
            return

        const handles = await window.showOpenFilePicker({
            multiple: false,
            types: [{
                description: "Supported files",
                accept: {
                    "application/json": [".ttproj", ".json"],
                    "audio/midi": [".mid"],
                },
            }]
        })
        const handle = handles[0]
        const file = await handle.getFile()
        const bytes = await file.arrayBuffer()
        openFromFile(file.name, handle, new Uint8Array(bytes))
    }
}


export const saveProjectAs: Command.Command =
{
    name: "Save Project As...",
    icon: "💾",
    shortcut: [{ ctrl: true, shift: true, key: "s" }],
    isShortcutAvailable: () => isFileSystemAccessApiAvailable(),
    func: async () =>
    {
        if (!isFileSystemAccessApiAvailable(true))
            return

        const handle = await window.showSaveFilePicker({
            types: [{
                description: "Project file",
                accept: { "application/json": [".ttproj", ".json"] },
            }],
        })

        const state = Global.get()

        const jsonStr = Project.jsonExport(state.project.root)
        const writer = await handle.createWritable()
        await writer.write(jsonStr)
        await writer.close()

        fileHandleForSaving = handle
        state.lastSavedProject = state.project.root
        Global.refresh()
    }
}


export const saveProject: Command.Command =
{
    name: "Save Project",
    icon: "💾",
    shortcut: [{ ctrl: true, key: "s" }],
    isShortcutAvailable: () => isFileSystemAccessApiAvailable(),
    func: async (args) =>
    {
        if (!isFileSystemAccessApiAvailable(true))
            return

        if (!fileHandleForSaving)
        {
            saveProjectAs.func(args)
            return
        }

        const state = Global.get()

        const jsonStr = Project.jsonExport(state.project.root)
        const writer = await fileHandleForSaving.createWritable()
        await writer.write(jsonStr)
        await writer.close()

        state.lastSavedProject = state.project.root
        Global.refresh()
    }
}


export const openFileBrowser: Command.Command =
{
    name: "[Browser] Open...",
    icon: "📂",
    shortcut: [{ ctrl: true, key: "o" }],
    isShortcutAvailable: () => !isFileSystemAccessApiAvailable(),
    func: async () =>
    {
        if (!confirmDiscard())
            return

        document.getElementById("inputOpenFile")!.click()
    }
}


export const downloadProjectBrowser: Command.Command =
{
    name: "[Browser] Download Project",
    icon: "📥",
    shortcut: [{ ctrl: true, key: "s" }],
    isShortcutAvailable: () => !isFileSystemAccessApiAvailable(),
    func: async () =>
    {
        const state = Global.get()

        const jsonStr = Project.jsonExport(state.project.root)

        const element = document.createElement("a")
        element.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr))
        element.setAttribute("download", "song.ttproj")

        element.style.display = "none"
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }
}


export const previewProjectBrowser: Command.Command =
{
    name: "[Browser] Preview Project",
    icon: "📥",
    func: async () =>
    {
        const state = Global.get()

        const jsonStr = Project.jsonExport(state.project.root)

        const newWindow = window.open()!
        newWindow.document.write("<code style='white-space:pre'>")
        newWindow.document.write(jsonStr)
        newWindow.document.write("</code>")
    }
}


/*export const downloadMidiBrowser: Command.Command =
{
    name: "[Browser] Download MIDI",
    icon: "📥",
    func: async () =>
    {
        const state = Global.get()

        const bytes = Project.midiExport(state.project.root)

        const element = document.createElement("a")
        element.setAttribute("href", "data:audio/midi;base64," + btoa(String.fromCharCode(...bytes)))
        element.setAttribute("download", "song.mid")

        element.style.display = "none"
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }
}*/