import React from "react"
import styled from "styled-components"


const StyledInput = styled.input`
    background-color: transparent;
    color: #fff;
    border: 1px solid #888;
    border-radius: 0.5em;
    margin: 0 0.5em;
    padding: 0.5em 0.5em;
`


export interface DialProps
{
    label?: string
    getValue?: () => number
    onChange?: (newValue: number) => void
}


export function Dial(props: DialProps)
{
    const value = props.getValue?.() ?? 0
    const [update, setUpdate] = React.useState(false)

    /*
    const angle1 = (180 + 45) / 180 * Math.PI
    const angle3 = (-45) / 180 * Math.PI
    const angle2 = angle1 + (angle3 - angle1) * value
    const size = 45
    const arcX1 = 50 + Math.cos(angle1) * size
    const arcY1 = 50 - Math.sin(angle1) * size
    const arcX2 = 50 + Math.cos(angle2) * size
    const arcY2 = 50 - Math.sin(angle2) * size
    const arcX3 = 50 + Math.cos(angle3) * size
    const arcY3 = 50 - Math.sin(angle3) * size
    */

    const y1 = 90
    const y2 = 90 - 80 * value
    const y3 = 10


    const refSvg = React.useRef<HTMLDivElement>(null)
    const refState = React.useRef({
        mouseDown: false,
        mouseY: 0,
        valueOrig: value,
    })


    React.useEffect(() =>
    {
        const onMouseDown = (ev: MouseEvent) =>
        {
            ev.preventDefault()
            refState.current.mouseDown = true
            refState.current.mouseY = ev.screenY
            refState.current.valueOrig = props.getValue?.() ?? 0
        }

        const onMouseMove = (ev: MouseEvent) =>
        {
            if (!refState.current.mouseDown)
                return
            
            ev.preventDefault()
            
            const newValue =
                refState.current.valueOrig +
                (refState.current.mouseY - ev.screenY) / 100

            props.onChange?.(newValue)
            setUpdate((val) => !val)
        }

        const onMouseUp = (ev: MouseEvent) =>
        {
            refState.current.mouseDown = false
        }

        const refSvgCurrent = refSvg.current
        if (!refSvgCurrent)
            return

        refSvgCurrent.addEventListener("mousedown", onMouseDown)
        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)

        return () =>
        {
            refSvgCurrent.removeEventListener("mousedown", onMouseDown)
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
        }

    }, [])



    return <div
        ref={ refSvg }
        style={{
            cursor: "crosshair",
            zIndex: 100,
            pointerEvents: "auto",
    }}>
        <svg
            viewBox="0 0 100 100"
            style={{
                width: "2em",
                height: "2em",
                margin: "0.05em 0.05em",
        }}>
            <path fill="none" stroke="#888" strokeWidth={12} d={`
                M 10 ${y1}
                L 10 ${y3}
            `}/>
            <path fill="none" stroke="#0f0" strokeWidth={12} d={`
                M 10 ${y1}
                L 10 ${y2}
            `}/>

            <text
                x={ 60 }
                y={ 30 }
                fill="#fff"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="system-ui"
                fontSize="2.5em"
            >
                { props.label }
            </text>

            <text
                x={ 60 }
                y={ 70 }
                fill="#fff"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="system-ui"
                fontSize="2.5em"
            >
                { Math.floor(value * 100) }
            </text>

            {/*<path fill="none" stroke="#888" strokeWidth={6} d={`
                M 50,50
                A ${arcX1} ${arcY1} 0 1 0 ${arcX3} ${arcY3}
            `}/>
            <path fill="none" stroke="#0f0" strokeWidth={6} d={`
                M 50,50
                A ${arcX1} ${arcY1} 0 1 0 ${arcX2} ${arcY2}
            `}/>*/}
        </svg>
    </div>
}