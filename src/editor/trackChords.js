import Project from "../project/project.js"
import Editor from "./editor.js"
import Track from "./track.js"
import Rational from "../util/rational.js"
import Range from "../util/range.js"
import Rect from "../util/rect.js"
import Theory from "../theory.js"
import CanvasUtils from "../util/canvas.js"


export default class TrackChords
{
	static init(state, trackIndex, action)
	{
		const newTrack =
		{
			...Track.init(state, action),
			kind: "chords",
		}
		
		return { ...state,
			tracks: [ ...state.tracks, newTrack ],
		}
	}
	
	
	static updateHover(state, trackIndex, input)
	{
		let hover = null
		let draw = null
		
		if (state.keys[Editor.keyDraw])
		{
			const keyCh = state.project.keyChanges.findActiveAt(input.mouse.time)
            const key = keyCh ? keyCh.key : Editor.defaultKey()
			draw =
			{
				kind: "chord",
				time1: input.mouse.time,
                time2: input.mouse.time.add(state.timeSnap.multiply(new Rational(4))),
                chord: new Theory.Chord(key.chromaForDegree(0), 0, 0, 0, [])
            }
		}
		else
		{
			const margin = 10
			const checkRange = Editor.timeRangeAtX(state, input.mouse.x - margin, input.mouse.x + margin)
			
			let hoverPrimary = null
			let hoverSecondary = null

			for (const chord of state.project.chords.iterAtRange(checkRange))
			{
				const margin = 2

                const x1 = Editor.xAtTime(state, chord.range.start)
                const x2 = Editor.xAtTime(state, chord.range.end)
				const rect = new Rect(x1 - margin, 0, x2 - x1 + margin * 2, state.tracks[trackIndex].rect.h)

				const dragMarginOut = Math.abs(Math.min(0, rect.w - 16))
				const stretchMarginOut = 16
				const stretchMarginIn = Math.max(0, Math.min(10, rect.w / 4))
				const rectDrag = new Rect(rect.x - dragMarginOut, rect.y, rect.w + dragMarginOut * 2, rect.h)
				const rectStretchStart = new Rect(rect.x - stretchMarginOut, rect.y, stretchMarginOut + stretchMarginIn, rect.h)
				const rectStretchEnd = new Rect(rect.x2 - stretchMarginIn, rect.y, stretchMarginOut + stretchMarginIn, rect.h)
				
				const exactHover = rect.contains(input.mouse)

				let action = 0
				if (dragMarginOut > 0 && rectDrag.contains(input.mouse))
					action = Editor.actionDragTime
				else if (rectStretchStart.contains(input.mouse))
					action = Editor.actionStretchTimeStart
				else if (rectStretchEnd.contains(input.mouse))
					action = Editor.actionStretchTimeEnd
				else if (exactHover)
					action = Editor.actionDragTime

				const hoverChord = 
				{
					id: chord.id,
					range: chord.range,
					action,
				}

				if (action != 0)
				{
					if (exactHover)
						hoverPrimary = hoverChord
					else
						hoverSecondary = hoverChord
				}

				if (hoverPrimary)
					break
			}

			hover = hoverPrimary || hoverSecondary
		}
		
		return Track.update(state, trackIndex, { hover, draw })
	}


	static hoveredPlaySoundPreview(state, trackIndex)
	{
		const hover = state.tracks[trackIndex].hover
		if (!hover)
			return state
		
		const id = hover.id
		const chord = state.project.chords.findById(id)

		if (!chord)
			return state
		
		return Editor.soundPreviewSet(state, TrackChords.mergeSoundPreview(null, chord.chord))
	}
	
	
	static selectionAddAtCursor(state, trackIndex)
	{
		const timeRange = new Range(state.cursor.time1, state.cursor.time2, false, false).sorted()
		
		for (const chord of state.project.chords.iterAtRange(timeRange))
			state = Track.selectionAdd(state, trackIndex, chord.id)
		
		return state
	}
	
	
	static selectionAddAtRect(state, trackIndex)
	{
		const timeRange = new Range(state.rectSelection.time1, state.rectSelection.time2, false, false).sorted()
		
		for (const chord of state.project.chords.iterAtRange(timeRange))
			state = Track.selectionAdd(state, trackIndex, chord.id)
		
		return state
	}


	static selectionRemoveConflictingBehind(state, trackIndex)
	{
		const selection = state.tracks[trackIndex].selection

		for (const id of selection)
		{
			const elem = state.project.findById(id)
			if (!elem)
				continue

			for (const chord of state.project.chords.iterAtRange(elem.range))
			{
				if (selection.has(chord.id))
					continue
				
				state = { ...state, project: state.project.removeById(chord.id) }
				
				for (const slice of chord.range.iterSlices(elem.range))
				{
					const newChord = new Project.Chord(slice, chord.chord)
					state = { ...state, project: state.project.upsertChord(newChord) }
				}
			}
		}

		return state
	}
	
	
	static clipboardPaste(state, trackIndex, pasteData)
	{
		for (const [clipboardId, elem] of state.clipboard.elems)
		{
			if (elem instanceof Project.Chord)
			{
				const range = elem.range.displace(pasteData.time.subtract(state.clipboard.range.start))
				const chord = new Project.Chord(range, elem.chord)
				const id = state.project.nextId
				state = { ...state, project: state.project.upsertChord(chord) }
				state = Track.selectionAdd(state, trackIndex, id)
			}
		}
		
		return state
	}
	
	
	static previousAnchor(state, trackIndex, time)
	{
		return state.project.chords.findPreviousAnchor(time)
	}
	
	
	static deleteRange(state, trackIndex, range)
	{
		for (const chord of state.project.chords.iterAtRange(range))
		{
			state = { ...state, project: state.project.removeById(chord.id) }
			
			for (const slice of chord.range.iterSlices(range))
			{
				const newChord = new Project.Chord(slice, chord.chord)
				state = { ...state, project: state.project.upsertChord(newChord) }
			}
		}
		
		return state
	}
	
	
	static drag(state, trackIndex)
	{
		for (const id of state.tracks[trackIndex].selection)
		{
			const elem = state.tracks[trackIndex].dragData.elems.get(id)
			if (!elem)
				continue
			
			let changes = {}
			
			if (state.mouse.action & Editor.actionDragTime)
				changes.range = elem.range.displace(state.mouse.drag.timeDelta)
			
			if (state.mouse.action & Editor.actionStretchTimeStart)
			{
				changes.range = elem.range.stretch(state.mouse.drag.timeDelta, state.mouse.dragOrig.range.end, state.mouse.dragOrig.range.start)
				if (elem.range.start.compare(state.mouse.dragOrig.range.start) == 0)
					changes.range = new Range(changes.range.start.snap(state.timeSnap), changes.range.end)
					
				changes.range = changes.range.sorted()
			}

			if (state.mouse.action & Editor.actionStretchTimeEnd)
			{
				changes.range = elem.range.stretch(state.mouse.drag.timeDelta, state.mouse.dragOrig.range.start, state.mouse.dragOrig.range.end)
				if (elem.range.end.compare(state.mouse.dragOrig.range.end) == 0)
					changes.range = new Range(changes.range.start, changes.range.end.snap(state.timeSnap))

				changes.range = changes.range.sorted()
			}
			
			state = { ...state, project: state.project.update(elem.withChanges(changes)) }
		}
		
		return state
	}
	
	
	static drawMove(state, trackIndex, input)
	{
		let draw = state.tracks[trackIndex].draw
		
		if (draw)
		{
			let time2 = input.mouse.time
			if (Math.abs(Editor.xAtTime(state, draw.time1) - Editor.xAtTime(state, time2)) < 5)
				time2 = draw.time1.add(state.timeSnap.multiply(new Rational(4)))
			
			draw = { ...draw, time2 }
		}
		
		return Track.update(state, trackIndex, { draw })
	}
	
	
	static drawEnd(state, trackIndex, input)
	{
		const draw = state.tracks[trackIndex].draw
		if (draw)
		{
			if (draw.kind == "chord")
			{
				const chord = new Project.Chord(new Range(draw.time1, draw.time2).sorted(), draw.chord)
				const id = state.project.nextId
				state = { ...state, project: state.project.upsertChord(chord) }
				state = Track.selectionAdd(state, trackIndex, id)
				state = Editor.soundPreviewSet(state, TrackChords.mergeSoundPreview(null, draw.chord))
			}
		}
		
		return state
	}
	
	
	static keyCommandTimeShift(state, trackIndex, commandData)
	{
		for (const id of state.tracks[trackIndex].selection)
		{
			const elem = state.project.findById(id)
			if (!elem)
				continue
			
			let changes = {}
			changes.range = elem.range.displace(commandData.timeDelta)
			
			state = { ...state, project: state.project.update(elem.withChanges(changes)) }
		}
		
		return state
	}
	
	
	static keyCommandPitchShift(state, trackIndex, commandData)
	{
		let soundPreview = null

		for (const id of state.tracks[trackIndex].selection)
		{
			const elem = state.project.findById(id)
			if (!elem)
				continue
			
			let changes = {}
			if (commandData.diatonic)
			{
				const keyCh = state.project.keyChanges.findActiveAt(elem.range.start)
				const key = keyCh ? keyCh.key : Editor.defaultKey()
				const degree = key.octavedDegreeForMidi(elem.chord.rootMidi)
				const newDegree = degree + commandData.degreeDelta
				const newRoot = key.midiForDegree(commandData.degreeDelta >= 0 ? Math.floor(newDegree) : Math.ceil(newDegree))
				changes.chord = elem.chord.withChanges({ rootMidi: newRoot })
			}
			else
                changes.chord = elem.chord.withChanges({ rootMidi: elem.chord.rootMidi + commandData.pitchDelta })
			
			soundPreview = TrackChords.mergeSoundPreview(soundPreview, changes.chord)
			state = { ...state, project: state.project.update(elem.withChanges(changes)) }
		}
		
		state = Editor.soundPreviewSet(state, soundPreview)
		return state
	}


	static mergeSoundPreview(soundPreview, chord)
	{
		return { kind: "chord", chord }
	}
	
	
	static *iterKeyChangesAtRange(state, trackIndex, range)
	{
		const defaultKey = Editor.defaultKey()
		
		for (const pair of state.project.keyChanges.iterActiveAtRangePairwise(range))
		{
			const keyCh1 = pair[0] || new Project.KeyChange(range.start, defaultKey)
			const keyCh2 = pair[1] || new Project.KeyChange(range.end,   defaultKey)
			
			const keyCh1X = Editor.xAtTime(state, keyCh1.time)
			const keyCh2X = Editor.xAtTime(state, keyCh2.time)
			
			yield [keyCh1, keyCh1X, keyCh2X]
		}
	}
	
	
	static *iterChordsAndKeyChangesAtRange(state, trackIndex, range)
	{
		const defaultKey = Editor.defaultKey()
		
		for (const pair of state.project.keyChanges.iterActiveAtRangePairwise(range))
		{
			const keyCh1 = pair[0] || new Project.KeyChange(range.start, defaultKey)
			const keyCh2 = pair[1] || new Project.KeyChange(range.end,   defaultKey)
			
			const keyCh1X = Editor.xAtTime(state, keyCh1.time)
			const keyCh2X = Editor.xAtTime(state, keyCh2.time)
			
			const time1 = keyCh1.time.max(range.start)
			const time2 = keyCh2.time.min(range.end)
			
			for (const chord of state.project.chords.iterAtRange(new Range(time1, time2)))
				yield [chord, keyCh1, keyCh1X, keyCh2X]
		}
	}
	
	
	static render(state, trackIndex, ctx)
	{
		const track = state.tracks[trackIndex]
		const visibleTimeRange = Editor.visibleTimeRange(state)

		for (const [chord, keyCh, xMin, xMax] of TrackChords.iterChordsAndKeyChangesAtRange(state, trackIndex, visibleTimeRange))
		{
			if (!state.playback.playing && track.selection.has(chord.id))
				continue

			const hovering = track.hover && track.hover.id == chord.id
			const playing = state.playback.playing && chord.range.overlapsPoint(state.playback.time)
			TrackChords.renderChord(state, trackIndex, ctx, chord.range, keyCh.key, chord.chord, xMin, xMax, hovering, false, playing)
		}
		
		if (!state.playback.playing)
		{
			for (const [chord, keyCh, xMin, xMax] of TrackChords.iterChordsAndKeyChangesAtRange(state, trackIndex, visibleTimeRange))
			{
				if (!track.selection.has(chord.id))
					continue

				const hovering = track.hover && track.hover.id == chord.id
				TrackChords.renderChord(state, trackIndex, ctx, chord.range, keyCh.key, chord.chord, xMin, xMax, hovering, true, false)
			}
		}

		const draw = state.tracks[trackIndex].draw
		if (draw)
		{
			ctx.globalAlpha = 0.6
			
			const keyCh = state.project.keyChanges.findActiveAt(draw.time1)
			const key = keyCh ? keyCh.key : Editor.defaultKey()
			TrackChords.renderChord(state, trackIndex, ctx, new Range(draw.time1, draw.time2).sorted(), key, draw.chord, -Infinity, Infinity, false, false)
			
			ctx.globalAlpha = 1
		}
	}
	
	
	static renderChord(state, trackIndex, ctx, range, key, chord, xMin, xMax, hovering, selected, playing)
	{
        const h = state.tracks[trackIndex].rect.h
        const chordX1 = Editor.xAtTime(state, range.start)
        const chordX2 = Editor.xAtTime(state, range.end)

        let x1 = Math.max(xMin, Math.min(xMax, chordX1))
        let x2 = Math.max(xMin, Math.min(xMax, chordX2))

        if (x1 == chordX1)
            x1 += 1

        if (x2 == chordX2)
            x2 -= 1

        CanvasUtils.drawChord(ctx, x1, 0, x2, h, chord, key)
        
		if (hovering)
		{
			ctx.globalAlpha = 0.4
			ctx.fillStyle = "#fff"
            ctx.fillRect(x1, 0, x2 - x1, h)
			ctx.globalAlpha = 1
		}
		
		if (selected || playing)
		{
			const margin = 3
			ctx.globalAlpha = 0.6
			ctx.fillStyle = "#fff"
            ctx.fillRect(x1, margin, x2 - x1, h - margin * 2)
			ctx.globalAlpha = 1
		}
	}
}