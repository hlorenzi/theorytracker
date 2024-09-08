import * as Timeline from "./index.ts"


export function keyUp(
    timeline: Timeline.State,
    key: string)
{
    timeline.keysDown.delete(key)
}