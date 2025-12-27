import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Inspector from "./index.ts"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Theory from "../theory"
import { TextInput } from "../components"
import Rect from "../utils/rect.ts"
import { styled } from "solid-styled-components"


export function InspectorTempoChange(props: {
    value: Project.TempoChange,
    upsertElem: (newValue: Project.TempoChange) => void,
})
{
    const [currTempo, setCurrTempo] = Solid.createSignal(props.value.bpm)


    const applyTempo = (bpm: number) => {
        setCurrTempo(bpm)
        const project = Global.get().project
        const tempoCh = Project.getTypedElem(project.root, props.value.id, "tempoChange")
        if (tempoCh)
            props.upsertElem({...tempoCh, bpm })
    }


    const parseTempo = (bpmStr: string) => {
        let bpm = parseInt(bpmStr)
        if (!isFinite(bpm))
            return

        bpm = Math.max(1, Math.min(999, bpm))
        applyTempo(bpm)
    }


    return <>
        <Layout>
            <h2 style={{ "grid-column": "1 / -1" }}>Tempo Change</h2>

            <TextInput
                value={ currTempo().toString() }
                labelAfter=" bpm"
                onChange={ parseTempo }
                width="4em"
            />

        </Layout>
    </>
}


const Layout = styled.div`
    display: grid;
    grid-template: auto auto / auto;
    width: 100%;
    height: 100%;
    min-height: 0;
    justify-content: center;
    justify-items: center;
    align-content: start;
    align-items: start;
    column-gap: 1em;
`


const CircleOfFifthsPath = styled.path<{
    $selected: boolean,
}>`
    cursor: pointer;
    fill: var(--theme-buttonBkg);

    &:hover {
        fill: var(--theme-buttonBkgHover);
    }

    &:active {
        fill: var(--theme-buttonBkgPress);
    }

    ${ props => props.$selected ? "fill: var(--theme-buttonBkgSelected);" : "" }
`


const ScaleList = styled.div`
    width: 20em;
    height: 100%;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: scroll;
    scrollbar-gutter: stable;
    border-radius: 0.25em;
`


const ScaleButton = styled.div<{
    $selected: boolean,
}>`
    display: grid;
    grid-template: auto auto / auto;
    justify-items: start;
    justify-content: start;
    user-select: none;
    cursor: pointer;

    width: 90%;
    margin: 0.25em;
    padding: 0.25em 0.5em;
    border-radius: var(--theme-buttonBorderRadius);
    background-color: var(--theme-buttonBkg);

    &:hover {
        background-color: var(--theme-buttonBkgHover);
    }

    &:active {
        background-color: var(--theme-buttonBkgPress);
    }
        
    ${ props => props.$selected ? "background-color: var(--theme-buttonBkgSelected);" : "" }
`


const StyledSelect = styled.select`
    /*appearance: base-select;
    
    &::picker(select) {
        appearance: base-select;
    }*/
`


const OptionScale = styled.option`
    margin-top: 0.5em;
    margin-bottom: 0.5em;
`