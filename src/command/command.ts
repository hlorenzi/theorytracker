export interface Command
{
    name: string
    icon: string
    shortcut?: CommandShortcut[]
    isShortcutAvailable?: () => boolean
    isAvailable?: (args: CommandArguments) => boolean
    func: (args: CommandArguments) => Promise<void>
}


export interface CommandShortcut
{
    ctrl?: boolean
    shift?: boolean
    key: string
}


export interface CommandArguments
{

}