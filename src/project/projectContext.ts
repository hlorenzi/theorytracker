import React from "react"
import * as Project from "./index"
import { RefState, useRefState } from "../util/refState"


export interface ProjectContextProps
{
    project: Project.Root

    undoStack: UndoPoint[]
    undoIndex: number

    copiedData: CopiedData | null

    setNew: () => void

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
            refState.ref.current.project = Project.getDefault()
            refState.commit()
            refState.ref.current.clearUndoStack()
            window.dispatchEvent(new Event("timelineReset"))
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
                
            window.dispatchEvent(new Event("timelineRefresh"))
            //console.log(refState.ref.current.undoIndex, refState.ref.current.undoStack)
        }


        const initialProject = Project.getDefault()

        return {
            project: initialProject,

            undoStack: [{
                tag: "new",
                project: initialProject,
            }],
            undoIndex: 0,

            copiedData: null,

            setNew,

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