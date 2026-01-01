import * as Solid from "solid-js"
import * as Project from "./project"
import * as Timeline from "./timeline"
import * as Playback from "./playback"
import * as Prefs from "./prefs"


const [refreshToken, setRefreshToken] =
    Solid.createSignal(0)


export interface State
{
    prefs: Prefs.Prefs
    project: Project.Mutable
    lastSavedProject: Project.ImmutableRoot
    timeline: Timeline.State
    playback: Playback.Manager
}


export const state = makeNew()


export function makeNew(): State
{
    const newProject = Project.makeTest()

    return {
        prefs: Prefs.makeNew(),
        project: { root: newProject },
        lastSavedProject: newProject,
        timeline: Timeline.makeNew(),
        playback: new Playback.Manager(),
    }
}


export function getStatic(): State
{
    return state
}


export function get(): State
{
    refreshToken()
    return state
}


export function refresh()
{
    setRefreshToken(t => t + 1)
}