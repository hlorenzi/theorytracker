import React from "react"
import { Prefs } from "./prefs"
import { RefState } from "../util/refState"


export const PrefsContext = React.createContext<RefState<Prefs>>(null!)


export function usePrefs()
{
    return React.useContext(PrefsContext)
}