import React from "react"
import * as Dockable from "../dockable"
import * as TimelineData from "../timeline"
import * as Prefs from "../prefs"
import { useRefState } from "../util/refState"
import styled from "styled-components"


interface PrefsProps
{
    readonly prefs: Prefs.Prefs
}


const StyledModeStackDiv = styled.div<PrefsProps>`
    width: 100%;
    background-color: ${ props => props.prefs.ui.windowPanelColor };
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
    const windowCtx = Dockable.useWindow()
    windowCtx.setTitle("Timeline")
    windowCtx.setPreferredSize(600, 450)

    const editorState = useRefState(() => TimelineData.init())

    Dockable.modifyContentData(windowCtx.contentId, (data) =>
    {
        data.timelineState = editorState
    })

    const getModeName = (mode: TimelineData.Mode) =>
    {
        switch (mode)
        {
            case TimelineData.Mode.Project: return "Project Root"
            case TimelineData.Mode.NoteBlock: return "Note Block"
        }
    }

    const onClickModeStack = (index: number) =>
    {
        TimelineData.modeStackPop(editorState.ref.current, index)
        editorState.commit()
        window.dispatchEvent(new Event("timelineRefresh"))
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
        <StyledModeStackDiv
            prefs={ Prefs.global }
        >
            { modeStack }
        </StyledModeStackDiv>
        <TimelineData.TimelineElement
            state={ editorState }
        />
    </div>
}