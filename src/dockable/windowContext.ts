import React from "react"
import * as Dockable from "./index"
import * as Window from "../windows"
import { RefState, useRefState } from "../util/refState"
import Rect from "../util/rect"


export interface DockableContextProps
{
    state: Dockable.State
    setState: (newState: Dockable.State) => void

    contentIdToComponent: (id: Dockable.WindowId) => any
    contentIdToData: (id: Dockable.WindowId) => any

    createFloating: (elem: any, data: any, alignX?: number, alignY?: number, rect?: Rect) => Dockable.Panel
    createFloatingEphemeral: (elem: any, data: any, alignX?: number, alignY?: number, rect?: Rect) => Dockable.Panel
}


export const DockableContext = React.createContext<RefState<DockableContextProps>>(null!)



export function useDockable(): RefState<DockableContextProps>
{
    return React.useContext(DockableContext)
}


interface MousePos
{
    x: number
    y: number
}


export function useDockableInit(): RefState<DockableContextProps>
{
    const mousePosRef = React.useRef<MousePos>({ x: 0, y: 0 })

    React.useEffect(() =>
    {
        const onMouseMove = (ev: MouseEvent) =>
        {
            mousePosRef.current = {
                x: ev.pageX,
                y: ev.pageY,
            }
        }

        window.addEventListener("mousemove", onMouseMove)

    }, [])

    const dockable = useRefState<DockableContextProps>(() =>
    {
        const idsToComponents = new Map()
        const idsToData = new Map()

        const state = Dockable.makeRoot()
        const panel = Dockable.makePanel(state)
        Dockable.addWindow(state, panel, 1)
        Dockable.dock(state, panel, state.rootPanel, Dockable.DockMode.Full)
        console.log(state)

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

        const createFloating = (elem: any, data: any, alignX?: number, alignY?: number, rect?: Rect): Dockable.Panel =>
        {
            let state = dockable.ref.current.state

            const id = idsToComponents.size + 1
            idsToComponents.set(id, elem)
            idsToData.set(id, data)

            const panel = Dockable.makePanel(state)
            Dockable.addWindow(state, panel, id)
            if (rect)
                panel.rect = new Rect(rect.x2, rect.y2, 500, 300)
            else
                panel.rect = new Rect(mousePosRef.current.x, mousePosRef.current.y, 500, 300)

            panel.justOpenedAnchorRect = rect ?? new Rect(mousePosRef.current.x, mousePosRef.current.y, 0, 0)
            panel.justOpenedAnchorAlignX = alignX ?? 1
            panel.justOpenedAnchorAlignY = alignY ?? 1
            panel.bugfixAppearOnTop = true

            dockable.commit()
            return panel
        }

        const createFloatingEphemeral = (elem: any, data: any, alignX?: number, alignY?: number, rect?: Rect): Dockable.Panel =>
        {
            const panel = createFloating(elem, data, alignX, alignY, rect)
            Dockable.removeEphemerals(state)
            panel.ephemeral = true
            dockable.commit()
            return panel
        }

        return {
            state,
            setState,

            contentIdToComponent,
            contentIdToData,

            createFloating,
            createFloatingEphemeral,
        }
    })

    return dockable
}


export interface WindowProps
{
    panel: Dockable.Panel
    contentId: Dockable.WindowId
    data: any

    setTitle: (title: string) => void
    setPreferredSize: (w: number, h: number) => void
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