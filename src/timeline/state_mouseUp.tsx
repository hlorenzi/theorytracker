import React from "react"
import * as Timeline from "./index"
import * as Project from "../project"
import * as Popup from "../popup"
import * as Windows from "../windows"
import Rect from "../util/rect"


export function mouseUp(data: Timeline.WorkData)
{
    if (!data.state.mouse.down)
        return

    data.state.mouse.down = false
    
    if (data.state.mouse.action == Timeline.MouseAction.DragTrackHeader)
    {
        handleTrackDragRelease(data)
    }
    else if (data.state.mouse.action == Timeline.MouseAction.Pencil)
    {
        for (let t = 0; t < data.state.tracks.length; t++)
            data.state.tracks[t].pencilComplete(data)
    }
    else if (data.state.mouse.action == Timeline.MouseAction.Pan)
    {
        handleContextMenu(data)
    }

    Timeline.selectionRemoveConflictingBehind(data)

    Project.global.project = Project.withRefreshedRange(Project.global.project)
    Project.global.project = Project.global.project
    Project.splitUndoPoint()
    Project.addUndoPoint("mouseUp")
}


function handleTrackDragRelease(data: Timeline.WorkData)
{
    if (data.state.drag.trackInsertionBefore < 0)
        return

    if (data.state.drag.trackInsertionBefore < data.state.tracks.length &&
        data.state.selection.has(data.state.tracks[data.state.drag.trackInsertionBefore].projectTrackId))
        return

    let project = Project.global.project

    const selectedProjectTracks: Project.Track[] = []
    for (const track of data.state.tracks)
    {
        if (data.state.selection.has(track.projectTrackId) &&
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
    if (data.state.drag.trackInsertionBefore < data.state.tracks.length)
    {
        const trackId = data.state.tracks[data.state.drag.trackInsertionBefore].projectTrackId
        beforeProjectTrackIndex = project.tracks.findIndex(tr => tr.id == trackId)
    }

    for (const track of selectedProjectTracks.reverse())
        project = Project.upsertTrack(project, track, false, beforeProjectTrackIndex)

    Project.global.project = project
    Project.global.project = project
}


function handleContextMenu(data: Timeline.WorkData)
{
    if (!data.state.hover)
        return

    if (!data.state.drag.xLocked || !data.state.drag.yLocked)
        return

    Timeline.selectionToggleHover(data, data.state.hover, false)

    if (data.state.hover)
    {
        const clickDurationMs = (new Date().getTime()) - data.state.mouse.downDate.getTime()

        const fnOpenProperties = () =>
        {
            data.dockable.ref.current.createFloatingEphemeral(
                Windows.Inspector,
                { elemIds: [...data.state.selection] },
                1, 1)

            data.dockable.commit()
        }

        if (clickDurationMs < 150)
        {
            fnOpenProperties()
        }
        else
        {
            data.popup.ref.current.elem = () =>
            {
                return <Popup.Root>
                    { makeContextMenu(data, fnOpenProperties) }
                </Popup.Root>
            }
            data.popup.ref.current.rect = new Rect(
                data.state.renderRect.x + data.state.mouse.point.pos.x + 2,
                data.state.renderRect.y + data.state.mouse.point.pos.y + 2,
                0, 0)
            data.popup.commit()
        }
    }
}


function makeContextMenu(data: Timeline.WorkData, fnOpenProperties: () => void): JSX.Element[]
{
    const menuItems: JSX.Element[] = []

    menuItems.push(<Popup.Button
        label="Properties"
        onClick={ fnOpenProperties }/>)

    menuItems.push(<Popup.Button
        label="Delete"
        onClick={ () =>
        {
            Timeline.deleteElems(data, data.state.selection)
            Timeline.sendEventRefresh()
            Project.splitUndoPoint()
            Project.addUndoPoint("menuDelete")
        }}/>)


    const hasElemType = (type: Project.Element["type"]) =>
    {
        for (const id of data.state.selection)
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
            
        menuItems.push(<Popup.Button
            label="Convert to Chords"
            onClick={ () =>
            {
                Timeline.convertNotesToChords(data, data.state.selection)
                Timeline.sendEventRefresh()
                Project.splitUndoPoint()
                Project.addUndoPoint("menuConvertNotesToChords")
            }}/>)
    }


    return menuItems
}