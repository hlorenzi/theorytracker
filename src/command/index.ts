export * from "./command"
export * from "./file"
export * from "./convertNotesToChords"


import * as File from "./file"
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

    convertNotesToChords,
]