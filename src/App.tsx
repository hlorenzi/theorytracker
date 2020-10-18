import React, { useRef } from "react"
import * as Dockable from "./dockable"
import * as Project from "./project"
import * as Prefs from "./prefs"
import { useRefState } from "./util/refState"
import EditorWindow from "./windows/EditorWindow"
import WindowTest from "./windows/WindowTest"


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
    const prefsCtx = useRefState(() => Prefs.getDefault())

    return <>
        <Project.ProjectContext.Provider value={ projectCtx }>
        <Prefs.PrefsContext.Provider value={ prefsCtx }>
            <Dockable.Container
                state={ dockableState }
                setState={ (state: Dockable.State) => setDockableState(state) }
                contentIdToComponent={ contentIdToComponent }
            />
        </Prefs.PrefsContext.Provider>
        </Project.ProjectContext.Provider>
    </>
}