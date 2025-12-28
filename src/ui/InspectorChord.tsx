import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Ui from "./index.ts"
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

        return (key: Theory.Key, degree: number) => {
            const chord = Theory.ChordOptions.buildChord(key, degree, chOpts)
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

    const makeChordButtons = Solid.createMemo(() => {
        const chOpts = chordOptions()
        const scaleId = chOpts.borrowFromScaleId ?? props.key.scale.id!
        const borrowedKey = new Theory.Key(props.key.tonic, Theory.Scale.fromId(scaleId))

        return borrowedKey.chroma.map((chroma, degree) =>
            makeChordButton()(borrowedKey, degree)
        )
    })

    const makeScaleOption = (scaleMeta: Theory.ScaleMetadata) => {
        return <OptionScale value={ scaleMeta.id }>
            <div>
                { scaleMeta.names[0] }
                <span style={{ display: "none" }}> | </span>
                <br/>
                <Solid.For each={ scaleMeta.chromas }>
                    { (chroma, i) => {
                        const degree = i()
                        const borrowedKey = new Theory.Key(props.key.tonic, Theory.Scale.fromId(scaleMeta.id))
                        const chord = Theory.Chord.fromDiatonicTriad(borrowedKey, degree)
                        const chordStr = chord.str(props.key)

                        return <div style={{
                            display: "inline-block",
                            width: "1.5em",
                            "margin-right": "1em",
                            "text-align": "right",
                            color: undefined,
                        }}>
                            { chordStr.romanBase }
                            <sup>{chordStr.romanSup }</sup>
                            <sub>{chordStr.romanSub }</sub>
                            { " " }
                        </div>
                    }}
                </Solid.For>
            </div>
        </OptionScale>
    }
    
    return <>
        <Layout>
            <LayoutChordButtons>
                { makeChordButtons() }
            </LayoutChordButtons>

            <LayoutChordOptions>
                <div style={{
                    "grid-column": "1 / -1",
                    "justify-self": "center",
                }}>
                    <Ui.Checkbox
                        label="Triad"
                        groupStart
                        checked={ chordOptions().withStacking === 0 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withStacking: 0 })) }
                    />
                    <Ui.Checkbox
                        label="7"
                        groupMiddle
                        checked={ chordOptions().withStacking === 7 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withStacking: ev ? 7 : 0 })) }
                    />
                    <Ui.Checkbox
                        label="9"
                        groupMiddle
                        checked={ chordOptions().withStacking === 9 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withStacking: ev ? 9 : 0 })) }
                    />
                    <Ui.Checkbox
                        label="11"
                        groupMiddle
                        checked={ chordOptions().withStacking === 11 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withStacking: ev ? 11 : 0 })) }
                    />
                    <Ui.Checkbox
                        label="13"
                        groupEnd
                        checked={ chordOptions().withStacking === 13 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withStacking: ev ? 13 : 0 })) }
                    />
                </div>
                <div>
                    <Ui.Checkbox
                        label="sus2"
                        checked={ chordOptions().withSus2 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withSus2: ev })) }
                    />
                    <br/>
                    <Ui.Checkbox
                        label="sus4"
                        checked={ chordOptions().withSus4 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withSus4: ev })) }
                    />
                </div>
                <div>
                    <Ui.Checkbox
                        label="add9"
                        checked={ chordOptions().withAdd9 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withAdd9: ev })) }
                    />
                    <br/>
                    <Ui.Checkbox
                        label="add11"
                        checked={ chordOptions().withAdd11 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withAdd11: ev })) }
                    />
                    <br/>
                    <Ui.Checkbox
                        label="add13"
                        checked={ chordOptions().withAdd13 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withAdd13: ev })) }
                    />
                    <br/>
                    <br/>
                    <Ui.Checkbox
                        label="no3"
                        checked={ chordOptions().withNo3 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withNo3: ev })) }
                    />
                    <br/>
                    <Ui.Checkbox
                        label="no5"
                        checked={ chordOptions().withNo5 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withNo5: ev })) }
                    />
                </div>
                <div>
                    <Ui.Checkbox
                        label="♭5"
                        checked={ chordOptions().withFlat5 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withFlat5: ev })) }
                    />
                    <br/>
                    <Ui.Checkbox
                        label="♯5"
                        checked={ chordOptions().withSharp5 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withSharp5: ev })) }
                    />
                    <br/>
                    <Ui.Checkbox
                        label="♭9"
                        checked={ chordOptions().withFlat9 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withFlat9: ev })) }
                    />
                    <br/>
                    <Ui.Checkbox
                        label="♯9"
                        checked={ chordOptions().withSharp9 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withSharp9: ev })) }
                    />
                    <br/>
                    <Ui.Checkbox
                        label="♯11"
                        checked={ chordOptions().withSharp11 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withSharp11: ev })) }
                    />
                    <br/>
                    <Ui.Checkbox
                        label="♭13"
                        checked={ chordOptions().withFlat13 }
                        onChange={ ev => setChordOptions(opts => ({ ...opts, withFlat13: ev })) }
                    />
                </div>
                <div style={{
                    "grid-column": "1 / -1",
                    "justify-self": "center",
                }}>
                    <Ui.Select
                        value={ chordOptions().borrowFromScaleId }
                        onChange={ scaleId => setChordOptions(opts => ({ ...opts, borrowFromScaleId: scaleId })) }
                    >
                        { Theory.Scale.list.map(
                            (scaleMeta, i) => makeScaleOption(scaleMeta)
                        )}
                    </Ui.Select>
                </div>
            </LayoutChordOptions>

        </Layout>
    </>
}


const Layout = styled.div`
    display: grid;
    grid-template: auto / auto auto;
    width: 100%;
    height: 100%;
    min-height: 0;
    justify-content: center;
    justify-items: center;
    align-content: start;
    align-items: start;
    column-gap: 1em;
`


const LayoutChordButtons = styled.div`
    display: grid;
    grid-template: 1fr / repeat(7, 1fr);
    width: 100%;
    height: 100%;
    justify-content: center;
    justify-items: center;
    align-content: start;
    align-items: start;
    column-gap: 0.5em;
`


const LayoutChordOptions = styled.div`
    display: grid;
    grid-template: repeat(6, auto) / repeat(3, auto);
    justify-content: start;
    justify-items: start;
    align-content: start;
    align-items: start;
    row-gap: 0.5em;
    column-gap: 1em;
`


const ChordButton = styled.button<{
}>`
    border: 0;
    border-radius: var(--theme-buttonBorderRadius);
    margin: 0;
    padding: 0;
    width: 5em;
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


const OptionScale = styled.option`
    margin-top: 0.5em;
    margin-bottom: 0.5em;
`