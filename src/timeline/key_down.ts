import * as Timeline from "./index.ts"


export function keyDown(
    timeline: Timeline.State,
    key: string)
{
    timeline.keysDown.add(key)
}