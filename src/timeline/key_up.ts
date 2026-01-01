import * as Timeline from "./index.ts"


export function keyUp(
    timeline: Timeline.State,
    key: string)
{
    timeline.keysDown.delete(key)
}


export function allKeysUp(
    timeline: Timeline.State)
{
    timeline.keysDown.clear()
}