import { ContentStateManager } from "../App"
import EditorState from "./editorState"
import TrackStateManager from "./trackStateManager"
import TrackNotesPreview from "./trackNotesPreview"
import TrackKeyChanges from "./trackKeyChanges"
import TrackMeterChanges from "./trackMeterChanges"


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
			case "notesPreview": return TrackNotesPreview
            case "keyChanges": return TrackKeyChanges
            case "meterChanges": return TrackMeterChanges
			default: throw "invalid track kind"
		}
	}
	
	
	static execute(fnName: string, state: ContentStateManager<EditorState>, trackIndex: number, ...args: any[])
	{
        const trackStateManager = new TrackStateManager<any>(state, trackIndex)
        
        const handlerDerived = Track.handlerForTrackType(trackStateManager.trackState.type)
		const fnDerived = handlerDerived[fnName]
        if (fnDerived)
        {
            fnDerived(trackStateManager, ...args)
            return
        }

		const fn = (Track as any)[fnName]
        if (fn)
        {
            fn(trackStateManager, ...args)
            return
        }
	}
}