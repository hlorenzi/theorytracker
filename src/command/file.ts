import * as Command from "../command"
import * as Project from "../project"
import * as Playback from "../playback"


function confirmDiscard()
{
    if (!Project.isUnsaved())
        return true

    return window.confirm("Discard current song?")
}


function isFileSystemAccessApiAvailable(showAlert?: boolean)
{
    if ("showOpenFilePicker" in window)
        return true;

    if (showAlert)
    {
        window.alert(
            "Your browser doesn't support the File System Access API.\n\n" +
            "Use the other commands labeled as \"Browser\", or " +
            "switch to a browser with support to that API, like Chrome.")
    }

    return false;
}


export function openFromFile(filename: string, fileHandle: FileSystemFileHandle | null, bytes: Uint8Array): boolean
{
    if (filename.endsWith(".ttproj") || filename.endsWith(".json"))
    {
        const text = new TextDecoder("utf-8").decode(bytes)
        const json = JSON.parse(text)
        Project.open(Project.jsonImport(json))
        Project.setFileHandleForSave(fileHandle)
    }
    else if (filename.endsWith(".mid"))
    {
        Project.open(Project.midiImport(bytes))
        Project.setFileHandleForSave(null)
    }
    else
    {
        window.alert("Unrecognized file format!")
        return false
    }

    return true
}


export const newProject: Command.Command =
{
    name: "New Project",
    icon: "📄",
    func: async () =>
    {
        if (!confirmDiscard())
            return
    
        Project.setNew()
        Playback.setPlaying(false)
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
        const jsonStr = Project.jsonExport(Project.global.project)
        const writer = await handle.createWritable()
        await writer.write(jsonStr)
        await writer.close()
        Project.setFileHandleForSave(handle)
        Project.markAsSaved()
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

        if (!Project.global.curFileHandleForSave)
        {
            saveProjectAs.func(args)
            return
        }

        const jsonStr = Project.jsonExport(Project.global.project)
        const writer = await Project.global.curFileHandleForSave.createWritable()
        await writer.write(jsonStr)
        await writer.close()
        Project.markAsSaved()
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
    name: "[Browser] Download Project...",
    icon: "📥",
    shortcut: [{ ctrl: true, key: "s" }],
    isShortcutAvailable: () => !isFileSystemAccessApiAvailable(),
    func: async () =>
    {
        const jsonStr = Project.jsonExport(Project.global.project)

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
    name: "[Browser] Preview Project...",
    icon: "📥",
    func: async () =>
    {
        const jsonStr = Project.jsonExport(Project.global.project)

        const newWindow = window.open()!
        newWindow.document.write("<code style='white-space:pre'>")
        newWindow.document.write(jsonStr)
        newWindow.document.write("</code>")
    }
}