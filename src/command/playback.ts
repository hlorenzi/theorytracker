import * as Command from "../command"
import * as Playback from "../playback"


export const togglePlayback: Command.Command =
{
    name: "Toggle Playback",
    shortcut: [{ key: " " }],
    func: async () =>
    {
        Playback.togglePlaying()
    }
}