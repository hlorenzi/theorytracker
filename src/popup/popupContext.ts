import React from "react"
import { RefState } from "../util/refState"
import Rect from "../util/rect"


export interface PopupContextProps
{
    elem: (() => JSX.Element) | null
    rect: Rect
}


export interface PopupRootContextProps
{
    curSubPopup: any
    openSubPopup: (ref: any) => void
    itemIndex: number
}


export const PopupContext = React.createContext<RefState<PopupContextProps>>(null!)
export const PopupRootContext = React.createContext<PopupRootContextProps>(null!)


export function usePopupRoot(): PopupRootContextProps
{
    return React.useContext(PopupRootContext)
}


export function usePopup(): RefState<PopupContextProps>
{
    return React.useContext(PopupContext)
}


export function getDefaultCtx(): PopupContextProps
{
    return {
        elem: null,
        rect: new Rect(0, 0, 0, 0),
    }
}