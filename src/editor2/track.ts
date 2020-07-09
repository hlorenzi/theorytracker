import { ContentManager } from "../AppState"
import EditorState from "./editorState"
import TrackStateManager from "./trackStateManager"
import TrackNotes from "./trackNotes"
import TrackNotesPreview from "./trackNotesPreview"
import TrackKeyChanges from "./trackKeyChanges"
import TrackMeterChanges from "./trackMeterChanges"
import Project from "../project/project2"


export default class Track
{
    static init(state: TrackStateManager<any>)
    {
        state.mergeTrackState({
            yScroll: 0,
        })
    }
	
	
	static handlerForTrackType(type: string): any
	{
		switch (type)
		{
			case "notes": return TrackNotes
			case "notesPreview": return TrackNotesPreview
            case "keyChanges": return TrackKeyChanges
            case "meterChanges": return TrackMeterChanges
			default: throw "invalid track kind"
		}
	}
	
	
	static yScrollEnabled(state: TrackStateManager<any>): boolean
	{
		return false
	}
	
	
	static rowAtY(state: TrackStateManager<any>, y: number): number
	{
		return 0
	}
	
	
	static elemsAt(state: TrackStateManager<any>, region: any): Project.ID[]
	{
		return []
	}
	
	
	static execute(fnName: string, state: ContentManager<EditorState>, trackIndex: number, ...args: any[]): any
	{
        const trackStateManager = new TrackStateManager<any>(state, trackIndex)
        
        const handlerDerived = Track.handlerForTrackType(trackStateManager.trackState.type)
		const fnDerived = handlerDerived[fnName]
        if (fnDerived)
            return fnDerived(trackStateManager, ...args)

		const fn = (Track as any)[fnName]
        if (fn)
            return fn(trackStateManager, ...args)

        return null
	}
}