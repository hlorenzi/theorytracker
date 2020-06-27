import React from "react"
import { AppState, AppDispatch } from "../App"


interface PopupContextProps
{
	appState: AppState
    appDispatch: AppDispatch
}


export default React.createContext<PopupContextProps | null>(null)