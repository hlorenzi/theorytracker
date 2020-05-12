import { ContentStateManager } from "../App"
import EditorState from "./editorState"
import Track from "./track"
import TrackState from "./trackState"
import TrackStateManager from "./trackStateManager"
import Rational from "../util/rational"
import Range from "../util/range"
import Rect from "../util/rect"


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

			mouse:
			{
				down: false,
				downDate: new Date(),
				downOrig: {
					pos: { x: 0, y: 0 },
					time: new Rational(0),
					timeScroll: 0,
				},

				action: 0,

				pos: { x: 0, y: 0 },
				posPrev: { x: 0, y: 0 },
				time: new Rational(0),

				hover: null,

				drag: {
					posDelta: { x: 0, y: 0 },
					timeDelta: new Rational(0),
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
			tracks.push({
				type: "notesPreview",
				trackIndex: t,
				trackId: state.appState.project.tracks[t].id,
				h: 80,
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
		state.mergeContentState({
			mouse: {
				...state.contentState.mouse,
				pos: action.pos,
				posPrev: state.contentState.mouse.pos,
				time: Editor.timeAtX(state, action.pos.x),
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
			const dragPosDelta = {
				x: state.contentState.mouse.pos.x - state.contentState.mouse.downOrig.pos.x,
				y: state.contentState.mouse.pos.y - state.contentState.mouse.downOrig.pos.y,
			}

			const dragTimeDelta =
				state.contentState.mouse.time.subtract(state.contentState.mouse.downOrig.time)

			state.mergeContentState({
				mouse: {
					...state.contentState.mouse,
					drag: {
						posDelta: dragPosDelta,
						timeDelta: dragTimeDelta,
					},
				},
			})
			
			if (state.contentState.mouse.action == Editor.actionPan)
			{
				state.mergeContentState({
					timeScroll: state.contentState.mouse.downOrig.timeScroll - state.contentState.mouse.drag.posDelta.x / state.contentState.timeScale,
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
				downOrig: {
					pos: state.contentState.mouse.pos,
					time: state.contentState.mouse.time,
					timeScroll: state.contentState.timeScroll,
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
			Editor.selectionClear(state)

			if (state.contentState.mouse.hover)
				Editor.selectionAdd(state, state.contentState.mouse.hover.id)
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
	
	
	static render(state: ContentStateManager<EditorState>, ctx: CanvasRenderingContext2D)
	{
		ctx.save()
		ctx.translate(0.5, 0.5)
		
		ctx.fillStyle = state.appState.prefs.editor.bkgColor
		ctx.fillRect(0, 0, state.contentState.w, state.contentState.h)
		
		let y = 0
		for (let t = 0; t < state.contentState.tracks.length; t++)
		{
			ctx.save()
			ctx.translate(state.contentState.trackHeaderW, y)

			Track.execute("render", state, t, ctx)

			ctx.restore()

			y += state.contentState.tracks[t].h
			
			ctx.strokeStyle = state.appState.prefs.editor.trackHBorderColor
			ctx.beginPath()
			ctx.moveTo(0, y)
			ctx.lineTo(state.contentState.w, y)
			ctx.stroke()
		}
        
		ctx.strokeStyle = state.appState.prefs.editor.trackVBorderColor
		ctx.beginPath()
		ctx.moveTo(state.contentState.trackHeaderW, 0)
		ctx.lineTo(state.contentState.trackHeaderW, state.contentState.h)
		ctx.stroke()

        ctx.restore()
    }
}