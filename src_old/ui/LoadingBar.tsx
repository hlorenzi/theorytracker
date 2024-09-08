import React from "react"
import styled, { keyframes } from "styled-components"


const loadingBarKeyframes = keyframes`
    0%
    {
        transform: translate(-320px, 0);
        /*background-position-x: -80px;*/
    }
    100%
    {
        transform: translate(-240px, 0);
        /*background-position-x: 0px;*/
    }
`


interface LoadingBarStyleProps
{
    thickness: number
    size: number
    color1: string
    color2: string
}


const DivLoadingBar = styled.div<LoadingBarStyleProps>`
    position: relative;
    width: 200%;
    height: ${ props => props.thickness }px;
    outline: none;
    background-color: transparent;
    background-size: calc(100% + 640px) 100%;
    background-repeat: repeat;
    background-image: repeating-linear-gradient(-30deg,
        ${ props => props.color1 },
        ${ props => props.color1 } ${ props => props.size }px,
        ${ props => props.color2 } ${ props => props.size + 1 }px,
        ${ props => props.color2 } ${ props => props.size * 2 - 1}px,
        ${ props => props.color1 } ${ props => props.size * 2 }px);
    animation-name: ${ loadingBarKeyframes };
    animation-duration: 0.75s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
`


export interface LoadingBarProps
{
    floating?: boolean
    progress?: number
}


export function LoadingBar(props: LoadingBarProps)
{
    const clipProgress = 100 * (props.progress === undefined ? 1 : props.progress)
    const clipPath =
        "polygon(0% -10%, "
        + clipProgress + "% -10%, "
        + clipProgress + "% 100%, " +
        "0% 100%)"

    if (props.floating)
    {
        return <div style={{
            position: "absolute",
            width: "100%",
            height: "8px",
            zIndex: 1,
            overflow: "hidden",
            clipPath,
        }}>
            <DivLoadingBar
                thickness={ 8 }
                size={ 20 }
                color1="#444"
                color2="#888"
            />
        </div>
    }
    else
    {
        return <div style={{
            width: "100%",
            height: "8px",
            zIndex: 1,
            overflow: "hidden",
            backgroundColor: "#000",
            border: "1px solid #888",
        }}>
            <div style={{
                width: "100%",
                height: "8px",
                overflow: "hidden",
                clipPath,
            }}>
                <DivLoadingBar
                    thickness={ 8 }
                    size={ 20 }
                    color1="#444"
                    color2="#888"
                />
            </div>
        </div>
    }
}