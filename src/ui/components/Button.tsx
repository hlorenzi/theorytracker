import * as Solid from "solid-js"
import { styled } from "solid-styled-components"


export function Button(props: {
    children?: Solid.JSXElement,
    style?: Solid.JSX.CSSProperties,
    label?: Solid.JSXElement,
    disabled?: boolean,
    checked?: boolean,
    onClick?: () => void,
    groupStart?: boolean,
    groupMiddle?: boolean,
    groupEnd?: boolean,
})
{
    return <StyledButton
        data-checked={ !!props.checked }
        data-group-start={ !!props.groupStart }
        data-group-middle={ !!props.groupMiddle }
        data-group-end={ !!props.groupEnd }
        onClick={ props.onClick }
        disabled={ !!props.disabled }
        style={ props.style }
    >
        { props.label ?? props.children }
    </StyledButton>
}


const StyledButton = styled.button<{
    "data-checked": boolean,
    "data-group-start": boolean,
    "data-group-middle": boolean,
    "data-group-end": boolean,
}>`
    display: inline-block;
    justify-self: stretch;
    align-self: center;
    user-select: none;
    cursor: pointer;

    margin: 0.25em;
    padding: 0.25em 0.5em;
    border: 0;
    border-radius: var(--theme-buttonBorderRadius);
    background-color: var(--theme-buttonBkg);
    color: inherit;
    font-family: inherit;
    font-size: inherit;

    &:hover {
        background-color: var(--theme-buttonBkgHover);
    }

    &:active {
        background-color: var(--theme-buttonBkgPress);
    }

    &:disabled {
        background-color: var(--theme-buttonBkgPress);
        opacity: 0.5;
        cursor: inherit;
    }

    &[data-checked=true] {
        background-color: var(--theme-buttonBkgSelected);
    }

    &[data-group-start=true] {
        margin-left: 0.25em;
        margin-right: 0;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    }
        
    &[data-group-middle=true] {
        margin-left: 0;
        margin-right: 0;
        border-radius: 0;
    }

    &[data-group-end=true] {
        margin-left: 0;
        margin-right: 0.25em;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
`