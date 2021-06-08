import * as Project from "./index"
import * as Timeline from "../timeline"
import * as GlobalObservable from "../util/globalObservable"


export interface GlobalData
{
    project: Project.Root
    savedProject: Project.Root

    curFileHandleForSave: FileSystemFileHandle | null

    undoStack: UndoPoint[]
    undoIndex: number

    copiedData: CopiedData | null
}


export interface UndoPoint
{
    tag: string
    project: Project.Root
}


export interface CopiedData
{
    project: Project.Root
    elemsByTrack: Project.Element[][]
}


export let global: GlobalData = null!


export function initGlobal()
{
    const initialProject = loadFromLocalStorage() ?? Project.getDefault()

    global =
    {
        project: initialProject,
        savedProject: initialProject,

        curFileHandleForSave: null,
    
        undoStack: [{
            tag: "new",
            project: initialProject,
        }],
        undoIndex: 0,
    
        copiedData: null,
    }
}


export const globalObservable = GlobalObservable.makeGlobalObservable()
export function useGlobal()
{
    GlobalObservable.useGlobalObservable(globalObservable)
}


export function notifyObservers()
{
    globalObservable.notifyObservers()
}


export function setNew()
{
    global.project = Project.makeNew()
    global.savedProject = global.project
    global.curFileHandleForSave = null

    clearUndoStack()
    notifyObservers()
    Timeline.sendEventReset()
}


export function open(openedProject: Project.Root)
{
    global.project = openedProject
    global.savedProject = openedProject

    clearUndoStack()
    notifyObservers()
    Timeline.sendEventReset()
}


export function setFileHandleForSave(fileHandle: FileSystemFileHandle | null)
{
    global.curFileHandleForSave = fileHandle
    notifyObservers()
}


export function markAsSaved()
{
    global.savedProject = global.project
    notifyObservers()
}


export function isUnsaved(): boolean
{
    return global.project !== global.savedProject
}


export function clearUndoStack()
{
    global.undoStack = [{
        tag: "new",
        project: global.project,
    }]

    global.undoIndex = 0
}


export function addUndoPoint(tag: string)
{
    if (global.project === global.undoStack[global.undoIndex].project)
        return
    
    global.undoStack =
        global.undoStack.slice(0, global.undoIndex + 1)

    if (tag === global.undoStack[global.undoStack.length - 1].tag)
        global.undoStack =
            global.undoStack.slice(0, global.undoStack.length - 1)

    global.undoStack.push({
        tag,
        project: global.project,
    })

    global.undoIndex = global.undoStack.length - 1
    saveToLocalStorageWithCooldown(global.project)
}


export function splitUndoPoint()
{
    global.undoStack[global.undoStack.length - 1].tag = ""
}


export function undo()
{
    if (global.undoIndex <= 0)
        return

    global.undoIndex--
    global.project =
        global.undoStack[global.undoIndex].project
        
    saveToLocalStorageWithCooldown(global.project)
    notifyObservers()
    Timeline.sendEventRefresh()
}


export function redo()
{
    if (global.undoIndex >= global.undoStack.length - 1)
        return

    global.undoIndex++
    global.project =
        global.undoStack[global.undoIndex].project
        
    saveToLocalStorageWithCooldown(global.project)
    notifyObservers()
    Timeline.sendEventRefresh()
}


let saveToLocalStorageWithCooldownLastDate = new Date()
export function saveToLocalStorageWithCooldown(project: Project.Root)
{
    const newDate = new Date()
    if (newDate.getTime() - saveToLocalStorageWithCooldownLastDate.getTime() < 10000)
        return

    saveToLocalStorageWithCooldownLastDate = newDate
    saveToLocalStorage(project)
}


export function saveToLocalStorage(project: Project.Root)
{
    const jsonStr = Project.jsonExport(project)
    window.localStorage.setItem("autosave", jsonStr)
}


export function loadFromLocalStorage(): Project.Root | null
{
    const jsonStr = window.localStorage.getItem("autosave")
    if (jsonStr)
        return Project.jsonImport(JSON.parse(jsonStr))
    else
        return null
}