import React from "react"
import { AppManager } from "./AppState"


interface AppContextProps
{
    appManager: AppManager
}


export const AppContext = React.createContext<AppContextProps | null>(null)


export function useAppManager(): AppManager
{
    return React.useContext(AppContext)!.appManager
}