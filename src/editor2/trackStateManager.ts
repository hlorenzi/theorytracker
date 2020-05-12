import { AppState, ContentStateManager } from "../App"
import EditorState from "./editorState"


export default class TrackStateManager<T>
{
    contentStateManager: ContentStateManager<EditorState>
    trackIndex: number


    constructor(contentStateManager: ContentStateManager<EditorState>, trackIndex: number)
    {
        this.contentStateManager = contentStateManager
        this.trackIndex = trackIndex
    }


    get appState(): AppState
    {
        return this.contentStateManager.appState
    }


    get contentState(): EditorState
    {
        return this.contentStateManager.contentState
    }


    set contentState(newState: EditorState)
    {
        this.contentStateManager.contentState = newState
    }


    mergeContentState(newState: any)
    {
        this.contentStateManager.mergeContentState(newState)
    }


    get trackState(): T
    {
        return this.contentStateManager.contentState.tracks[this.trackIndex] as any as T
    }


    set trackState(newState: T)
    {
        this.contentStateManager.mergeContentState({
            tracks: [
                ...this.contentStateManager.contentState.tracks.slice(0, this.trackIndex),
                newState,
                ...this.contentStateManager.contentState.tracks.slice(this.trackIndex + 1),
            ]
        })
    }


    mergeTrackState(newState: any)
    {
        this.trackState = {
            ...this.trackState,
            ...newState,
        }
    }
}