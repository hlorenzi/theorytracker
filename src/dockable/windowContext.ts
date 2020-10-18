import React from "react"
import * as DockableData from "./state"


export interface WindowProps
{
    contentId: DockableData.WindowId
}


export const WindowContext = React.createContext<WindowProps>(null!)


const states = new Map<DockableData.WindowId, any>()


export function useWindowRef<T>(defaultValue: T)
{
    const windowCtx = React.useContext(WindowContext)
    const contentId = windowCtx.contentId

    const [update, setUpdate] = React.useState(false)
    const stateRef = React.useRef<T>(null!)
    if (stateRef.current === null)
    {
        stateRef.current = states.get(contentId) || defaultValue
    }

    const commit = () =>
    {
        states.set(contentId, stateRef.current)
        setUpdate(!update)
    }

    return {
        ref: stateRef,
        commit,
    }
}