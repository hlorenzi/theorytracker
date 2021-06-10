import * as Timeline from "./index"
	
	
export function keyUp(state: Timeline.State, key: string)
{
    state.keysDown.delete(key)
}