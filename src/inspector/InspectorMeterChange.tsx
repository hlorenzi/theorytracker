import * as Solid from "solid-js"
import * as Global from "../state.ts"
import * as Inspector from "./index.ts"
import * as Project from "../project"
import * as Timeline from "../timeline"
import * as Theory from "../theory"
import { Button, Select, TextInput } from "../components"
import Rect from "../utils/rect.ts"
import { styled } from "solid-styled-components"


export function InspectorMeterChange(props: {
    value: Project.MeterChange,
    upsertElem: (newValue: Project.MeterChange) => void,
})
{
    const [currMeter, setCurrMeter] = Solid.createSignal(props.value.meter)


    const applyMeter = (meter: Theory.Meter) => {
        setCurrMeter(meter)
        const project = Global.get().project
        const tempoCh = Project.getTypedElem(project.root, props.value.id, "meterChange")
        if (tempoCh)
            props.upsertElem({...tempoCh, meter })
    }


    const parseNumerator = (str: string, index: number) => {
        let numerator = parseInt(str)
        if (!isFinite(numerator))
            return

        numerator = Math.max(1, Math.min(64, numerator))
        applyMeter(currMeter().withNumerator(index, numerator))
    }


    const parseDenominator = (str: string, index: number) => {
        let denominator = parseInt(str)
        if (!isFinite(denominator))
            return

        denominator = Math.max(1, Math.min(64, denominator))
        applyMeter(currMeter().withDenominator(index, denominator))
    }


    const addAlternating = () => {
        applyMeter(currMeter().withAddedRatio())
    }


    const removeAlternating = (index: number) => {
        applyMeter(currMeter().withRemovedRatio(index))
    }


    return <>
        <Layout>
            <h2 style={{ "grid-column": "1 / -1" }}>Meter Change</h2>

            <Solid.Index each={ currMeter().ratios }>
            { (ratio, index) =>
                <div>
                    <TextInput
                        value={ ratio().numerator.toString() }
                        onChange={ str => parseNumerator(str, index) }
                        width="4em"
                    />
                    { " / " }
                    <Select
                        value={ ratio().denominator.toString() }
                        onChange={ str => parseDenominator(str, index) }
                        width="4em"
                    >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="4">4</option>
                        <option value="8">8</option>
                        <option value="16">16</option>
                        <option value="32">32</option>
                        <option value="64">64</option>
                    </Select>
                    <Button
                        label="🗙"
                        onClick={ () => removeAlternating(index) }
                        disabled={ index === 0 }
                    />
                </div>
            }
            </Solid.Index>
            <Solid.Show when={ currMeter().ratios.length < 4 }>
                <Button
                    label="+ Alternating Measure"
                    onClick={ addAlternating }
                />
            </Solid.Show>

        </Layout>
    </>
}


const Layout = styled.div`
    display: grid;
    grid-template: repeat(5, auto) / auto;
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