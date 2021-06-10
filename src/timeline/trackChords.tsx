import React from "react"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Popup from "../popup"
import * as Playback from "../playback"
import * as Timeline from "./index"
import * as Theory from "../theory"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"
import * as CanvasUtils from "../util/canvasUtils"
import { TimelineTrack } from "./track"


export class TimelineTrackChords extends TimelineTrack
{
    pencil: null |
    {
        time1: Rational
        time2: Rational
    }


    constructor(projectTrackId: Project.ID, name: string, h: number)
    {
        super()
        this.projectTrackId = this.parentId = projectTrackId
        this.name = name
        this.renderRect = new Rect(0, 0, 0, h)
        this.acceptedElemTypes.add("chord")
        this.pencil = null
    }


    *iterChordsAtRange(
        state: Timeline.State,
        range: Range)
        : Generator<Project.Chord, void, void>
    {
        const trackElems = Project.global.project.lists.get(this.projectTrackId)
        if (!trackElems)
            return

        for (const elem of trackElems.iterAtRange(range))
            yield elem as Project.Chord
    }


    *iterChordsAndKeyChangesAtRange(
        state: Timeline.State,
        range: Range)
        : Generator<[Project.Chord, Project.KeyChange, number, number], void, void>
    {
        for (const [keyCh1, keyCh2, keyCh1X, keyCh2X] of this.iterKeyChangePairsAtRange(state, range))
        {
            const time1 = keyCh1.range.start.max(range.start)!
            const time2 = keyCh2.range.start.min(range.end)!
            
            for (const chord of this.iterChordsAtRange(state, new Range(time1, time2)))
                yield [chord, keyCh1, keyCh1X, keyCh2X]
        }
    }


    *elemsAtRegion(
        state: Timeline.State,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        for (const elem of this.iterChordsAtRange(state, range))
            yield elem.id
    }
	
	
	hover(state: Timeline.State)
	{
        this.hoverBlockElements(state, (range) => this.iterChordsAtRange(state, range))
    }


    click(state: Timeline.State, elemId: Project.ID)
    {
        const chord = Project.getElem(Project.global.project, elemId, "chord")
        if (chord)
        {
            state.insertion.duration = chord.range.duration
            Playback.playChordPreview(this.projectTrackId, chord.chord, 0, 1)
        }
    }


    pencilClear(state: Timeline.State)
    {
        this.pencil = null
    }


    pencilHover(state: Timeline.State)
    {
        const time = state.mouse.point.time

        this.pencil =
        {
            time1: time,
            time2: time.add(state.timeSnap.multiply(new Rational(4))),
        }
    }


    pencilDrag(state: Timeline.State)
    {
		if (this.pencil)
		{
            this.pencil.time2 = state.mouse.point.time
            
            const time1X = Timeline.xAtTime(state, this.pencil.time1)
            const time2X = Timeline.xAtTime(state, this.pencil.time2)
			if (Math.abs(time1X - time2X) < 5)
                this.pencil.time2 = this.pencil.time1.add(state.timeSnap.multiply(new Rational(4)))
        }
    }
	
	
	pencilComplete(state: Timeline.State)
	{
		if (this.pencil)
		{
            const key = Project.keyAt(Project.global.project, this.projectTrackId, this.pencil.time1)

            const elem = Project.makeChord(
                this.projectTrackId,
                new Range(this.pencil.time1, this.pencil.time2).sorted(),
                new Theory.Chord(key.tonic.chroma, 0, 0, []))

            let project = Project.global.project
            const id = project.nextId
            Project.global.project = Project.upsertElement(project, elem)
            Timeline.selectionAdd(state, id)
		}
	}


    render(state: Timeline.State, canvas: CanvasRenderingContext2D)
    {
        const visibleRange = Timeline.visibleTimeRange(state)

        for (let layer = 0; layer < 2; layer++)
        {
            for (const [chord, keyCh, xMin, xMax] of this.iterChordsAndKeyChangesAtRange(state, visibleRange))
            {
                const selected = state.selection.contains(chord.id)
                if (!Playback.global.playing && (layer == 0) == selected)
                    continue

                if (chord.type != "chord")
                    continue

                const key = keyCh.key
                const hovering = !!state.hover && state.hover.id == chord.id
                const playing = Playback.global.playing && chord.range.overlapsPoint(Playback.global.playTime)
                
                this.renderChord(
                    state, canvas, chord.range,
                    xMin, xMax,
                    chord.chord, key,
                    hovering, selected, playing)
            }
        }

        if (this.pencil)
        {
            canvas.save()
            canvas.globalAlpha = 0.4

            const key = Project.keyAt(Project.global.project, this.projectTrackId, this.pencil.time1)

            const range = new Range(this.pencil.time1, this.pencil.time2).sorted()
            this.renderChord(
                state, canvas, range, -Infinity, Infinity,
                new Theory.Chord(key.tonic.chroma, 0, 0, []),
                key,
                false, false, false)
            
            canvas.restore()
        }
    }


    renderChord(
        state: Timeline.State,
        canvas: CanvasRenderingContext2D,
        range: Range,
        xMin: number,
        xMax: number,
        chord: Theory.Chord,
        key: Theory.Key,
        hovering: boolean,
        selected: boolean,
        playing: boolean)
    {
        const x1 = Math.floor(Math.max(xMin, Math.min(xMax,
            Timeline.xAtTime(state, range.start)))) + 0.5
        const x2 = Math.floor(Math.max(xMin, Math.min(xMax,
            Timeline.xAtTime(state, range.end)))) + 0.5 - 1

        const y1 = 1.5
        const y2 = this.renderRect.h - 0.5

		canvas.fillStyle = (selected || playing) ? "#222" : "#000"
        canvas.fillRect(x1, y1, x2 - x1, y2 - y1)

        CanvasUtils.renderChord(
            canvas,
            x1, y1, x2, y2,
            chord, key)
            
        canvas.strokeStyle = (selected || playing) ? "#fff" : hovering ? "#888" : "#444"
        canvas.strokeRect(x1, y1, x2 - x1, y2 - y1)
    }
}