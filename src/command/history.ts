import * as Command from "../command"
import * as Project from "../project"


export const undo: Command.Command =
{
    name: "Undo",
    shortcut: [{ ctrl: true, key: "z" }],
    func: async () =>
    {
        Project.undo()
    }
}


export const redo: Command.Command =
{
    name: "Redo",
    shortcut: [{ ctrl: true, key: "y" }, { ctrl: true, shift: true, key: "z" }],
    func: async () =>
    {
        Project.redo()
    }
}