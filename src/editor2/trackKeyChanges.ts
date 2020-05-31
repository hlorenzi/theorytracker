import Editor from "./editor"
import Track from "./track"
import TrackStateManager from "./trackStateManager"
import TrackKeyChangesState from "./trackKeyChangesState"
import Rect from "../util/rect"
import Range from "../util/range"
import Project from "../project/project2"
import Rational from "../util/rational"
import * as Theory from "../theory/theory"
import PopupKeyChange from "./PopupKeyChange"


export default class TrackKeyChanges
{
    static knobWidth = 16
    static knobHeight = 22


    static init(state: TrackStateManager<TrackKeyChangesState>)
    {
        Track.init(state)
        state.mergeTrackState({
            type: "keyChanges",
        })
    }
	
	
	static hover(state: TrackStateManager<TrackKeyChangesState>)
	{
        const pos = state.contentState.mouse.trackPos

        const checkRange = Editor.timeRangeAtX(
            state.contentStateManager,
            pos.x - TrackKeyChanges.knobWidth,
            pos.x + TrackKeyChanges.knobWidth)

        let hover = null
        
        for (const keyCh of TrackKeyChanges.iterAtRange(state, checkRange))
        {
            const rect = TrackKeyChanges.knobRectForKeyChange(state, keyCh.time)
            if (rect.contains(pos))
            {
                hover =
                {
                    id: keyCh.id,
                    range: Range.fromPoint(keyCh.time),
                    action: Editor.actionDragTime,
                }
            }
        }

        state.mergeContentState({
            mouse: { ...state.contentState.mouse,
                hover,
            }
        })
	}
    

	static drawClear(state: TrackStateManager<TrackKeyChangesState>)
    {
        state.mergeTrackState({ draw: null })
    }
    

	static drawHover(state: TrackStateManager<TrackKeyChangesState>)
    {
        const time =  state.contentState.mouse.time

        state.mergeTrackState({ draw: { time } })
    }
	
	
	static drawDrag(state: TrackStateManager<TrackKeyChangesState>)
	{
		const draw = state.trackState.draw
		if (draw)
		{
            const time = state.contentState.mouse.time
            state.mergeTrackState({ draw: { time } })
		}
	}
	
	
	static drawEnd(state: TrackStateManager<TrackKeyChangesState>)
	{
		const draw = state.trackState.draw
		if (draw)
		{
            const keyCh = new Project.KeyChange(
                state.trackState.trackId,
                draw.time,
                Editor.defaultKey())

            const id = state.appState.project.nextId
            state.mergeAppState({
                project: Project.upsertTimedElement(state.appState.project, keyCh),
                selection: state.appState.selection.add(id),
            })
		}
	}
	
	
	static popup(state: TrackStateManager<TrackKeyChangesState>)
	{
        const elemId = state.contentState.mouse.hover!.id
        const elem = state.appState.project.elems.get(elemId) as Project.KeyChange

        const knob = TrackKeyChanges.knobRectForKeyChange(state, elem.time)

        Editor.popup(state.contentStateManager, state.trackIndex,
            "inspector",
            new Rect(knob.x2 + 10, knob.y2 + 10, 350, 250),
            { elemIds: [elemId] })
	}
	
	
	static elemsAt(state: TrackStateManager<TrackKeyChangesState>, region: any): Project.ID[]
	{
        const elems = []

        for (const keyCh of TrackKeyChanges.iterAtRange(state, region.range))
            elems.push(keyCh.id)

        return elems
	}


    static *iterAtRange(state: TrackStateManager<TrackKeyChangesState>, range: Range): Generator<Project.KeyChange, void, void>
    {
        const trackElems = state.appState.project.timedLists.get(state.trackState.trackId)
        if (!trackElems)
            return

        for (const keyCh of trackElems.iterAtRange(range))
            yield keyCh as Project.KeyChange
    }
	
	
	static knobRectForKeyChange(state: TrackStateManager<TrackKeyChangesState>, time: Rational)
	{
        return new Rect(
            Editor.xAtTime(state.contentStateManager, time) - TrackKeyChanges.knobWidth / 2,
            0,
            TrackKeyChanges.knobWidth,
            TrackKeyChanges.knobHeight)
	}


    static render(state: TrackStateManager<TrackKeyChangesState>, ctx: CanvasRenderingContext2D)
    {
        const visibleRange = Editor.visibleTimeRange(state.contentStateManager)

        const firstKey = Editor.keyAt(state.contentStateManager, state.trackState.trackId, visibleRange.start)
        let shouldDrawFirstKey = true

        for (const keyCh of TrackKeyChanges.iterAtRange(state, visibleRange))
        {
            if (shouldDrawFirstKey)
            {
                const x = Editor.xAtTime(state.contentStateManager, keyCh.time)
                if (x > 80)
                    TrackKeyChanges.renderKeyChangeLabel(state, ctx, firstKey)
            }

            TrackKeyChanges.renderKeyChange(state, ctx, keyCh)
            shouldDrawFirstKey = false
        }

        if (shouldDrawFirstKey)
            TrackKeyChanges.renderKeyChangeLabel(state, ctx, firstKey)
        
        const draw = state.trackState.draw
        if (draw)
        {
            ctx.globalAlpha = 0.6
            TrackKeyChanges.renderKeyChangeKnob(state, ctx, draw.time)
            ctx.globalAlpha = 1
        }
    }
	
	
	static renderKeyChangeKnob(state: TrackStateManager<TrackKeyChangesState>, ctx: CanvasRenderingContext2D, time: Rational)
	{
		const rect = TrackKeyChanges.knobRectForKeyChange(state, time)
		
		ctx.fillStyle = state.appState.prefs.editor.keyChangeColor
		
		ctx.beginPath()
		ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
		ctx.fill()
	}
	
	
	static renderKeyChangeLabel(state: TrackStateManager<TrackKeyChangesState>, ctx: CanvasRenderingContext2D, key: Theory.Key)
	{
        const rect = TrackKeyChanges.knobRectForKeyChange(state, new Rational(0))
        const x = 5
		
		ctx.fillStyle = state.appState.prefs.editor.keyChangeColor
		
		ctx.font = "14px Verdana"
		ctx.textAlign = "left"
		ctx.textBaseline = "middle"
		ctx.fillText(key.str, x, rect.y + rect.h / 2)
	}
	
	
	static renderKeyChange(state: TrackStateManager<TrackKeyChangesState>, ctx: CanvasRenderingContext2D, keyCh: Project.KeyChange)
	{
		const rect = TrackKeyChanges.knobRectForKeyChange(state, keyCh.time)
		
		ctx.fillStyle = state.appState.prefs.editor.keyChangeColor
		
		ctx.beginPath()
		ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, 0, Math.PI * 2)
		ctx.fill()
		
		ctx.font = "14px Verdana"
		ctx.textAlign = "left"
		ctx.textBaseline = "middle"
		ctx.fillText(keyCh.key.str, rect.x + rect.w + 5, rect.y + rect.h / 2)
		
		if (state.appState.selection.has(keyCh.id))
		{
			ctx.globalAlpha = 0.75
			ctx.fillStyle = "#fff"
			
			ctx.beginPath()
			ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2 - 3, 0, Math.PI * 2)
			ctx.fill()
			
			ctx.globalAlpha = 1
		}
		
		const hover = state.contentState.mouse.hover
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