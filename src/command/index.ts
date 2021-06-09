export * from "./command"
export * from "./file"


import * as File from "./file"


export const allCommands =
[
    File.newProject,
    File.openFile,
    File.saveProject,
    File.saveProjectAs,
    File.openFileBrowser,
    File.downloadProjectBrowser,
    File.previewProjectBrowser,
]