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


export interface InputProps
{
    type?: string,
    value?: string,
    onChange?: (newValue: string) => void
    style?: React.HTMLAttributes<HTMLInputElement>
}


export function Input(props: InputProps)
{
    return <StyledInput
        type={ props.type ?? "text" }
        value={ props.value ?? "" }
        onChange={ ev => props.onChange?.(ev.target.value) }
        style={{
            ...props.style,
    }}/>
}