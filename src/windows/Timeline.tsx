import React from "react"
import * as Dockable from "../dockable"
import * as Editor from "../editor"
import { useRefState } from "../util/refState"
import styled from "styled-components"


const StyledModeStackDiv = styled.div`
    width: 100%;
    background-color: #000;
    border-bottom: 1px solid #888;
`


const StyledModeStackButton = styled.button`
    font-family: inherit;
    color: #fff;
    border: 1px solid transparent;
    border-radius: 0.25em;
    background-color: transparent;
    padding: 0em 0.25em;
    margin: 0.5em 0.25em;
    cursor: pointer;
    outline: none;

    &:hover
    {
        background-color: #2f3136;
        border: 1px solid #fff;
    }
`


export function Timeline()
{
    const editorState = useRefState(() => Editor.init())

    const makeUpdateData: () => Editor.EditorUpdateData = () =>
    {
        return {
            state: editorState.ref.current,
            project: null!,
            playback: null!,
            prefs: null!,
            popup: null!,
            dockable: null!,
            ctx: null!,
        }
    }

    const getModeName = (mode: Editor.Mode) =>
    {
        switch (mode)
        {
            case Editor.Mode.Project: return "Project Root"
            case Editor.Mode.NoteBlock: return "Note Block"
        }
    }

    const onClickModeStack = (index: number) =>
    {
        const data = makeUpdateData()
        Editor.modeStackPop(data, index)
        editorState.commit()
        window.dispatchEvent(new Event("refreshProjectTracks"))
    }

    const modeStack = React.useMemo(() =>
    {
        const modes =
        [
            ...editorState.ref.current.modeStack.map(s => s.mode),
            editorState.ref.current.mode,
        ]

        return modes.map((mode, i) =>
        {
            const name = getModeName(mode)
            return <React.Fragment key={ i }>
                { i == 0 ? null :
                    " > "
                }
                <StyledModeStackButton
                    onClick={ () => onClickModeStack(i) }
                >
                    { name }
                </StyledModeStackButton>
            </React.Fragment>
        })

    }, [editorState.update, editorState.ref.current.modeStack.length])


    return <div style={{
        width: "100%",
        height: "100%",
        boxSizing: "border-box",

        display: "grid",
        gridTemplate: "auto 1fr / 1fr",
        justifyContent: "start",
        justifyItems: "start",
    }}>
        <StyledModeStackDiv>
            { modeStack }
        </StyledModeStackDiv>
        <Editor.EditorElement
            state={ editorState }
        />
    </div>
}