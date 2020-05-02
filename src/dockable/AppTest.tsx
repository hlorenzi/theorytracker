import React from "react"
import DockableRoot from "./DockableRoot"
import DockableData, { DockingMode, Root } from "./DockableData"


export default function AppTest(props: {})
{
    const [root, setRoot] = React.useState(() =>
    {
        let root = DockableData.makeRoot()
        console.log(root)
        
        root = DockableData.addPanel(root, 0, DockingMode.Full, 0)
        console.log(root)
        
        root = DockableData.addPanel(root, 0, DockingMode.Bottom, 2)
        console.log(root)
        
        root = DockableData.addPanel(root, 2, DockingMode.Right, 1)
        console.log(root)
        
        root = DockableData.addPanel(root, 1, DockingMode.Right, 3)
        console.log(root)

        root = DockableData.addPanel(root, 6, DockingMode.Bottom, 4)
        console.log(root)

        return root
    })

    let setRoot2 = (newRoot: Root) =>
    {
        console.log(newRoot)
        setRoot(newRoot)
    }
    
    return <DockableRoot root={ root } setRoot={ setRoot2 }/>
}