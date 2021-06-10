import React from "react"
import * as Timeline from "./index"
import * as Project from "../project"
import * as Command from "../command"
import * as Dockable from "../dockable"
import * as Popup from "../popup"
import * as Windows from "../windows"
import Rect from "../util/rect"


export function mouseUp(state: Timeline.State)
{
    if (!state.mouse.down)
        return

    state.mouse.down = false
    
    if (state.mouse.action == Timeline.MouseAction.DragTrackHeader)
    {
        handleTrackDragRelease(state)
    }
    else if (state.mouse.action == Timeline.MouseAction.Pencil)
    {
        for (let t = 0; t < state.tracks.length; t++)
            state.tracks[t].pencilComplete(state)
    }
    else if (state.mouse.action == Timeline.MouseAction.Pan)
    {
        handleContextMenu(state)
    }

    Timeline.selectionRemoveConflictingBehind(state)

    Project.global.project = Project.withRefreshedRange(Project.global.project)
    Project.global.project = Project.global.project
    Project.splitUndoPoint()
    Project.addUndoPoint("mouseUp")
}


function handleTrackDragRelease(state: Timeline.State)
{
    if (state.drag.trackInsertionBefore < 0)
        return

    if (state.drag.trackInsertionBefore < state.tracks.length &&
        state.selection.has(state.tracks[state.drag.trackInsertionBefore].projectTrackId))
        return

    let project = Project.global.project

    const selectedProjectTracks: Project.Track[] = []
    for (const track of state.tracks)
    {
        if (state.selection.has(track.projectTrackId) &&
            !selectedProjectTracks.find(tr => tr.id == track.projectTrackId))
        {
            const projTrack = project.tracks.find(tr => tr.id == track.projectTrackId)
            if (projTrack)
                selectedProjectTracks.push(projTrack)
        }
    }

    for (const track of selectedProjectTracks)
        project = Project.upsertTrack(project, track, true)

    let beforeProjectTrackIndex = project.tracks.length
    if (state.drag.trackInsertionBefore < state.tracks.length)
    {
        const trackId = state.tracks[state.drag.trackInsertionBefore].projectTrackId
        beforeProjectTrackIndex = project.tracks.findIndex(tr => tr.id == trackId)
    }

    for (const track of selectedProjectTracks.reverse())
        project = Project.upsertTrack(project, track, false, beforeProjectTrackIndex)

    Project.global.project = project
    Project.global.project = project
}


function handleContextMenu(state: Timeline.State)
{
    if (!state.hover)
        return

    if (!state.drag.xLocked || !state.drag.yLocked)
        return

    Timeline.selectionToggleHover(state, state.hover, false)

    if (state.hover)
    {
        const clickDurationMs = (new Date().getTime()) - state.mouse.downDate.getTime()

        const fnOpenProperties = () =>
        {
            Dockable.createFloatingEphemeral(
                Windows.Inspector,
                { elemIds: [...state.selection] },
                1, 1)
        }

        if (clickDurationMs < 150)
        {
            fnOpenProperties()
        }
        else
        {
            Popup.showAtMouse(() =>
            {
                return <Popup.Root>
                    { makeContextMenu(state, fnOpenProperties) }
                </Popup.Root>
            })
        }
    }
}


function makeContextMenu(state: Timeline.State, fnOpenProperties: () => void): JSX.Element[]
{
    const menuItems: JSX.Element[] = []

    menuItems.push(<Popup.Button
        label="Properties"
        onClick={ fnOpenProperties }/>)

    menuItems.push(<Popup.Button
        label="Delete"
        onClick={ () =>
        {
            Timeline.deleteElems(state, state.selection)
            Timeline.sendEventRefresh()
            Project.splitUndoPoint()
            Project.addUndoPoint("menuDelete")
        }}/>)


    const hasElemType = (type: Project.Element["type"]) =>
    {
        for (const id of state.selection)
        {
            const elem = Project.global.project.elems.get(id)
            if (elem && elem.type === type)
                return true
        }

        return false
    }


    if (hasElemType("note") || hasElemType("noteBlock"))
    {
        menuItems.push(<Popup.Divider/>)
        menuItems.push(<Popup.Button command={ Command.convertNotesToChords }/>)
    }


    return menuItems
}