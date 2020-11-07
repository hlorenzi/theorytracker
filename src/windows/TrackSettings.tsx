import React from "react"
import * as Dockable from "../dockable"
import * as Project from "../project"
import * as UI from "../ui"
import { useRefState } from "../util/refState"
import styled from "styled-components"


export function TrackSettings()
{
    const window = Dockable.useWindow()
    const project = Project.useProject()

    const trackId: Project.ID = window.data.trackId
    const elem = project.ref.current.elems.get(trackId)
    if (!elem)
        return null

    const track = elem as Project.Track

    const onRename = (newName: string) =>
    {
        const newTrack = {
            ...track,
            name: newName,
        }

        project.ref.current = Project.upsertTrack(project.ref.current, newTrack)
        project.commit()
    }


    return <div style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
        padding: "0.5em",

        display: "grid",
        gridTemplate: "auto 1fr / 1fr",
        justifyContent: "start",
        justifyItems: "start",
    }}>
        <div>
            Name:
            <UI.Input
                value={ track.name }
                onChange={ onRename }
            />
        </div>
    </div>
}