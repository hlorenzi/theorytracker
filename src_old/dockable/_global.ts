import React from "react"
import * as Dockable from "./index"
import * as Window from "../windows"
import * as GlobalObservable from "../util/globalObservable"
import Rect from "../util/rect"


export type WindowElement = (props: WindowProps) => JSX.Element | null


export interface Global
{
    state: Dockable.State

    contentIdToComponent: Map<Dockable.WindowId, WindowElement>
    contentIdToData: Map<Dockable.WindowId, any>
}


export let global: Global = null!


export function initGlobal()
{
    const contentIdToComponent = new Map()
    const contentIdToData = new Map()

    const state = Dockable.makeRoot()
    const panel = Dockable.makePanel(state)
    Dockable.addWindow(state, panel, 1)
    Dockable.dock(state, panel, state.rootPanel, Dockable.DockMode.Full)
    console.log(state)

    contentIdToComponent.set(1, Window.Timeline)

    global =
    {
        state,

        contentIdToComponent,
        contentIdToData,
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


interface MousePos
{
    x: number
    y: number
}


export const mousePos: MousePos =
{
    x: 0,
    y: 0,
}


window.addEventListener("mousemove", (ev: MouseEvent) =>
{
    mousePos.x = ev.pageX
    mousePos.y = ev.pageY
})


export function modifyContentData(contentId: Dockable.WindowId, modifyFn: (data: any) => void)
{
    let data: any = global.contentIdToData.get(contentId)
    if (!data)
    {
        data = {}
        global.contentIdToData.set(contentId, data)
    }

    modifyFn(data)
}


export function getMostRecentContentData<T>(elemType: WindowElement, getFn: (data: any) => T | null): T | null
{
    const panel = global.state.activePanel
    if (!panel || panel.windowIds.length < 1)
        return null

    const contentId = panel.windowIds[0]
    const elem = global.contentIdToComponent.get(contentId)
    if (!elem || elem !== elemType)
        return null

    const data = global.contentIdToData.get(contentId)
    if (!data)
        return null

    return getFn(data)
}


export function createFloating(
    elem: WindowElement,
    data: any,
    alignX?: number,
    alignY?: number,
    rect?: Rect)
    : Dockable.Panel
{
    let state = Dockable.global.state

    const id = Dockable.global.contentIdToComponent.size + 1
    Dockable.global.contentIdToComponent.set(id, elem)
    Dockable.global.contentIdToData.set(id, data)

    const panel = Dockable.makePanel(state)
    Dockable.addWindow(state, panel, id)
    if (rect)
        panel.rect = new Rect(rect.x2, rect.y2, 500, 300)
    else
        panel.rect = new Rect(mousePos.x, mousePos.y, 500, 300)

    panel.justOpenedAnchorRect = rect ?? new Rect(mousePos.x - 15, mousePos.y - 15, 30, 30)
    panel.justOpenedAnchorAlignX = alignX ?? 1
    panel.justOpenedAnchorAlignY = alignY ?? 1
    panel.bugfixAppearOnTop = true

    Dockable.global.state.activePanel = panel
    Dockable.notifyObservers()
    return panel
}


export function createFloatingEphemeral(
    elem: WindowElement,
    data: any,
    alignX?: number,
    alignY?: number,
    rect?: Rect)
    : Dockable.Panel
{
    const panel = createFloating(elem, data, alignX, alignY, rect)
    Dockable.removeEphemerals(Dockable.global.state)
    panel.ephemeral = true
    Dockable.notifyObservers()
    return panel
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


export function useWindow(): WindowProps
{
    return React.useContext(WindowContext)
}