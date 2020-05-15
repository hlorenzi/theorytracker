import { ContentStateManager } from "../App"
import EditorState from "./editorState"
import Track from "./track"
import TrackState from "./trackState"
import TrackStateManager from "./trackStateManager"
import TrackKeyChanges from "./trackKeyChanges"
import TrackMeterChanges from "./trackMeterChanges"
import Project from "../project/project2"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"
import * as Theory from "../theory/theory"


export default class Editor
{
	static actionPan              = 0x01
	static actionSelectCursor     = 0x02
	static actionSelectRect       = 0x04
	static actionDraw             = 0x08
	static actionDragTime         = 0x10
	static actionDragPitchRow     = 0x20
	static actionStretchTimeStart = 0x40
	static actionStretchTimeEnd   = 0x80


	static reduce(state: ContentStateManager<EditorState>, action: any)
	{
		const shouldLog = (
			action.type !== "playbackStep" &&
			action.type !== "mouseMove" &&
			action.type !== "keyDown" &&
			action.type !== "keyUp" &&
			action.type !== "keyCommand"
		)
		
		if (shouldLog)
		{
            console.log("Editor.oldState", state.appState)
			console.log("Editor.action", action)
		}
		
		const reducer =
			(Editor as any)["reduce_" + action.type] as
			(state: ContentStateManager<EditorState>, action: any) => void
		
		if (reducer)
		{
			reducer(state, action)
			
			if (shouldLog)
			{
				console.log("Editor.newState", state.appState)
                console.log("")
			}
		}
		else
		{
			console.error("unhandled Editor.action", action)
            console.log("")
        }
    }


    static reduce_init(state: ContentStateManager<EditorState>, action: any)
    {
        state.contentState = {
            w: 0,
			h: 0,

			trackHeaderW: 120,
			
			tracks: [],

			timeScroll: 0,
			timeScale: 100,
			timeSnap: new Rational(1, 16),
			timeSnapBase: new Rational(1, 16),

			mouse:
			{
				down: false,
				downDate: new Date(),

				action: 0,

				pos: { x: 0, y: 0 },
				posPrev: { x: 0, y: 0 },
				time: new Rational(0),
				track: 0,
				trackY: 0,
				row: 0,

				hover: null,

				drag: {
					xLocked: true,
					yLocked: true,

					posOrigin: { x: 0, y: 0 },
					timeOrigin: new Rational(0),
					timeScrollOrigin: 0,
					rangeOrigin: new Range(new Rational(), new Rational()),
					trackOrigin: 0,
					trackYOrigin: 0,
					rowOrigin: 0,
					projectOrigin: Project.getDefault(),

					posDelta: { x: 0, y: 0 },
					timeDelta: new Rational(0),
					trackYDelta: 0,
					rowDelta: 0,
				},

				wheelDate: new Date(),
			},
        }
    }


    static reduce_resize(state: ContentStateManager<EditorState>, action: any)
    {
        state.mergeContentState({
            w: action.w,
            h: action.h,
        })
	}
	

	static reduce_tracksRefresh(state: ContentStateManager<EditorState>, action: any)
    {
		const tracks: TrackState[] = []

		for (let t = 0; t < state.appState.project.tracks.length; t++)
		{
			if (state.appState.project.tracks[t].trackType == Project.TrackType.Notes)
				tracks.push({
					type: "notesPreview",
					trackIndex: t,
					trackId: state.appState.project.tracks[t].id,
					h: 280,
					yScroll: 0,
					pinned: false,
				})
			else if (state.appState.project.tracks[t].trackType == Project.TrackType.KeyChanges)
				tracks.push({
					type: "keyChanges",
					trackIndex: t,
					trackId: state.appState.project.tracks[t].id,
					h: TrackKeyChanges.knobHeight,
					yScroll: 0,
					pinned: false,
				})
			else if (state.appState.project.tracks[t].trackType == Project.TrackType.MeterChanges)
				tracks.push({
					type: "meterChanges",
					trackIndex: t,
					trackId: state.appState.project.tracks[t].id,
					h: TrackMeterChanges.knobHeight,
					yScroll: 0,
					pinned: false,
				})
		}

		state.mergeContentState({ tracks })
		
		for (let t = 0; t < state.contentState.tracks.length; t++)
			Track.execute("init", state, t)
	}
	
	
	static reduce_mouseMove(state: ContentStateManager<EditorState>, action: any)
	{
		const track = !state.contentState.mouse.down ?
			Editor.trackAtY(state, state.contentState.mouse.pos.y) :
			state.contentState.mouse.drag.trackOrigin

		const trackY = state.contentState.mouse.pos.y - Editor.trackY(state, track)
		const row = Track.execute("rowAtY", state, track, trackY)

		state.mergeContentState({
			mouse: {
				...state.contentState.mouse,
				pos: action.pos,
				posPrev: state.contentState.mouse.pos,
				time: Editor.timeAtX(state, action.pos.x),
				track,
				trackY,
				row,
			}
		})
		
		if (!state.contentState.mouse.down)
		{
			state.mergeContentState({
				mouse: {
					...state.contentState.mouse,
					hover: null,
				}
			})

			for (let t = 0; t < state.contentState.tracks.length; t++)
			{
				const rect = Editor.rectForTrack(state, t)!

				if (rect.contains(state.contentState.mouse.pos))
				{
					const input = { mouse: { pos: { ...state.contentState.mouse.pos } } }
					input.mouse.pos.x -= rect.x
					input.mouse.pos.y -= rect.y
					
					Track.execute("updateHover", state, t, input)
				}
				else
					Track.execute("update", state, t)
			}
		}
		else
		{
			const posDelta = {
				x: state.contentState.mouse.pos.x - state.contentState.mouse.drag.posOrigin.x,
				y: state.contentState.mouse.pos.y - state.contentState.mouse.drag.posOrigin.y,
			}

			const timeDelta =
				state.contentState.mouse.time.subtract(state.contentState.mouse.drag.timeOrigin)

			const trackYDelta = state.contentState.mouse.trackY - state.contentState.mouse.drag.trackYOrigin

			const rowDelta = state.contentState.mouse.row - state.contentState.mouse.drag.rowOrigin

			const xLocked = state.contentState.mouse.drag.xLocked && Math.abs(posDelta.x) < state.appState.prefs.editor.mouseDragXLockedDistance
			const yLocked = state.contentState.mouse.drag.yLocked && Math.abs(posDelta.y) < state.appState.prefs.editor.mouseDragYLockedDistance
			
			state.mergeContentState({
				mouse: {
					...state.contentState.mouse,
					drag: {
						...state.contentState.mouse.drag,
						xLocked,
						yLocked,
						posDelta,
						timeDelta,
						trackYDelta,
						rowDelta,
					},
				},
			})
			
			if (state.contentState.mouse.action == Editor.actionPan)
			{
				state.mergeContentState({
					timeScroll: state.contentState.mouse.drag.timeScrollOrigin - state.contentState.mouse.drag.posDelta.x / state.contentState.timeScale,
				})
			}
			else
			{
				Editor.drag(state)
			}
		}
	}


	static drag(state: ContentStateManager<EditorState>)
	{
		let mouseActionBlocked = 0
		if (state.contentState.mouse.drag.xLocked)
			mouseActionBlocked |= Editor.actionDragTime | Editor.actionStretchTimeEnd | Editor.actionStretchTimeStart

		if (state.contentState.mouse.drag.yLocked)
			mouseActionBlocked |= Editor.actionDragPitchRow

		const mouseAction = state.contentState.mouse.action & ~mouseActionBlocked
		const mouseDrag = state.contentState.mouse.drag

		for (const id of state.appState.selection)
		{
			const elem = mouseDrag.projectOrigin.elems.get(id)
			if (!elem)
				continue
			
			let changes: any = {}

			if (elem.type == Project.ElementType.Note)
			{
				const rangedElem = elem as any as Project.RangedElement

				if (mouseAction & Editor.actionDragTime)
					changes.range = rangedElem.range.displace(mouseDrag.timeDelta)
				
				if (mouseAction & Editor.actionStretchTimeStart)
				{
					changes.range = rangedElem.range.stretch(mouseDrag.timeDelta, mouseDrag.rangeOrigin.end, mouseDrag.rangeOrigin.start)
					if (rangedElem.range.start.compare(mouseDrag.rangeOrigin.start) == 0)
						changes.range = new Range(changes.range.start.snap(state.contentState.timeSnap), changes.range.end)
						
					changes.range = changes.range.sorted()
				}
	
				if (mouseAction & Editor.actionStretchTimeEnd)
				{
					changes.range = rangedElem.range.stretch(mouseDrag.timeDelta, mouseDrag.rangeOrigin.start, mouseDrag.rangeOrigin.end)
					if (rangedElem.range.end.compare(mouseDrag.rangeOrigin.end) == 0)
						changes.range = new Range(changes.range.start, changes.range.end.snap(state.contentState.timeSnap))
	
					changes.range = changes.range.sorted()
				}
			
				if (mouseAction & Editor.actionDragPitchRow)
				{
					const note = rangedElem as Project.Note
					const keyChangeTrackId = Project.keyChangeTrackForTrack(state.appState.project, 0)
					const keyChangeTrackTimedElems = state.appState.project.timedLists.get(keyChangeTrackId)!

					const keyCh = keyChangeTrackTimedElems.findActiveAt(rangedElem.range.start) as Project.KeyChange
					const key = keyCh ? keyCh.key : Editor.defaultKey()
					const degree = key.octavedDegreeForMidi(note.pitch)
					const newPitch = key.midiForDegree(Math.floor(degree + mouseDrag.rowDelta))
					changes.pitch = newPitch
				}
				
				const newRangedElem = Project.RangedElement.withChanges(rangedElem, changes)
					
				state.mergeAppState({
					project: Project.upsertRangedElement(state.appState.project, newRangedElem)
				})
			}

			else if (elem.type == Project.ElementType.KeyChange ||
				elem.type == Project.ElementType.MeterChange)
			{
				const timedElem = elem as any as Project.TimedElement

				if (mouseAction & Editor.actionDragTime)
					changes.time = timedElem.time.add(mouseDrag.timeDelta).snap(state.contentState.timeSnap)
				
				if (mouseAction & Editor.actionStretchTimeStart)
				{
					changes.time = timedElem.time.stretch(mouseDrag.timeDelta, mouseDrag.rangeOrigin.end, mouseDrag.rangeOrigin.start)
					if (timedElem.time.compare(mouseDrag.rangeOrigin.start) == 0)
						changes.time = changes.time.snap(state.contentState.timeSnap)
				}
	
				if (mouseAction & Editor.actionStretchTimeEnd)
				{
					changes.time = timedElem.time.stretch(mouseDrag.timeDelta, mouseDrag.rangeOrigin.start, mouseDrag.rangeOrigin.end)
					if (timedElem.time.compare(mouseDrag.rangeOrigin.start) == 0)
						changes.time = changes.time.snap(state.contentState.timeSnap)
				}
				
				const newTimedElem = Project.TimedElement.withChanges(timedElem, changes)
					
				state.mergeAppState({
					project: Project.upsertTimedElement(state.appState.project, newTimedElem)
				})
			}
		}
	}
	
	
	static reduce_mouseDown(state: ContentStateManager<EditorState>, action: any)
	{
		if (state.contentState.mouse.down)
			return

		const now = new Date()
		const timeSinceLastDown = now.getTime() - state.contentState.mouse.downDate.getTime()

		state.mergeContentState({
			mouse: {
				...state.contentState.mouse,
				down: true,
				downDate: now,
				drag: {
					...state.contentState.mouse.drag,
					xLocked: true,
					yLocked: true,
					posOrigin: state.contentState.mouse.pos,
					timeOrigin: state.contentState.mouse.time,
					timeScrollOrigin: state.contentState.timeScroll,
					trackOrigin: state.contentState.mouse.track,
					trackYOrigin: state.contentState.mouse.trackY,
					rowOrigin: state.contentState.mouse.row,
					projectOrigin: state.appState.project,
				},
				action: 0,
			}
		})
		
		if (action.rightButton)// || state.keys[Editor.keyPan])
		{
			state.mergeContentState({
				mouse: {
					...state.contentState.mouse,
					action: Editor.actionPan
				}
			})
		}
		else
		{
			if (state.contentState.mouse.hover)
			{
				if (!action.ctrlKey &&
					!state.appState.selection.has(state.contentState.mouse.hover.id))
					Editor.selectionClear(state)

				Editor.selectionAdd(state, state.contentState.mouse.hover.id)

				state.mergeContentState({
					mouse: {
						...state.contentState.mouse,
						drag: {
							...state.contentState.mouse.drag,
							rangeOrigin: Editor.selectionRange(state)!,
						},
						action: state.contentState.mouse.hover.action,
					}
				})
			}
			else
			{
				if (!action.ctrlKey)
					Editor.selectionClear(state)
			}
		}
	}
	
	
	static reduce_mouseUp(state: ContentStateManager<EditorState>, action: any)
	{
		if (!state.contentState.mouse.down)
			return state

		state.mergeContentState({
			mouse: {
				...state.contentState.mouse,
				down: false,
				action: 0,
			}
		})
	}
	
	
	static reduce_mouseWheel(state: ContentStateManager<EditorState>, action: any)
	{
		if (Math.abs(action.deltaX) > 0)
		{
			let timeScroll = state.contentState.timeScroll + 0.01 / (state.contentState.timeScale / 100) * action.deltaX
			let wheelDate = new Date()

			state.mergeContentState({
				timeScroll,
				mouse: {
					...state.contentState.mouse,
					wheelDate
				}
			})
		}
		else if (new Date().getTime() - state.contentState.mouse.wheelDate.getTime() > 250)
		{
			const snap = new Rational(1, 1024)
			const prevMouseTime = Editor.timeAtX(state, state.contentState.mouse.pos.x - state.contentState.trackHeaderW, snap)
			
			let timeScale = state.contentState.timeScale * (action.deltaY > 0 ? 0.8 : 1.25)
			timeScale = Math.max(4, Math.min(2048, timeScale))
			state.mergeContentState({ timeScale })
			
			const newMouseTime = Editor.timeAtX(state, state.contentState.mouse.pos.x - state.contentState.trackHeaderW, snap)
			
			const timeScroll = state.contentState.timeScroll - newMouseTime.subtract(prevMouseTime).asFloat()
			
			const timeSnapAdjustThresholdUpper = 24
			const timeSnapAdjustThresholdLower = 8
			let timeSnap = state.contentState.timeSnapBase
			
			if (timeSnap.asFloat() * timeScale > timeSnapAdjustThresholdUpper)
				while (timeSnap.asFloat() * timeScale > timeSnapAdjustThresholdUpper)
					timeSnap = timeSnap.divide(new Rational(2))
				
			else if (timeSnap.asFloat() * timeScale < timeSnapAdjustThresholdLower)
				while (timeSnap.asFloat() * timeScale < timeSnapAdjustThresholdLower)
					timeSnap = timeSnap.divide(new Rational(1, 2))
				
			state.mergeContentState({ timeScroll, timeSnap })
		}
	}


	static selectionAdd(state: ContentStateManager<EditorState>, id: number)
	{
		state.mergeAppState({
			selection: state.appState.selection.add(id),
		})
	}


	static selectionRemove(state: ContentStateManager<EditorState>, id: number)
	{
		state.mergeAppState({
			selection: state.appState.selection.remove(id),
		})
	}


	static selectionClear(state: ContentStateManager<EditorState>)
	{
		state.mergeAppState({
			selection: state.appState.selection.clear(),
		})
	}


	static selectionRange(state: ContentStateManager<EditorState>): Range | null
	{
		let range = null

		for (const id of state.appState.selection)
		{
			const elem = state.appState.project.elems.get(id) as any
			if (!elem)
				continue

			if (elem.range)
			{
				const rangedElem = elem as Project.RangedElement
				range = Range.merge(range, rangedElem.range)
			}

			else if (elem.time)
			{
				const timedElem = elem as Project.TimedElement
				range = Range.merge(range, Range.fromPoint(timedElem.time))
			}
		}

		return range
	}


	static xAtTime(state: ContentStateManager<EditorState>, time: Rational): number
	{
		return (time.asFloat() - state.contentState.timeScroll) * state.contentState.timeScale
	}
	
	
	static timeAtX(state: ContentStateManager<EditorState>, x: number, timeSnap?: Rational): Rational
	{
		timeSnap = timeSnap || state.contentState.timeSnap
		const time = x / state.contentState.timeScale + state.contentState.timeScroll
		return Rational.fromFloat(time, timeSnap.denominator)
	}
	
	
	static timeRangeAtX(state: ContentStateManager<EditorState>, x1: number, x2: number, timeSnap?: Rational)
	{
		timeSnap = timeSnap || state.contentState.timeSnap
		return new Range(
			Editor.timeAtX(state, x1, timeSnap).subtract(timeSnap),
			Editor.timeAtX(state, x2, timeSnap).add(timeSnap))
	}


	static trackY(state: ContentStateManager<EditorState>, trackIndex: number): number
	{
		let yTrack = 0
		for (let t = 0; t < state.contentState.tracks.length; t++)
		{
			if (t == trackIndex)
				return yTrack

			yTrack += state.contentState.tracks[t].h
		}

		return state.contentState.h
	}


	static trackAtY(state: ContentStateManager<EditorState>, y: number): number
	{
		let yTrack = 0
		for (let t = 0; t < state.contentState.tracks.length; t++)
		{
			yTrack += state.contentState.tracks[t].h

			if (y <= yTrack)
				return t
		}

		return state.contentState.tracks.length - 1
	}


	static rectForTrack(state: ContentStateManager<EditorState>, trackIndex: number): Rect | null
	{
		let y = 0
		for (let t = 0; t < state.contentState.tracks.length; t++)
		{
			const h = state.contentState.tracks[t].h

			if (t == trackIndex)
			{
				return new Rect(
					state.contentState.trackHeaderW,
					y,
					state.contentState.w - state.contentState.trackHeaderW,
					h)
			}

			y += h
		}

		return null
	}
	
	
	static visibleTimeRange(state: ContentStateManager<EditorState>): Range
	{
		return new Range(
			Editor.timeAtX(state, 0).subtract(state.contentState.timeSnap),
			Editor.timeAtX(state, state.contentState.w).add(state.contentState.timeSnap))
	}


	static defaultKey(): Theory.Key
	{
		return Theory.Key.parse("C Major")
	}


	static defaultMeter(): Theory.Meter
	{
		return new Theory.Meter(4, 4)
	}
	
	
	static render(state: ContentStateManager<EditorState>, ctx: CanvasRenderingContext2D)
	{
		ctx.save()
		
		ctx.fillStyle = state.appState.prefs.editor.bkgColor
		ctx.fillRect(0, 0, state.contentState.w, state.contentState.h)

		Editor.renderBackgroundMeasures(state, ctx)
		
		let y = 0
		for (let t = 0; t < state.contentState.tracks.length; t++)
		{
			ctx.save()
			ctx.translate(state.contentState.trackHeaderW, y)

			ctx.beginPath()
			ctx.rect(
				0,
				1,
				state.contentState.w - state.contentState.trackHeaderW,
				state.contentState.tracks[t].h - 1)
			ctx.clip()

			Track.execute("render", state, t, ctx)

			ctx.restore()

			y += state.contentState.tracks[t].h
			
			ctx.strokeStyle = state.appState.prefs.editor.trackHBorderColor
			ctx.beginPath()
			ctx.moveTo(0, y + 0.5)
			ctx.lineTo(state.contentState.w, y + 0.5)
			ctx.stroke()
		}
        
		ctx.strokeStyle = state.appState.prefs.editor.trackVBorderColor
		ctx.beginPath()
		ctx.moveTo(state.contentState.trackHeaderW + 0.5, 0)
		ctx.lineTo(state.contentState.trackHeaderW + 0.5, state.contentState.h)
		ctx.stroke()

        ctx.restore()
    }
	
	
	static renderBackgroundMeasures(state: ContentStateManager<EditorState>, ctx: CanvasRenderingContext2D)
	{
		const visibleRange = Editor.visibleTimeRange(state)
		
		/*ctx.fillStyle = "#1b191c"
		
		const songXMin = Editor.xAtTime(state, state.project.range.start)
		const songXMax = Editor.xAtTime(state, state.project.range.end)
		
		if (songXMin > 0)
			ctx.fillRect(0, 0, songXMin, state.h)

		if (songXMax < state.w)
			ctx.fillRect(songXMax, 0, state.w - songXMax, state.h)*/

		const meterChangeTrackId = Project.meterChangeTrackForTrack(state.appState.project, 0)
		const meterChangeList = state.appState.project.timedLists.get(meterChangeTrackId)!

		ctx.save()
		ctx.translate(state.contentState.trackHeaderW, 0)

		ctx.beginPath()
		ctx.rect(
			0,
			0,
			state.contentState.w - state.contentState.trackHeaderW,
			state.contentState.h)
		ctx.clip()

		for (let [meterCh1Raw, meterCh2Raw] of meterChangeList.iterActiveAtRangePairwise(visibleRange))
		{
			let timeMin = (meterCh1Raw ? meterCh1Raw.time : visibleRange.start)
			let timeMax = (meterCh2Raw ? meterCh2Raw.time : visibleRange.end)

			let measureAlternate = true

			let meterCh1 = meterCh1Raw as (Project.MeterChange | null)
			let meterCh2 = meterCh1Raw as (Project.MeterChange | null)

			if (!meterCh1)
			{
				if (!meterCh2)
					continue
				
				meterCh1 = meterCh2
				timeMin = meterCh2.time
				while (timeMin.compare(visibleRange.start) > 0)
				{
					timeMin = timeMin.subtract(meterCh2.meter.fullCycleDuration)

					if (meterCh2.meter.alternatingMeasureCount % 2 != 0)
						measureAlternate = !measureAlternate
				}
			}
			
			const meterCh1X = 0.5 + Math.floor(Editor.xAtTime(state, timeMin))
			const meterCh2X = 0.5 + Math.floor(Editor.xAtTime(state, timeMax))

			ctx.strokeStyle = state.appState.prefs.editor.meterChangeColor
			ctx.lineCap = "square"
			ctx.lineWidth = 1
			
			for (const [measureN, measureD, time1, time2] of meterCh1.meter.iterMeasuresPairwise(timeMin))
			{
				measureAlternate = !measureAlternate

				if (time2.compare(visibleRange.start) < 0)
					continue

				if (time1.compare(timeMax) > 0 || time1.compare(visibleRange.end) > 0)
					break

				const measureX1 = 0.5 + Math.floor(Editor.xAtTime(state, time1))
				const measureX2 = 0.5 + Math.floor(Editor.xAtTime(state, time2))

				if (measureAlternate)
				{
					const x1 = Math.min(meterCh2X, measureX1)
					const x2 = Math.min(meterCh2X, measureX2)
					
					ctx.fillStyle = state.appState.prefs.editor.measureAlternateBkgColor
					ctx.fillRect(x1, 0, x2 - x1, state.contentState.h)
				}

				if (time1.compare(meterCh1.time) == 0)
					ctx.strokeStyle = state.appState.prefs.editor.meterChangeColor
				else
					ctx.strokeStyle = state.appState.prefs.editor.measureColor

				ctx.beginPath()
				ctx.moveTo(measureX1, 0)
				ctx.lineTo(measureX1, state.contentState.h)
				ctx.stroke()

				const halfSubmeasureSize = Editor.xAtTime(state, new Rational(1, measureD * 2)) - Editor.xAtTime(state, new Rational(0))
				if (halfSubmeasureSize > 16)
				{
					let halfSubmeasureTime = time1.add(new Rational(-1, measureD * 2))
					for (let sub = 1; sub <= measureN; sub++)
					{
						halfSubmeasureTime = halfSubmeasureTime.add(new Rational(2, measureD * 2))
						
						const halfSubmeasureX = 0.5 + Math.floor(Editor.xAtTime(state, halfSubmeasureTime))
						if (halfSubmeasureX >= meterCh1X && halfSubmeasureX <= meterCh2X)
						{
							ctx.strokeStyle = state.appState.prefs.editor.halfSubmeasureColor
							ctx.beginPath()
							ctx.moveTo(halfSubmeasureX, 0)
							ctx.lineTo(halfSubmeasureX, state.contentState.h)
							ctx.stroke()
						}
					}
				}
				
				const submeasureSize = Editor.xAtTime(state, new Rational(1, measureD)) - Editor.xAtTime(state, new Rational(0))
				if (submeasureSize > 8)
				{
					let submeasureTime = time1
					for (let sub = 1; sub <= measureN; sub++)
					{
						submeasureTime = submeasureTime.add(new Rational(1, measureD))
						
						const submeasureX = 0.5 + Math.floor(Editor.xAtTime(state, submeasureTime))
						if (submeasureX >= meterCh1X && submeasureX <= meterCh2X)
						{
							ctx.strokeStyle = state.appState.prefs.editor.submeasureColor
							ctx.beginPath()
							ctx.moveTo(submeasureX, 0)
							ctx.lineTo(submeasureX, state.contentState.h)
							ctx.stroke()
						}
					}
				}
			}
		}
		
		const keyChangeTrackId = Project.keyChangeTrackForTrack(state.appState.project, 0)
		const keyChangeList = state.appState.project.timedLists.get(keyChangeTrackId)!

		for (const keyCh of keyChangeList.iterAtRange(visibleRange))
		{
			const keyChX = 0.5 + Math.floor(Editor.xAtTime(state, keyCh.time))
			
			ctx.strokeStyle = state.appState.prefs.editor.keyChangeColor
			ctx.lineCap = "square"
			ctx.lineWidth = 1
			
			ctx.beginPath()
			ctx.moveTo(keyChX, 0)
			ctx.lineTo(keyChX, state.contentState.h)
			ctx.stroke()
		}

		ctx.restore()
	}
}