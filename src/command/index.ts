export * from "./command"
export * from "./file"


import * as File from "./file"


export const allCommands =
[
    File.commandNewProject,
    File.openFile,
    File.saveProject,
    File.saveProjectAs,
    File.openFileBrowser,
    File.downloadProjectBrowser,
    File.previewProjectBrowser,
    //File.downloadMidiBrowser,

    //History.undo,
    //History.redo,

    //Playback.togglePlayback,

    //convertNotesToChords,
]