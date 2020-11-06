import React, { useRef } from "react"
import * as Dockable from "./dockable"
import * as Project from "./project"
import * as Playback from "./playback"
import * as Prefs from "./prefs"
import * as Popup from "./popup"
import * as Menubar from "./menubar"
import { useRefState } from "./util/refState"
import EditorWindow from "./windows/EditorWindow"
import WindowTest from "./windows/WindowTest"
import PlaybackToolbar from "./PlaybackToolbar"
import MenuFile from "./MenuFile"


export default function App()
{
    const [dockableState, setDockableState] = React.useState(() =>
    {
        let root = Dockable.makeRoot()
        root = Dockable.addPanel(root, 1, Dockable.DockMode.Full, 1)
        root = Dockable.addPanel(root, 1, Dockable.DockMode.Full, 2)
        root = Dockable.addPanel(root, 1, Dockable.DockMode.Full, 3)
        root = Dockable.addPanel(root, 1, Dockable.DockMode.Full, 4)

        return root
    })

    const contentIdToComponent = (id: Dockable.WindowId) =>
    {
        return EditorWindow
    }

    const projectCtx = useRefState(() => Project.Root.getDefault())
    const playbackCtx = Playback.usePlaybackInit(projectCtx)
    const prefsCtx = useRefState(() => Prefs.getDefault())
    const popupCtx = useRefState(() => Popup.getDefaultCtx())

    return <>
        <Project.ProjectContext.Provider value={ projectCtx }>
        <Playback.PlaybackContext.Provider value={ playbackCtx }>
        <Prefs.PrefsContext.Provider value={ prefsCtx }>
        <Popup.PopupContext.Provider value={ popupCtx }>
            <div style={{
                display: "grid",
                gridTemplate: "auto 1fr / 1fr",
                width: "100vw",
                height: "100vh",
            }}>

                <Menubar.Root>
                    <MenuFile/>
                    <Menubar.Item label="Edit">
                        <Popup.Root>
                        </Popup.Root>
                    </Menubar.Item>
                    <Menubar.Item label="View">
                        <Popup.Root>
                        </Popup.Root>
                    </Menubar.Item>

                    <PlaybackToolbar/>
                </Menubar.Root>

                <Dockable.Container
                    state={ dockableState }
                    setState={ (state: Dockable.State) => setDockableState(state) }
                    contentIdToComponent={ contentIdToComponent }
                />

            </div>

            { !popupCtx.ref.current.elem ? null :
                <popupCtx.ref.current.elem/>
            }
        </Popup.PopupContext.Provider>
        </Prefs.PrefsContext.Provider>
        </Playback.PlaybackContext.Provider>
        </Project.ProjectContext.Provider>
    </>
}