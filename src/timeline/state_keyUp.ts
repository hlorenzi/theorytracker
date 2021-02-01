import * as Timeline from "./index"
	
	
export function keyUp(data: Timeline.WorkData, key: string)
{
    data.state.keysDown.delete(key)
}