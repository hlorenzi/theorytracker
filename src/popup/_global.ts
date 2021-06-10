import React from "react"
import * as Dockable from "../dockable"
import * as GlobalObservable from "../util/globalObservable"
import Rect from "../util/rect"


export type PopupElement = (() => JSX.Element) | null


export interface Global
{
    elem: PopupElement
    rect: Rect
}


export let global: Global = null!


export function initGlobal()
{
    global = {
        elem: null,
        rect: new Rect(0, 0, 0, 0),
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


export function showAtMouse(elem: PopupElement)
{
    global.elem = elem

    global.rect = new Rect(
        Dockable.mousePos.x + 2,
        Dockable.mousePos.y + 2,
        0, 0)

    notifyObservers()
}


export interface PopupRootContextProps
{
    curSubPopup: any
    openSubPopup: (ref: any) => void
    itemIndex: number
}


export const PopupRootContext = React.createContext<PopupRootContextProps>(null!)


export function usePopupRoot(): PopupRootContextProps
{
    return React.useContext(PopupRootContext)
}