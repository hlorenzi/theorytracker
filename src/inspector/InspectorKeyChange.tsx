import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Inspector from "./index.ts"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Theory from "../theory"
import Rect from "../utils/rect.ts"
import { styled } from "solid-styled-components"


export function InspectorKeyChange(props: {
    value: Project.KeyChange,
    upsertElem: (newValue: Project.KeyChange) => void,
})
{
    const [currKey, setCurrKey] = Solid.createSignal(props.value.key)
    const circleOfFifthsOffset = Solid.createMemo(() => currKey().scale.metadata?.circleOfFifthsOffset ?? 0)
    let needsScaleScroll = true


    const applyKey = (key: Theory.Key) => {
        setCurrKey(key)
        const project = Global.get().project
        const keyCh = Project.getTypedElem(project.root, props.value.id, "keyChange")
        if (keyCh)
            props.upsertElem({...keyCh, key })
    }


    const applyTonic = (tonic: Theory.PitchName) => {
        const project = Global.get().project
        const keyCh = Project.getTypedElem(project.root, props.value.id, "keyChange")
        if (keyCh)
        {
            const key = new Theory.Key(tonic, keyCh.key.scale)
            applyKey(key)
        }
    }


    const applyScale = (scaleId: string) => {
        const project = Global.get().project
        const scale = Theory.Scale.fromId(scaleId)
        const keyCh = Project.getTypedElem(project.root, props.value.id, "keyChange")
        if (keyCh)
        {
            const key = new Theory.Key(keyCh.key.tonic, scale)
            applyKey(key)
        }
    }

    
    const makeTonicButton = Solid.createMemo(() => (circleOfFifthsIndex: number) => {
        const letter = Theory.Utils.circleOfFifthsToLetter(circleOfFifthsIndex + circleOfFifthsOffset())
        const accidental = Theory.Utils.circleOfFifthsToAccidental(circleOfFifthsIndex + circleOfFifthsOffset())
        const letterStr = Theory.Utils.letterToStr(letter)
        const accidentalStr = Theory.Utils.accidentalToStr(accidental)
        const pitchName = new Theory.PitchName(letter, accidental)

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
                onClick={ () => applyTonic(pitchName) }
                fill="#444"
                $selected={ currKey().tonic.chroma === pitchName.chroma }
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
    })


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


    const makeScaleOption2 = Solid.createMemo(() => (scaleMeta: Theory.ScaleMetadata) => {
        const isSelected = scaleMeta.id === currKey().scale.id
        let button: HTMLButtonElement | undefined = undefined
        
        Solid.createEffect(() => {
            if (needsScaleScroll && isSelected && button)
            {
                (button as HTMLButtonElement).scrollIntoView({ behavior: "instant", block: "center" })
                needsScaleScroll = false
            }
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
    })


    return <>
        <Layout>
            <h2 style={{ "grid-column": "1 / -1" }}>Key Change</h2>

            <svg width="12em" height="12em" viewBox="-100 -100 201 201">
                { [0, 1, 2, 3, 4, 5, 6, -5, -4, -3, -2, -1].map(
                    (index, i) => makeTonicButton()(index)
                )}
            </svg>

            <ScaleList>
                { Theory.Scale.list.map(
                    (scaleMeta, i) => makeScaleOption2()(scaleMeta)
                )}
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