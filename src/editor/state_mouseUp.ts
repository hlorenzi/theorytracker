import * as Editor from "./index"


export function mouseUp(data: Editor.EditorUpdateData)
{
    if (!data.state.mouse.down)
        return

    data.state.mouse.down = false
}