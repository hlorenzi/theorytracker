import React from "react"
import * as Project from "./root"
import { RefState } from "../util/refState"


export const ProjectContext = React.createContext<RefState<Project.Root>>(null!)


export function useProject()
{
    const projectCtx = React.useContext(ProjectContext)
    return projectCtx
}