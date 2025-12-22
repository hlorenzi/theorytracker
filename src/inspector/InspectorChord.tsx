import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Inspector from "./index.ts"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Theory from "../theory"
import Rect from "../utils/rect.ts"
import * as CanvasUtils from "../utils/canvasUtils.ts"
import { styled } from "solid-styled-components"


export function InspectorChord(props: {
    value?: Project.Chord,
    setValue: (newValue: Project.Chord) => void,
    key: Theory.Key,
})
{
    const makeChordButton = (degree: number) => {
        const root = props.key.midiForDegree(degree)
            
        let pitches = [0]
        pitches.push(props.key.midiForDegree(degree + 2) - root)
        pitches.push(props.key.midiForDegree(degree + 4) - root)
        
        /*if (baseChordType >= 7)
            pitches.push(props.key.midiForDegree(degree + 6) - root)
        
        if (baseChordType >= 9)
            pitches.push(props.key.midiForDegree(degree + 8) - root)
        
        if (baseChordType >= 11)
            pitches.push(props.key.midiForDegree(degree + 10) - root)
        
        if (baseChordType >= 13)
            pitches.push(props.key.midiForDegree(degree + 12) - root)*/
        
        const kind = Theory.Chord.kindFromPitches(pitches)
        const chord = new Theory.Chord(root, kind, 0, [])

        let canvas: HTMLCanvasElement = undefined!

        Solid.createEffect(() => {
            const prefs = Global.get().prefs
            const pixelRatio = window.devicePixelRatio
            const rect = canvas.getBoundingClientRect()
            canvas.width = Math.floor(rect.width * pixelRatio)
            canvas.height = Math.floor(rect.height * pixelRatio)
            const ctx = canvas.getContext("2d")!
            CanvasUtils.drawChord(
                ctx,
                Rect.fromVertices(0, 0, canvas.width, canvas.height),
                prefs,
                chord,
                props.key)
        })

        return <ChordButton>
            <ChordCanvas
                ref={ canvas }
            />
        </ChordButton>
    }

    return <>
        <Layout>
            <h2 style={{ "grid-column": "1 / -1" }}>Chord</h2>

            <LayoutMainButtons>
                <Solid.For each={ props.key.chroma }>
                    { (chroma, degree) => makeChordButton(degree()) }
                </Solid.For>
            </LayoutMainButtons>

        </Layout>
    </>
}


const Layout = styled.div`
    display: grid;
    grid-template: auto 1fr / auto auto;
    width: 100%;
    height: 100%;
    min-height: 0;
    justify-content: center;
    justify-items: center;
    align-content: center;
    align-items: center;
    column-gap: 1em;
`


const LayoutMainButtons = styled.div`
    display: grid;
    grid-template: auto / repeat(7, 1fr);
    width: 100%;
    height: 100%;
    justify-content: center;
    justify-items: center;
    align-content: center;
    align-items: center;
    column-gap: 1em;
`


const ChordButton = styled.button<{
}>`
    border: 0;
    margin: 0;
    padding: 0;
    background-color: transparent;
`


const ChordCanvas = styled.canvas<{
}>`
    width: 6em;
    height: 3em;
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
    border-radius: 0.25em;
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