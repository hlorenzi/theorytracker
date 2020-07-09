import React from "react"


interface PopupContextProps
{
    curSubPopup: any
    openSubPopup: (ref: any) => void
    itemIndex: number
}


export const PopupContext = React.createContext<PopupContextProps | null>(null)


export function usePopup(): PopupContextProps
{
    return React.useContext(PopupContext)!
}