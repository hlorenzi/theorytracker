import * as Prefs from "./prefs"


export let global: Prefs.Prefs = null!


export function initGlobal()
{
    global = Prefs.getDefault()
}