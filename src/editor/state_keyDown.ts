import * as Editor from "./index"
	
	
export function keyDown(data: Editor.EditorUpdateData, key: string)
{
    data.state.keysDown.add(key)
}