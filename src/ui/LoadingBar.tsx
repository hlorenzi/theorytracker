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


export function LoadingBar()
{
    return <div style={{
        position: "absolute",
        width: "100%",
        height: "8px",
        zIndex: 1,
    }}>
        <DivLoadingBar
            thickness={ 8 }
            size={ 20 }
            color1="#444"
            color2="#888"
        />
    </div>
}