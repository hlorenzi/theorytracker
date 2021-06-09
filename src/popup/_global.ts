import React from "react"
import * as GlobalObservable from "../util/globalObservable"
import Rect from "../util/rect"


export interface Global
{
    elem: (() => JSX.Element) | null
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