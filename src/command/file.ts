import * as Project from "../project"
import * as Playback from "../playback"


function confirmDiscard()
{
    if (!Project.isUnsaved())
        return true

    return window.confirm("Discard current song?")
}


function checkFileSystemAccessAPI()
{
    if ("showOpenFilePicker" in window)
        return true;

    window.alert(
        "Your browser doesn't support the File System Access API.\n\n" +
        "Use the other commands labeled as \"Browser\", or " +
        "switch to a browser with support to that API, like Chrome.")
    return false;
}


export function openFromFile(filename: string, fileHandle: FileSystemFileHandle | null, bytes: Uint8Array): boolean
{
    if (filename.endsWith(".json") || filename.endsWith(".ttproj"))
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


export function newProject()
{
    if (!confirmDiscard())
        return

    Project.setNew()
    Playback.setPlaying(false)
}


export async function openFile()
{
    if (!confirmDiscard())
        return

    if (!checkFileSystemAccessAPI())
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


export async function saveProjectAs()
{
    if (!checkFileSystemAccessAPI())
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


export async function saveProject()
{
    if (!checkFileSystemAccessAPI())
        return

    if (!Project.global.curFileHandleForSave)
    {
        saveProjectAs()
        return
    }

    const jsonStr = Project.jsonExport(Project.global.project)
    const writer = await Project.global.curFileHandleForSave.createWritable()
    await writer.write(jsonStr)
    await writer.close()
    Project.markAsSaved()
}


export function openFileBrowser()
{
    if (!confirmDiscard())
        return

    document.getElementById("inputOpenFile")!.click()
}


export function downloadProjectBrowser()
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


export function previewProjectBrowser()
{
    const jsonStr = Project.jsonExport(Project.global.project)

    const newWindow = window.open()!
    newWindow.document.write("<code style='white-space:pre'>")
    newWindow.document.write(jsonStr)
    newWindow.document.write("</code>")
}