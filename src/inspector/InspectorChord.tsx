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
    const [seventh, setSeventh] = Solid.createSignal(
        !props.value ? false : props.value?.chord.add7 !== undefined)

    const [suspended2, setSuspended2] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.sus2 !== undefined &&
            props.value?.chord.add3 === undefined)

    const [suspended4, setSuspended4] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.sus4 !== undefined &&
            props.value?.chord.add3 === undefined)

    const makeChordButton = Solid.createMemo(() => {
        const withAdded7 = seventh()
        const withSus2 = suspended2()
        const withSus4 = suspended4()
        
        return (degree: number) => {
            let chord = Theory.Chord.fromDiatonicTriad(props.key, degree)

            if (withAdded7)
                chord = chord.withAdded7(props.key)

            if (withSus2)
                chord = chord.withSuspended2(props.key)

            if (withSus4)
                chord = chord.withSuspended4(props.key)

            console.log(degree, chord)

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
    })

    return <>
        <Layout>
            <h2 style={{ "grid-column": "1 / -1" }}>Chord</h2>

            <LayoutMainButtons>
                { props.key.chroma.map((chroma, degree) =>
                    makeChordButton()(degree)
                )}
            </LayoutMainButtons>

            <div>
                <input
                    type="checkbox"
                    checked={ seventh() }
                    onChange={ ev => setSeventh(ev.target.checked) }
                /> 7
                <br/>
                <input
                    type="checkbox"
                    checked={ suspended2() }
                    onChange={ ev => setSuspended2(ev.target.checked) }
                /> sus2
                <br/>
                <input
                    type="checkbox"
                    checked={ suspended4() }
                    onChange={ ev => setSuspended4(ev.target.checked) }
                /> sus4
                <br/>
            </div>

        </Layout>
    </>
}


const Layout = styled.div`
    display: grid;
    grid-template: auto 1fr / auto auto auto;
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
    grid-column: 1 / -1;
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
    height: 3.5em;
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