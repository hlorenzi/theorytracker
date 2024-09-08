import * as Solid from "solid-js"
import * as Project from "./project"
import * as Timeline from "./timeline"
import * as Prefs from "./prefs"


const [state, setState] =
    Solid.createSignal(makeNew())


export interface State
{
    test: number
    prefs: Prefs.Prefs
    project: Project.Mutable
    timeline: Timeline.State
}


export function makeNew(): State
{
    return {
        test: 0,
        prefs: Prefs.makeNew(),
        project: { root: Project.makeTest() },
        timeline: Timeline.makeNew(),
    }
}


export function get(): State
{
    return state()
}


export function refresh()
{
    setState({ ...state() })
}