import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Theory from "../theory"
import Rect from "../utils/rect.ts"
import { styled } from "solid-styled-components"


export function Inspector(props: {})
{
    const selectedIdsRaw = Solid.createMemo(() => {
        const timeline = Global.get().timeline
        return timeline.selection
    })

    const selectedIds = Solid.createMemo(() => {
        const ids = selectedIdsRaw()
        return ids
    })

    const firstElem = Solid.createMemo(() => {
        if (selectedIds().count() !== 1)
            return null

        const project = Global.get().project

        let firstElem = null
        for (const id of selectedIds())
        {
            firstElem = Project.getElem(project.root, id)
            if (firstElem)
                break
        }

        return firstElem
    })

    const inspectorKind = Solid.createMemo(() => {
        const setValue = (elem: Project.Element) => {
            const project = Global.get().project
            project.root = Project.upsertElement(project.root, elem)
            Global.refresh()
        }

        const elem = firstElem()

        if (elem?.type === "keyChange")
            return <InspectorKeyChange
                value={ elem }
                setValue={ setValue }
            />
        
        return <InspectorInsert/>
    })

    return <div style={{
        width: "100%",
        height: "100%",
        contain: "size",
        border: "1em solid transparent",
        "box-sizing": "border-box",
        padding: "1em",
    }}>
        { `${selectedIds().count()} selected` }<br/>

        { inspectorKind() }
    </div>
}


export function InspectorInsert(props: {
})
{
    const makeInsertKeyChange = () => {
        const key = Theory.Key.parse("C Major")

        const insert = () => {
            const project = Global.get().project
            const timeline = Global.get().timeline
            const time = timeline.cursor.time1
            const id = project.root.nextId
            const keyCh = Project.makeKeyChange(project.root.keyChangeTrackId, time, key)
            project.root = Project.upsertElement(project.root, keyCh)
            Timeline.selectionClear(timeline)
            Timeline.selectionAdd(timeline, id)
            Timeline.selectionResolveOverlappingAndDegenerate(timeline, project)
            Global.refresh()
        }

        return <button onClick={ insert }>
            + Key Change
        </button>
    }


    return <>
        { makeInsertKeyChange() }
    </>
}


export function InspectorKeyChange(props: {
    value: Project.KeyChange,
    setValue: (newValue: Project.KeyChange) => void,
})
{
    const tonic = props.value.key.tonic
    const scale = props.value.key.scale

    const circleOfFifthsOffset = scale.metadata?.circleOfFifthsOffset ?? 0

    
    const makeTonicButton = (circleOfFifthsIndex: number) => {
        const letter = Theory.Utils.circleOfFifthsToLetter(circleOfFifthsIndex + circleOfFifthsOffset)
        const accidental = Theory.Utils.circleOfFifthsToAccidental(circleOfFifthsIndex + circleOfFifthsOffset)
        const letterStr = Theory.Utils.letterToStr(letter)
        const accidentalStr = Theory.Utils.accidentalToStr(accidental)
        const pitchName = new Theory.PitchName(letter, accidental)
        const key = new Theory.Key(pitchName, props.value.key.scale)

        const apply = () => {
            props.setValue({...props.value, key })
        }

        const angleArc = Math.PI * 2 / 12
        const angle1 = (circleOfFifthsIndex - 0.5) * angleArc
        const angle2 = (circleOfFifthsIndex + 0.5) * angleArc
        const trigX1 = Math.sin(angle1)
        const trigX2 = Math.sin(angle2)
        const trigY1 = -Math.cos(angle1)
        const trigY2 = -Math.cos(angle2)
        const radius1 = 50
        const radius2 = 100
        const angleMargin1 = 0.025
        const angleMargin2 = angleMargin1 * (radius1 / radius2)
        const subdiv = 4

        let path = ""
        for (let i = 0; i <= subdiv; i++)
        {
            const t = i / subdiv
            const angle = angle1 + (angle2 - angle1) * t + (angleMargin1 - angleMargin1 * 2 * t)
            path += `${ i == 0 ? "M" : "L"} ${Math.sin(angle) * radius1} ${-Math.cos(angle) * radius1} `
        }
        for (let i = 0; i <= subdiv; i++)
        {
            const t = 1 - i / subdiv
            const angle = angle1 + (angle2 - angle1) * t + (angleMargin2 - angleMargin2 * 2 * t)
            path += `L ${Math.sin(angle) * radius2} ${-Math.cos(angle) * radius2} `
        }
        path += "Z"

        return <g>
            <CircleOfFifthsPath
                d={ path }
                onClick={ apply }
                fill="#444"
                $selected={ tonic.chroma === pitchName.chroma }
            />
            <text
                x={ (trigX1 + trigX2) / 2 * (radius1 + radius2) / 1.9 }
                y={ (trigY1 + trigY2) / 2 * (radius1 + radius2) / 1.9 }
                dominant-baseline="middle"
                text-anchor="middle"
                fill="#fff"
                font-size={ ((radius2 - radius1) * 0.5).toString() }
                style={{
                    "user-select": "none",
                    "pointer-events": "none",
            }}>
                { letterStr }{ accidentalStr }
            </text>
        </g>
    }


    const applyScale = (scaleId: string) => {
        const scale = Theory.Scale.fromId(scaleId)
        const key = new Theory.Key(props.value.key.tonic, scale)
        props.setValue({...props.value, key })
    }


    const makeScaleOption = (scaleMeta: Theory.ScaleMetadata) => {
        return <OptionScale value={ scaleMeta.id }>
            <div>
                { scaleMeta.names[0] }
                { " " }
                <br/>
                <Solid.For each={ scaleMeta.chromas }>
                    { (chroma, i) => {
                        const degree = i()
                        const chromaCMajor = Theory.Utils.degreeToChromaInCMajor(degree)
                        const accidental = chroma - chromaCMajor
                        const accidentalStr = Theory.Utils.accidentalToStr(accidental)

                        return <div style={{
                            display: "inline-block",
                            width: "1.25em",
                            "margin-right": "1em",
                            "text-align": "right",
                            color:
                                accidental > 0 ? "red" :
                                accidental < 0 ? "blue" :
                                undefined,
                        }}>
                            { `${accidentalStr}${(degree + 1).toString()} ` }
                        </div>
                    }}
                </Solid.For>
            </div>
        </OptionScale>
    }


    const makeScaleOption2 = (scaleMeta: Theory.ScaleMetadata) => {
        const isSelected = scaleMeta.id === scale.id
        let button: HTMLButtonElement | undefined = undefined
        
        Solid.createEffect(() => {
            if (isSelected && button)
                (button as HTMLButtonElement).scrollIntoView({ behavior: "instant", block: "center" })
        })

        return <ScaleButton
            ref={ button }
            $selected={ isSelected }
            onClick={ () => applyScale(scaleMeta.id) }
        >
            { scaleMeta.names[0] }
            <span>
                <Solid.For each={ scaleMeta.chromas }>
                    { (chroma, i) => {
                        const degree = i()
                        const chromaCMajor = Theory.Utils.degreeToChromaInCMajor(degree)
                        const accidental = chroma - chromaCMajor
                        const accidentalStr = Theory.Utils.accidentalToStr(accidental)

                        return <div style={{
                            display: "inline-block",
                            width: "1.25em",
                            "margin-right": "1em",
                            "text-align": "right",
                            color:
                                accidental > 0 ? "#f88" :
                                accidental < 0 ? "#88f" :
                                undefined,
                        }}>
                            { `${accidentalStr}${(degree + 1).toString()} ` }
                        </div>
                    }}
                </Solid.For>
            </span>
        </ScaleButton>
    }


    return <>
        <h2>Key Change</h2>

        <Layout>

            <svg width="12em" height="12em" viewBox="-100 -100 201 201">
                <Solid.For each={ [0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1] }>
                    { (index, i) => makeTonicButton(index) }
                </Solid.For>
            </svg>

            <ScaleList>
                <Solid.For each={ Theory.Scale.list }>
                    { (scaleMeta, i) => makeScaleOption2(scaleMeta) }
                </Solid.For>
            </ScaleList>

            {/*<StyledSelect
                value={ scale.id }
                onChange={ ev => applyScale(ev.target.value) }
            >
                <button><selectedcontent></selectedcontent></button>
                <Solid.For each={ Theory.Scale.list }>
                    { (scaleMeta, i) => makeScaleOption(scaleMeta) }
                </Solid.For>
            </StyledSelect>*/}

        </Layout>
    </>
}


const Layout = styled.div`
    display: grid;
    grid-template: auto / auto auto;
    justify-content: center;
    column-gap: 1em;
`


const CircleOfFifthsPath = styled.path<{
    $selected: boolean,
}>`
    cursor: pointer;
    fill: #444;

    &:hover {
        fill: #666;
    }

    ${ props => props.$selected ? "fill: #06a;" : "" }
`


const ScaleList = styled.div`
    width: 20em;
    height: 15em;
    overflow-x: hidden;
    overflow-y: auto;
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

    width: 100%;
    margin: 0.25em;
    padding: 0.25em;
    border-radius: 0.25em;
    background-color: #444;

    &:hover {
        background-color: #666;
    }
        
    ${ props => props.$selected ? "background-color: #06a;" : "" }
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