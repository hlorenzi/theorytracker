export * from "./command"
export * from "./file"
export * from "./history"
export * from "./playback"
export * from "./convertNotesToChords"


import * as File from "./file"
import * as History from "./history"
import * as Playback from "./playback"
import { convertNotesToChords } from "./convertNotesToChords"


export const allCommands =
[
    File.newProject,
    File.openFile,
    File.saveProject,
    File.saveProjectAs,
    File.openFileBrowser,
    File.downloadProjectBrowser,
    File.previewProjectBrowser,

    History.undo,
    History.redo,

    Playback.togglePlayback,

    convertNotesToChords,
]