import React from "react"
import * as Dockable from "./index"
import * as Window from "../windows"
import { RefState, useRefState } from "../util/refState"
import Rect from "../util/rect"
import Rational from "../util/rational"
import Range from "../util/range"


export interface DockableContextProps
{
    state: Dockable.State
    setState: (newState: Dockable.State) => void

    contentIdToComponent: (id: Dockable.WindowId) => any
    contentIdToData: (id: Dockable.WindowId) => any

    createFloating: (elem: any, data: any, rect: Rect) => void
}


export const DockableContext = React.createContext<RefState<DockableContextProps>>(null!)



export function useDockable(): RefState<DockableContextProps>
{
    return React.useContext(DockableContext)
}


export function useDockableInit(): RefState<DockableContextProps>
{
    const dockable = useRefState<DockableContextProps>(() =>
    {
        const idsToComponents = new Map()
        const idsToData = new Map()

        let state = Dockable.makeRoot()
        state = Dockable.addPanel(state, 1, Dockable.DockMode.Full, 1)

        idsToComponents.set(1, Window.Timeline)

        const setState = (newState: Dockable.State) =>
        {
            dockable.ref.current.state = newState
            dockable.commit()
        }

        const contentIdToComponent = (id: Dockable.WindowId) =>
        {
            return idsToComponents.get(id)
        }

        const contentIdToData = (id: Dockable.WindowId) =>
        {
            return idsToData.get(id)
        }

        const createFloating = (elem: any, data: any, rect: Rect) =>
        {
            let state = dockable.ref.current.state

            const id = idsToComponents.size + 1
            idsToComponents.set(id, elem)
            idsToData.set(id, data)

            state = Dockable.addFloatingPanel(
                state,
                new Rect(rect.x2, rect.y2, 500, 300),
                id)

            dockable.ref.current.state = state
            dockable.commit()
        }

        return {
            state,
            setState,

            contentIdToComponent,
            contentIdToData,

            createFloating,
        }
    })

    return dockable
}


export interface WindowProps
{
    contentId: Dockable.WindowId
    data: any
}


export const WindowContext = React.createContext<WindowProps>(null!)


const states = new Map<Dockable.WindowId, any>()


export function useWindow(): WindowProps
{
    return React.useContext(WindowContext)
}


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