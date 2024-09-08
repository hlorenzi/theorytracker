import React from "react"
import { useRefState } from "../util/refState"
import * as Project from "../project"


export function Test()
{
    const count = useRefState(() => 0)

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