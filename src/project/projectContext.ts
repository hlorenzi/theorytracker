import React from "react"
import * as Project from "./index"
import { RefState, useRefState } from "../util/refState"


export interface ProjectContextProps
{
    project: Project.Root
    savedProject: Project.Root

    undoStack: UndoPoint[]
    undoIndex: number

    copiedData: CopiedData | null

    setNew: () => void
    open: (openedProject: Project.Root) => void
    isUnsaved: () => boolean

    clearUndoStack: () => void
    addUndoPoint: (tag: string) => void
    splitUndoPoint: () => void
    undo: () => void
    redo: () => void
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


export const ProjectContext = React.createContext<RefState<ProjectContextProps>>(null!)


export function useProjectInit(): RefState<ProjectContextProps>
{
    const refState = useRefState<ProjectContextProps>(() =>
    {
        const setNew = () =>
        {
            refState.ref.current.project = Project.makeNew()
            refState.ref.current.savedProject = refState.ref.current.project

            refState.ref.current.clearUndoStack()
            refState.commit()
            window.dispatchEvent(new Event("timelineReset"))
        }


        const open = (openedProject: Project.Root) =>
        {
            refState.ref.current.project = openedProject
            refState.ref.current.savedProject = openedProject

            refState.ref.current.clearUndoStack()
            window.dispatchEvent(new Event("timelineReset"))
            refState.commit()
        }


        const isUnsaved: () => boolean = () =>
        {
            return refState.ref.current.project !== refState.ref.current.savedProject
        }


        const clearUndoStack = () =>
        {
            refState.ref.current.undoStack = [{
                tag: "new",
                project: refState.ref.current.project,
            }]

            refState.ref.current.undoIndex = 0
        }


        const addUndoPoint = (tag: string) =>
        {
            if (refState.ref.current.project === refState.ref.current.undoStack[refState.ref.current.undoIndex].project)
                return
            
            refState.ref.current.undoStack =
                refState.ref.current.undoStack.slice(0, refState.ref.current.undoIndex + 1)

            if (tag === refState.ref.current.undoStack[refState.ref.current.undoStack.length - 1].tag)
                refState.ref.current.undoStack =
                    refState.ref.current.undoStack.slice(0, refState.ref.current.undoStack.length - 1)

            refState.ref.current.undoStack.push({
                tag,
                project: refState.ref.current.project,
            })

            refState.ref.current.undoIndex = refState.ref.current.undoStack.length - 1
            saveToLocalStorageWithCooldown(refState.ref.current.project)

            //console.log(refState.ref.current.undoIndex, refState.ref.current.undoStack)
        }


        const splitUndoPoint = () =>
        {
            refState.ref.current.undoStack[refState.ref.current.undoStack.length - 1].tag = ""
        }
        

        const undo = () =>
        {
            if (refState.ref.current.undoIndex <= 0)
                return

            refState.ref.current.undoIndex--
            refState.ref.current.project =
                refState.ref.current.undoStack[refState.ref.current.undoIndex].project
                
            saveToLocalStorageWithCooldown(refState.ref.current.project)
            window.dispatchEvent(new Event("timelineRefresh"))
            //console.log(refState.ref.current.undoIndex, refState.ref.current.undoStack)
        }
        

        const redo = () =>
        {
            if (refState.ref.current.undoIndex >= refState.ref.current.undoStack.length - 1)
                return

            refState.ref.current.undoIndex++
            refState.ref.current.project =
                refState.ref.current.undoStack[refState.ref.current.undoIndex].project
                
            saveToLocalStorageWithCooldown(refState.ref.current.project)
            window.dispatchEvent(new Event("timelineRefresh"))
            //console.log(refState.ref.current.undoIndex, refState.ref.current.undoStack)
        }


        const initialProject = loadFromLocalStorage() ?? Project.getDefault()

        return {
            project: initialProject,
            savedProject: initialProject,

            undoStack: [{
                tag: "new",
                project: initialProject,
            }],
            undoIndex: 0,

            copiedData: null,

            setNew,
            open,
            isUnsaved,

            clearUndoStack,
            addUndoPoint,
            splitUndoPoint,
            undo,
            redo,
        }
    })

    return refState
}


export function useProject()
{
    const projectCtx = React.useContext(ProjectContext)
    return projectCtx
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