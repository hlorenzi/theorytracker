import React from "react"
import Editor from "../editor/editor.js"



export default function ToolboxTracks(props)
{
    const state = props.state
    const dispatch = props.dispatch

    const time = Editor.insertionTime(props.state)
    const cursorKeyCh = state.project.keyChanges.findActiveAt(time)
    const key = cursorKeyCh ? cursorKeyCh.key : Editor.defaultKey()

    const onClickTrack = (id) =>
    {
        dispatch({ type: "trackClear" })
		dispatch({ type: "trackAdd", kind: "markers" })
		dispatch({ type: "trackAdd", kind: "chords" })
		dispatch({ type: "trackAdd", kind: "notes", trackId: id })
    }

    return <div style={{
        boxSizing: "border-box",
        border: "0.5em solid transparent",
        width: "100%",
        height: "100%",
    }}>
        <div style={{
            width: "100%",
            backgroundColor: "#fff",
            borderRadius: "0.5em",
            overflowX: "auto",
            overflowY: "auto",
            userSelect: "none",
        }}>
            <div style={{
                width: "100%",
                display: "grid",
                gridTemplate: "auto / 10em auto auto 1fr",
                gridGap: "0.1em",
                alignItems: "center",
                justifyItems: "center",
                borderBottom: "1px solid #eee",
            }}>
                <button
                    onClick={ () => onClickTrack(track.id) }
                    style={{
                        padding: "0.5em 0.5em",
                        justifySelf: "start",
                        border: "0",
                        backgroundColor: "transparent",
                        fontFamily: "inherit",
                        cursor: "pointer",
                        position: "sticky",
                        left: "0",
                }}>
                </button>

                <div style={{
                    padding: "0.5em 0.15em",
                    fontSize: "125%",
                    cursor: "pointer",
                }}>
                    👁️
                </div>

                <div style={{
                    padding: "0.5em 0.15em",
                    fontSize: "125%",
                    cursor: "pointer",
                }}>
                    🧅
                </div>

            </div>

            { state.project.tracks.map(track =>
                <div style={{
                    width: "100%",
                    display: "grid",
                    gridTemplate: "auto / 10em auto auto 1fr",
                    gridGap: "0.1em",
                    alignItems: "center",
                    justifyItems: "center",
                }}>
                    <button
                        onClick={ () => onClickTrack(track.id) }
                        style={{
                            padding: "0.5em 0.5em",
                            justifySelf: "start",
                            border: "0",
                            backgroundColor: "transparent",
                            fontFamily: "inherit",
                            cursor: "pointer",
                            position: "sticky",
                            left: "0",
                            textAlign: "left",
                            wordWrap: "break-word",
                    }}>
                        { track.name }
                    </button>

                    <div style={{
                        padding: "0 0.15em",
                        fontSize: "125%",
                        cursor: "pointer",
                    }}>
                        👁️
                    </div>

                    <div style={{
                        padding: "0 0.15em",
                        fontSize: "125%",
                        cursor: "pointer",
                    }}>
                        🧅
                    </div>

                </div>
            )}
        </div>
    </div>
}