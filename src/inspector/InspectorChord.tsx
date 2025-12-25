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
    insertElem?: (newValue: Theory.Chord) => void,
    upsertElem?: (newValue: Project.Chord) => void,
    key: Theory.Key,
})
{
    const [currChord, setCurrChord] = Solid.createSignal(props.value?.chord)

    const [chordOptions, setChordOptionsRaw] = Solid.createSignal(
        props.value ?
            Theory.ChordOptions.makeFromChord(props.key, props.value?.chord) :
            Theory.ChordOptions.makeEmpty())

    const applyChord = (chord: Theory.Chord) => {
        setCurrChord(chord)
        props.insertElem?.(chord)
        const project = Global.get().project
        const projChord = Project.getTypedElem(project.root, props.value?.id, "chord")
        if (projChord)
            props.upsertElem?.({...projChord, chord })
    }

    const setChordOptions = (modifyFn: (old: Theory.ChordOptions) => Theory.ChordOptions) => {
        const oldOpts = chordOptions()
        const newOpts = modifyFn(oldOpts)
        setChordOptionsRaw(newOpts)

        let selectedDegree: number | undefined = undefined
        for (let degree = 0; degree < 7; degree++)
        {
            const chord = Theory.ChordOptions.buildChord(props.key, degree, oldOpts)
            const isSelected = !!currChord()?.isEqual(chord)
            if (isSelected)
                selectedDegree = degree
        }

        if (props.value &&
            selectedDegree !== undefined)
        {
            const newChord = Theory.ChordOptions.buildChord(props.key, selectedDegree, newOpts)
            applyChord(newChord)
        }
    }

    const makeChordButton = Solid.createMemo(() => {
        const chOpts = chordOptions()

        return (degree: number) => {
            const chord = Theory.ChordOptions.buildChord(props.key, degree, chOpts)
            const isSelected = props.value && currChord()?.isEqual(chord)
            console.log(degree, chord)

            let canvas: HTMLCanvasElement = undefined!

            Solid.createEffect(() => {
                const prefs = Global.get().prefs
                const pixelRatio = window.devicePixelRatio
                const canvasRect = canvas.getBoundingClientRect()
                canvas.width = Math.floor(canvasRect.width * pixelRatio)
                canvas.height = Math.floor(canvasRect.height * pixelRatio)
                const ctx = canvas.getContext("2d")!
                const rect = Rect.fromVertices(0, 0, canvas.width, canvas.height)
                CanvasUtils.drawChord(
                    ctx,
                    rect,
                    prefs,
                    chord,
                    props.key)

                if (isSelected)
                {
                    ctx.save()
                    ctx.roundRect(
                        rect.x,
                        rect.y,
                        rect.w,
                        rect.h,
                        5)
                    ctx.clip()
                    ctx.lineWidth = 5
                    ctx.strokeStyle = "#fffd"
                    ctx.stroke()
                    ctx.restore()
                }
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
                    checked={ chordOptions().withStacking === 0 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withStacking: 0 })) }
                /> Triad
                <input
                    type="checkbox"
                    checked={ chordOptions().withStacking === 7 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withStacking: 7 })) }
                /> 7
                <input
                    type="checkbox"
                    checked={ chordOptions().withStacking === 9 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withStacking: 9 })) }
                /> 9
                <input
                    type="checkbox"
                    checked={ chordOptions().withStacking === 11 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withStacking: 11 })) }
                /> 11
                <input
                    type="checkbox"
                    checked={ chordOptions().withStacking === 13 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withStacking: 13 })) }
                /> 13
                <br/>
                <input
                    type="checkbox"
                    checked={ chordOptions().withSus2 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withSus2: ev.target.checked })) }
                /> sus2
                <input
                    type="checkbox"
                    checked={ chordOptions().withSus4 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withSus4: ev.target.checked })) }
                /> sus4
                <br/>
                <input
                    type="checkbox"
                    checked={ chordOptions().withAdd9 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withAdd9: ev.target.checked })) }
                /> add9
                <input
                    type="checkbox"
                    checked={ chordOptions().withAdd11 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withAdd11: ev.target.checked })) }
                /> add11
                <input
                    type="checkbox"
                    checked={ chordOptions().withAdd13 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withAdd13: ev.target.checked })) }
                /> add13
                <br/>
                <input
                    type="checkbox"
                    checked={ chordOptions().withNo3 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withNo3: ev.target.checked })) }
                /> no3
                <input
                    type="checkbox"
                    checked={ chordOptions().withNo5 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withNo5: ev.target.checked })) }
                /> no5
                <input
                    type="checkbox"
                    checked={ chordOptions().withFlat5 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withFlat5: ev.target.checked })) }
                /> flat5
                <input
                    type="checkbox"
                    checked={ chordOptions().withSharp5 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withSharp5: ev.target.checked })) }
                /> sharp5
                <br/>
                <input
                    type="checkbox"
                    checked={ chordOptions().withFlat9 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withFlat9: ev.target.checked })) }
                /> flat9
                <input
                    type="checkbox"
                    checked={ chordOptions().withSharp9 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withSharp9: ev.target.checked })) }
                /> sharp9
                <input
                    type="checkbox"
                    checked={ chordOptions().withSharp11 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withSharp11: ev.target.checked })) }
                /> sharp11
                <input
                    type="checkbox"
                    checked={ chordOptions().withFlat13 }
                    onChange={ ev => setChordOptions(opts => ({ ...opts, withFlat13: ev.target.checked })) }
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
    border-radius: 5px;
    margin: 0;
    padding: 0;
    width: 6em;
    height: 3.5em;
    background-color: #fff;
    cursor: pointer;
`


const ChordCanvas = styled.canvas<{
}>`
    width: 100%;
    height: 100%;

    &:hover {
        opacity: 0.5;
    }
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