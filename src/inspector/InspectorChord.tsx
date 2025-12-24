import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Inspector from "./index.ts"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Theory from "../theory"
import Rect from "../utils/rect.ts"
import * as CanvasUtils from "../utils/canvasUtils.ts"
import { styled } from "solid-styled-components"


type Stacking = 0 | 7 | 9 | 11 | 13


export function InspectorChord(props: {
    value?: Project.Chord,
    insertElem?: (newValue: Theory.Chord) => void,
    upsertElem?: (newValue: Project.Chord) => void,
    key: Theory.Key,
})
{
    const [stacking, setStacking] = Solid.createSignal<Stacking>(
        !props.value ? 0 :
            props.value?.chord.add7 !== undefined ?
                props.value?.chord.add9 !== undefined ?
                    props.value?.chord.add11 !== undefined ?
                        props.value?.chord.add13 !== undefined ? 13 :
                    11 :
                9 :
            7 :
        0)

    const [suspended2, setSuspended2] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.sus2 !== undefined)

    const [suspended4, setSuspended4] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.sus4 !== undefined)

    const [add9, setAdd9] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.add7 === undefined &&
            props.value?.chord.add9 === 0)

    const [add11, setAdd11] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.add7 === undefined &&
            props.value?.chord.add9 === undefined &&
            props.value?.chord.add11 === 0)

    const [add13, setAdd13] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.add7 === undefined &&
            props.value?.chord.add9 === undefined &&
            props.value?.chord.add11 === undefined &&
            props.value?.chord.add13 === 0)

    const [no3, setNo3] = Solid.createSignal(
        !props.value ? false :
            !!props.value?.chord.no3)

    const [no5, setNo5] = Solid.createSignal(
        !props.value ? false :
            !!props.value?.chord.no5)

    const [flat5, setFlat5] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.add5 === -1)

    const [sharp5, setSharp5] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.add5 === 1)

    const [flat9, setFlat9] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.add9 === -1)

    const [sharp9, setSharp9] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.add9 === 1)

    const [sharp11, setSharp11] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.add11 === 1)

    const [flat13, setFlat13] = Solid.createSignal(
        !props.value ? false :
            props.value?.chord.add13 === -1)

    const applyChord = (chord: Theory.Chord) => {
        //setCurrKey(key)
        props.insertElem?.(chord)
        const project = Global.get().project
        const projChord = Project.getTypedElem(project.root, props.value?.id, "chord")
        if (projChord)
            props.upsertElem?.({...projChord, chord })
    }

    const makeChordButton = Solid.createMemo(() => {
        const withStacking = stacking()
        const withSus2 = suspended2()
        const withSus4 = suspended4()
        const withAdd9 = add9()
        const withAdd11 = add11()
        const withAdd13 = add13()
        const withNo3 = no3()
        const withNo5 = no5()
        const withFlat5 = flat5()
        const withSharp5 = sharp5()
        const withFlat9 = flat9()
        const withSharp9 = sharp9()
        const withSharp11 = sharp11()
        const withFlat13 = flat13()
        
        return (degree: number) => {
            let chord = Theory.Chord.fromDiatonicTriad(props.key, degree)

            if (withStacking >= 7)
                chord = chord.withAdded7(props.key)

            if (withStacking >= 9)
                chord = chord.withAdded9(props.key)

            if (withStacking >= 11)
                chord = chord.withAdded11(props.key)

            if (withStacking >= 13)
                chord = chord.withAdded13(props.key)

            if (withSus2)
                chord = chord.withSuspended2(props.key)

            if (withSus4)
                chord = chord.withSuspended4(props.key)

            if (withAdd9)
                chord = chord.withAdded9(props.key)

            if (withAdd11)
                chord = chord.withAdded11(props.key)

            if (withAdd13)
                chord = chord.withAdded13(props.key)

            if (withFlat5)
                chord = chord.withAdded5(props.key, -1)

            if (withSharp5)
                chord = chord.withAdded5(props.key, 1)

            if (withFlat9)
                chord = chord.withAdded9(props.key, -1)

            if (withSharp9)
                chord = chord.withAdded9(props.key, 1)

            if (withSharp11)
                chord = chord.withAdded11(props.key, 1)

            if (withFlat13)
                chord = chord.withAdded13(props.key, -1)

            if (withNo3)
                chord = chord.withNo3()

            if (withNo5)
                chord = chord.withNo5()

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

            return <ChordButton
                onClick={ () => applyChord(chord) }
            >
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
                    checked={ stacking() === 0 }
                    onChange={ ev => setStacking(0) }
                /> Triad
                <input
                    type="checkbox"
                    checked={ stacking() === 7 }
                    onChange={ ev => setStacking(7) }
                /> 7
                <input
                    type="checkbox"
                    checked={ stacking() === 9 }
                    onChange={ ev => setStacking(9) }
                /> 9
                <input
                    type="checkbox"
                    checked={ stacking() === 11 }
                    onChange={ ev => setStacking(11) }
                /> 11
                <input
                    type="checkbox"
                    checked={ stacking() === 13 }
                    onChange={ ev => setStacking(13) }
                /> 13
                <br/>
                <input
                    type="checkbox"
                    checked={ suspended2() }
                    onChange={ ev => setSuspended2(ev.target.checked) }
                /> sus2
                <input
                    type="checkbox"
                    checked={ suspended4() }
                    onChange={ ev => setSuspended4(ev.target.checked) }
                /> sus4
                <br/>
                <input
                    type="checkbox"
                    checked={ add9() }
                    onChange={ ev => setAdd9(ev.target.checked) }
                /> add9
                <input
                    type="checkbox"
                    checked={ add11() }
                    onChange={ ev => setAdd11(ev.target.checked) }
                /> add11
                <input
                    type="checkbox"
                    checked={ add13() }
                    onChange={ ev => setAdd13(ev.target.checked) }
                /> add13
                <br/>
                <input
                    type="checkbox"
                    checked={ no3() }
                    onChange={ ev => setNo3(ev.target.checked) }
                /> no3
                <input
                    type="checkbox"
                    checked={ no5() }
                    onChange={ ev => setNo5(ev.target.checked) }
                /> no5
                <input
                    type="checkbox"
                    checked={ flat5() }
                    onChange={ ev => setFlat5(ev.target.checked) }
                /> flat5
                <input
                    type="checkbox"
                    checked={ sharp5() }
                    onChange={ ev => setSharp5(ev.target.checked) }
                /> sharp5
                <br/>
                <input
                    type="checkbox"
                    checked={ flat9() }
                    onChange={ ev => setFlat9(ev.target.checked) }
                /> flat9
                <input
                    type="checkbox"
                    checked={ sharp9() }
                    onChange={ ev => setSharp9(ev.target.checked) }
                /> sharp9
                <input
                    type="checkbox"
                    checked={ sharp11() }
                    onChange={ ev => setSharp11(ev.target.checked) }
                /> sharp11
                <input
                    type="checkbox"
                    checked={ flat13() }
                    onChange={ ev => setFlat13(ev.target.checked) }
                /> flat13
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