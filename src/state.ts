import * as Solid from "solid-js"
import * as Project from "./project"
import * as Timeline from "./timeline"
import * as Playback from "./playback"
import * as Prefs from "./prefs"


const [state, setState] =
    Solid.createSignal(makeNew())


export interface State
{
    prefs: Prefs.Prefs
    project: Project.Mutable
    timeline: Timeline.State
    playback: Playback.Manager
}


export function makeNew(): State
{
    return {
        prefs: Prefs.makeNew(),
        project: { root: Project.makeTest() },
        timeline: Timeline.makeNew(),
        playback: new Playback.Manager(),
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