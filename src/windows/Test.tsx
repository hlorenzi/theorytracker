import React from "react"
import * as Dockable from "../dockable"
import * as Project from "../project"


export function Test()
{
    const count = Dockable.useWindowRefState(() => 0)

    const increment = () =>
    {
        count.ref.current++
        count.commit()
    }

    return <div style={{ padding: "0.5em"}}>
        Count: { count.ref.current }
        <br/>
        <button onClick={ increment }>Increment</button>
        <br/>
        <br/>
        Project elem count: { Project.global.project.elems.size }
    </div>
}