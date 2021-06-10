import React from "react"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Theory from "../theory"
import * as Playback from "../playback"
import * as Timeline from "./index"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"
import * as CanvasUtils from "../util/canvasUtils"


export class TimelineTrackNoteVolumes extends Timeline.TimelineTrack
{
    minValue: number
    maxValue: number

    pencil: null |
    {
        time1: Rational
        time2: Rational
        midiPitch: number
    }


    constructor(projectTrackId: Project.ID, noteBlockId: Project.ID, h: number)
    {
        super()
        this.projectTrackId = projectTrackId
        this.parentId = noteBlockId
        this.name = "Note Volume"
        this.renderRect = new Rect(0, 0, 0, h)
        this.pencil = null
        this.noCursor = true
        this.minValue = Project.MinVolumeDb
        this.maxValue = Project.MaxVolumeDb
    }


    parentStart(state: Timeline.State)
    {
        const noteBlock = Project.global.project.elems.get(this.parentId)
        return noteBlock?.range?.start ?? new Rational(0)
    }


    parentRange(state: Timeline.State)
    {
        const noteBlock = Project.global.project.elems.get(this.parentId)
        return noteBlock?.range ?? new Range(new Rational(0), new Rational(0))
    }


    *iterNotesAtRange(
        state: Timeline.State,
        range: Range)
        : Generator<Project.Note, void, void>
    {
        const list = Project.global.project.lists.get(this.parentId)
        if (!list)
            return

        for (const elem of list.iterAtRange(range.displace(this.parentStart(state).negate())))
            yield elem as Project.Note
    }


    valueAtY(state: Timeline.State, y: number)
    {
        const f = Math.max(0, Math.min(1, 1 - (y / this.renderRect.h)))
        return this.minValue + f * (this.maxValue - this.minValue)
    }


    yAtValue(state: Timeline.State, value: number)
    {
        const f = (value - this.minValue) / (this.maxValue - this.minValue)
        return (1 - f) * this.renderRect.h
    }


    pencilDrag(state: Timeline.State)
    {
        const visibleRange = Timeline.visibleTimeRange(state)
        const parentStart = this.parentStart(state)
        const x1 = state.mouse.pointPrev.pos.x
        const x2 = state.mouse.point.pos.x
        const xMin = Math.min(x1, x2)
        const xMax = Math.max(x1, x2)

        let newProject = Project.global.project

        for (const note of this.iterNotesAtRange(state, visibleRange))
        {
            const selected = state.selection.contains(note.id)
            const active = state.selection.size == 0 || selected
            if (!active)
                continue

            const markerX = Timeline.xAtTime(state, note.range.start.add(parentStart))
            if (markerX >= xMin && markerX <= xMax)
            {
                const volumeDb = this.valueAtY(state, state.mouse.point.originTrackPos.y)
                const newNote = Project.elemModify(note, { volumeDb })
            
                newProject = Project.upsertElement(newProject, newNote)
                
                Playback.playNotePreview(
                    Project.parentTrackFor(Project.global.project, newNote.parentId).id,
                    newNote.midiPitch,
                    newNote.volumeDb,
                    newNote.velocity)
            }
        }

        Project.global.project = newProject
    }


    render(state: Timeline.State, canvas: CanvasRenderingContext2D)
    {
        const visibleRange = Timeline.visibleTimeRange(state)
        const parentRange = this.parentRange(state)
        const parentStart = parentRange.start

        const visibleX1 = Timeline.xAtTime(state, visibleRange.start)
        const visibleX2 = Timeline.xAtTime(state, visibleRange.end)
        const parentX1 = Timeline.xAtTime(state, parentRange.start)
        const parentX2 = Timeline.xAtTime(state, parentRange.end)

        canvas.fillStyle = "#0004"
        canvas.fillRect(visibleX1, 0, parentX1 - visibleX1, this.renderRect.h)
        canvas.fillRect(parentX2, 0, visibleX2 - parentX2, this.renderRect.h)
    
        for (let layer = 0; layer < 2; layer++)
        {
            for (const note of this.iterNotesAtRange(state, visibleRange))
            {
                const selected = state.selection.contains(note.id)
                const active = state.selection.size == 0 || selected
                if ((layer == 0) == active)
                    continue

                this.renderMarkerStick(
                    state, canvas, parentStart, note.range, note.volumeDb, active)
            }
        }
    }
	
	
	renderMarkerStick(
        state: Timeline.State,
        canvas: CanvasRenderingContext2D,
        parentStart: Rational,
        range: Range,
        value: number,
        active: boolean)
	{
        const x = Math.floor(Timeline.xAtTime(state, range.start.add(parentStart))) + 0.5
        const y = this.yAtValue(state, value)
        const arcRadius = 4
        
        canvas.lineWidth = 2
        canvas.strokeStyle = active ?
            Prefs.global.editor.noteVelocityMarkerColor :
            Prefs.global.editor.noteVelocityMarkerInactiveColor
		
        canvas.beginPath()
        canvas.moveTo(x, this.renderRect.h)
        canvas.lineTo(x, y + arcRadius)
        canvas.arc(x, y, arcRadius, Math.PI * 0.5, Math.PI * 2.5)
        canvas.stroke()
	}
}