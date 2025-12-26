import * as Solid from "solid-js"
import * as Global from "./state.ts"
import * as Timeline from "./timeline"
import * as Inspector from "./inspector"
import * as Playback from "./playback"


export function setupKeyboardShortcuts()
{
    window.addEventListener("keydown", handleKeyDown)

    Solid.onCleanup(() => window.removeEventListener("keydown", handleKeyDown))
}


function handleKeyDown(ev: KeyboardEvent)
{
    if (document.activeElement &&
        document.activeElement.tagName === "INPUT")
        return

    const key = ev.key.toLowerCase()

    if (key === " ")
    {
        const project = Global.get().project
        const timeline = Global.get().timeline
        const playback = Global.get().playback
        playback.setStartTime(timeline.playbackStartTime)
        playback.togglePlaying(project.root)
    }

    /*for (const command of Command.allCommands)
    {
        if (!command.shortcut)
            continue

        if (command.isShortcutAvailable && !command.isShortcutAvailable())
            continue

        if (command.isAvailable && !command.isAvailable({}))
            continue

        for (const shortcut of command.shortcut)
        {
            if (!!shortcut.ctrl !== ev.ctrlKey)
                continue

            if (!!shortcut.shift !== ev.shiftKey)
                continue

            if (key !== shortcut.key)
                continue

            //console.log("handled keyboard command: ", command.name)
            command.func({})
            ev.preventDefault()
            ev.stopPropagation()
            return
        }
    }*/
}