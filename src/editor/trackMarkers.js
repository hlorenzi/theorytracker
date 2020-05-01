import Project from "../project/project.js"
import Editor from "./editor.js"
import Track from "./track.js"
import Rational from "../util/rational.js"
import Range from "../util/range.js"
import Rect from "../util/rect.js"
import Theory from "../theory.ts"


const markerWidth = 22
const keyMarkerY = 0
const keyMarkerHeight = 22
const meterMarkerY = 22
const meterMarkerHeight = 22


export default class TrackMarkers
{
	static init(state, trackIndex, action)
	{
		const newTrack =
		{
			...Track.init(state, action),
			kind: "markers",
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
			if (input.mouse.y >= meterMarkerY && input.mouse.y <= meterMarkerY + meterMarkerHeight)
				draw = { kind: "meter", time: input.mouse.time }
			
			if (input.mouse.y >= keyMarkerY && input.mouse.y <= keyMarkerY + keyMarkerHeight)
				draw = { kind: "key", time: input.mouse.time }
		}
		else
		{
			const checkRange = Editor.timeRangeAtX(state, input.mouse.x - markerWidth, input.mouse.x + markerWidth)
			
			for (const keyCh of state.project.keyChanges.iterAtRange(checkRange))
			{
				const rect = TrackMarkers.knobRectForKeyChange(state, keyCh.time)
				if (rect.contains(input.mouse))
				{
					hover =
					{
						id: keyCh.id,
						range: Range.fromPoint(keyCh.time),
						action: Editor.actionDragTime,
					}
				}
			}
			
			for (const meterCh of state.project.meterChanges.iterAtRange(checkRange))
			{
				const rect = TrackMarkers.knobRectForMeterChange(state, meterCh.time)
				if (rect.contains(input.mouse))
				{
					hover =
					{
						id: meterCh.id,
						range: Range.fromPoint(meterCh.time),
						action: Editor.actionDragTime,
					}
				}
			}
		}
		
		return Track.update(state, trackIndex, { hover, draw })
	}
	
	
	static selectionAddAtCursor(state, trackIndex)
	{
		const timeRange = new Range(state.cursor.time1, state.cursor.time2, false, false).sorted()
		
		for (const keyCh of state.project.keyChanges.iterAtRange(timeRange))
			state = Track.selectionAdd(state, trackIndex, keyCh.id)
		
		for (const meterCh of state.project.meterChanges.iterAtRange(timeRange))
			state = Track.selectionAdd(state, trackIndex, meterCh.id)
		
		return state
	}
	
	
	static selectionAddAtRect(state, trackIndex)
	{
		const timeRange = new Range(state.rectSelection.time1, state.rectSelection.time2, false, false).sorted()
		const y1 = Math.min(state.rectSelection.y1, state.rectSelection.y2)
		const y2 = Math.max(state.rectSelection.y1, state.rectSelection.y2)
		
		if (y2 > keyMarkerY && y1 < keyMarkerY + keyMarkerHeight)
			for (const keyCh of state.project.keyChanges.iterAtRange(timeRange))
				state = Track.selectionAdd(state, trackIndex, keyCh.id)
		
		if (y2 > meterMarkerY && y1 < meterMarkerY + meterMarkerHeight)
			for (const meterCh of state.project.meterChanges.iterAtRange(timeRange))
				state = Track.selectionAdd(state, trackIndex, meterCh.id)
		
		return state
	}


	static selectionRemoveConflictingBehind(state, trackIndex)
	{
		const selection = state.tracks[trackIndex].selection

		for (const id of selection)
		{
			const elem = state.project.findById(id)

			if (elem instanceof Project.KeyChange)
			{
				for (const keyCh of state.project.keyChanges.iterAt(elem.time))
				{
					if (selection.has(keyCh.id))
						continue
					
					state = { ...state, project: state.project.removeById(keyCh.id) }
				}
			}
			
			if (elem instanceof Project.MeterChange)
			{
				for (const meterCh of state.project.meterChanges.iterAt(elem.time))
				{
					if (selection.has(meterCh.id))
						continue
					
					state = { ...state, project: state.project.removeById(meterCh.id) }
				}
			}
		}

		return state
	}
	
	
	static clipboardPaste(state, trackIndex, pasteData)
	{
		for (const [clipboardId, elem] of state.clipboard.elems)
		{
			if (elem instanceof Project.KeyChange)
			{
				const time = elem.time.add(pasteData.time.subtract(state.clipboard.range.start))
				const keyCh = new Project.KeyChange(time, elem.key)
				const id = state.project.nextId
				state = { ...state, project: state.project.upsertKeyChange(keyCh) }
				state = Track.selectionAdd(state, trackIndex, id)
			}
			
			if (elem instanceof Project.MeterChange)
			{
				const time = elem.time.add(pasteData.time.subtract(state.clipboard.range.start))
				const meterCh = new Project.MeterChange(time, elem.meter)
				const id = state.project.nextId
				state = { ...state, project: state.project.upsertMeterChange(meterCh) }
				state = Track.selectionAdd(state, trackIndex, id)
			}
		}
		
		return state
	}
	
	
	static previousAnchor(state, trackIndex, time)
	{
		const prevAnchorKey = state.project.keyChanges.findPreviousDeletionAnchor(time)
		const prevAnchorMeter = state.project.meterChanges.findPreviousDeletionAnchor(time)
		
		return Rational.max(prevAnchorKey, prevAnchorMeter)
	}
	
	
	static deleteRange(state, trackIndex, range)
	{
		if (range.start.compare(range.end) == 0)
		{
			for (const keyCh of state.project.keyChanges.iterAt(range.start))
				state = { ...state, project: state.project.removeById(keyCh.id) }
			
			for (const meterCh of state.project.meterChanges.iterAt(range.start))
				state = { ...state, project: state.project.removeById(meterCh.id) }
		}
		else
		{
			for (const keyCh of state.project.keyChanges.iterAtRange(range))
				state = { ...state, project: state.project.removeById(keyCh.id) }
			
			for (const meterCh of state.project.meterChanges.iterAtRange(range))
				state = { ...state, project: state.project.removeById(meterCh.id) }
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
				changes.time = elem.time.add(state.mouse.drag.timeDelta).snap(state.timeSnap)
			
			if (state.mouse.action & Editor.actionStretchTimeStart)
			{
				changes.time = elem.time.stretch(state.mouse.drag.timeDelta, state.mouse.dragOrig.range.end, state.mouse.dragOrig.range.start)
				if (elem.time.compare(state.mouse.dragOrig.range.start) == 0)
					changes.time = changes.time.snap(state.timeSnap)
			}

			if (state.mouse.action & Editor.actionStretchTimeEnd)
			{
				changes.time = elem.time.stretch(state.mouse.drag.timeDelta, state.mouse.dragOrig.range.start, state.mouse.dragOrig.range.end)
				if (elem.time.compare(state.mouse.dragOrig.range.start) == 0)
					changes.time = changes.time.snap(state.timeSnap)
			}
	
			state = { ...state, project: state.project.update(elem.withChanges(changes)) }
		}
		
		return state
	}
	
	
	static drawMove(state, trackIndex, input)
	{
		let draw = state.tracks[trackIndex].draw
		
		if (draw)
			draw = { ...draw, time: input.mouse.time }
		
		return Track.update(state, trackIndex, { draw })
	}
	
	
	static drawEnd(state, trackIndex, input)
	{
		const draw = state.tracks[trackIndex].draw
		if (draw)
		{
			const id = state.project.nextId

			if (draw.kind == "key")
				state = { ...state, project: state.project.upsertKeyChange(new Project.KeyChange(draw.time, Editor.defaultKey())) }
			
			else if (draw.kind == "meter")
				state = { ...state, project: state.project.upsertMeterChange(new Project.MeterChange(draw.time, Editor.defaultMeter())) }
				
			state = Track.selectionAdd(state, trackIndex, id)
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
			changes.time = elem.time.add(commandData.timeDelta)
			
			state = { ...state, project: state.project.update(elem.withChanges(changes)) }
		}
		
		return state
	}
	
	
	static keyCommandPitchShift(state, trackIndex, commandData)
	{
		for (const id of state.tracks[trackIndex].selection)
		{
			const elem = state.project.findById(id)
			if (!elem)
				continue

			if (!(elem instanceof Project.KeyChange))
				continue
			
			let changes = {}
			if (commandData.diatonic)
			{
				const key = elem.key
				const newRootMidi = key.midiForDegree(0) + commandData.degreeDelta
				changes.key = new Theory.Key(key.nameForMidi(newRootMidi).simplified, key.scale)
				/*const key = elem.key
				const newRoot = new Theory.PitchName(key.tonic.letter + commandData.degreeDelta, key.tonic.accidental)
				changes.key = new Theory.Key(newRoot, key.scale)*/
			}
			else
			{
				const key = elem.key
				const newRootMidi = key.midiForDegree(0) + commandData.pitchDelta
				changes.key = new Theory.Key(key.nameForMidi(newRootMidi).simplified, key.scale)
			}
			
			state = { ...state, project: state.project.update(elem.withChanges(changes)) }
		}
		
		return state
	}
	
	
	static knobRectForMeterChange(state, time)
	{
		const x = (time.asFloat() - state.timeScroll) * state.timeScale
		
		return new Rect(x - markerWidth / 2, meterMarkerY, markerWidth, meterMarkerHeight)
	}
	
	
	static knobRectForKeyChange(state, time)
	{
		const x = (time.asFloat() - state.timeScroll) * state.timeScale
		
		return new Rect(x - markerWidth / 2, keyMarkerY, markerWidth, keyMarkerHeight)
	}
	
	
	static render(state, trackIndex, ctx)
	{
		const visibleTimeRange = Editor.visibleTimeRange(state)
		
		for (const keyCh of state.project.keyChanges.iterAtRange(visibleTimeRange))
			TrackMarkers.renderKeyChange(state, trackIndex, ctx, keyCh)
		
		for (const meterCh of state.project.meterChanges.iterAtRange(visibleTimeRange))
			TrackMarkers.renderMeterChange(state, trackIndex, ctx, meterCh)
		
		if (state.tracks[trackIndex].draw)
		{
			ctx.globalAlpha = 0.6
			
			if (state.tracks[trackIndex].draw.kind == "key")
				TrackMarkers.renderKeyChangeKnob(state, trackIndex, ctx, state.tracks[trackIndex].draw.time)
			
			else if (state.tracks[trackIndex].draw.kind == "meter")
				TrackMarkers.renderMeterChangeKnob(state, trackIndex, ctx, state.tracks[trackIndex].draw.time)
			
			ctx.globalAlpha = 1
		}
	}
	
	
	static renderMeterChangeKnob(state, trackIndex, ctx, time)
	{
		const rect = TrackMarkers.knobRectForMeterChange(state, time)
		
		ctx.fillStyle = state.prefs.meterChangeColor
		
		ctx.beginPath()
		ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
		ctx.fill()
	}
	
	
	static renderMeterChange(state, trackIndex, ctx, meterCh)
	{
		const rect = TrackMarkers.knobRectForMeterChange(state, meterCh.time)
		
		ctx.fillStyle = state.prefs.meterChangeColor
		
		ctx.beginPath()
		ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
		ctx.fill()
		
		ctx.font = "14px Verdana"
		ctx.textAlign = "left"
		ctx.textBaseline = "middle"
		ctx.fillText(
			meterCh.meter.numerator.toString() + " / " + meterCh.meter.denominator.toString(),
			rect.x + rect.w + 5,
			rect.y + rect.h / 2)
		
		if (state.tracks[trackIndex].selection.has(meterCh.id))
		{
			ctx.globalAlpha = 0.75
			ctx.fillStyle = "#fff"
			
			ctx.beginPath()
			ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2 - 3, 0, Math.PI * 2)
			ctx.fill()
			
			ctx.globalAlpha = 1
		}
		
		const hover = state.tracks[trackIndex].hover
		if (hover && hover.id === meterCh.id)
		{
			ctx.globalAlpha = 0.5
			ctx.fillStyle = "#fff"
			
			ctx.beginPath()
			ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
			ctx.fill()
			
			ctx.globalAlpha = 1
		}
	}
	
	
	static renderKeyChangeKnob(state, trackIndex, ctx, time)
	{
		const rect = TrackMarkers.knobRectForKeyChange(state, time)
		
		ctx.fillStyle = state.prefs.keyChangeColor
		
		ctx.beginPath()
		ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
		ctx.fill()
	}
	
	
	static renderKeyChange(state, trackIndex, ctx, keyCh)
	{
		const rect = TrackMarkers.knobRectForKeyChange(state, keyCh.time)
		
		ctx.fillStyle = state.prefs.keyChangeColor
		
		ctx.beginPath()
		ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
		ctx.fill()
		
		ctx.font = "14px Verdana"
		ctx.textAlign = "left"
		ctx.textBaseline = "middle"
		ctx.fillText(keyCh.key.str, rect.x + rect.w + 5, rect.y + rect.h / 2)
		
		if (state.tracks[trackIndex].selection.has(keyCh.id))
		{
			ctx.globalAlpha = 0.75
			ctx.fillStyle = "#fff"
			
			ctx.beginPath()
			ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2 - 3, 0, Math.PI * 2)
			ctx.fill()
			
			ctx.globalAlpha = 1
		}
		
		const hover = state.tracks[trackIndex].hover
		if (hover && hover.id === keyCh.id)
		{
			ctx.globalAlpha = 0.5
			ctx.fillStyle = "#fff"
			
			ctx.beginPath()
			ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
			ctx.fill()
			
			ctx.globalAlpha = 1
		}
	}
}