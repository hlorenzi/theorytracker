import * as Editor from "./index"
	
	
export function keyUp(data: Editor.EditorUpdateData, key: string)
{
    data.state.keysDown.delete(key)
}