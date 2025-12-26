import * as Solid from "solid-js"
import { styled } from "solid-styled-components"


export function Checkbox(props: {
    children?: Solid.JSXElement,
    label?: Solid.JSXElement,
    checked?: boolean,
    onChange?: (newValue: boolean) => void,
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
        onClick={ () => props.onChange?.(!props.checked) }
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

    &:hover {
        background-color: var(--theme-buttonBkgHover);
    }

    &:active {
        background-color: var(--theme-buttonBkgPress);
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
//${ props => props.$checked ? "background-color: var(--theme-buttonBkgSelected);" : "" }