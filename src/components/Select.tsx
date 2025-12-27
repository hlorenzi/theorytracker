import * as Solid from "solid-js"
import { styled } from "solid-styled-components"


export function Select(props: {
    children?: Solid.JSXElement,
    label?: Solid.JSXElement,
    value?: string,
    onChange?: (newValue: string) => void,
})
{
    return <StyledSelect
        value={ props.value }
        onChange={ ev => props.onChange?.(ev.target.value) }
    >
        <button>{ props.label }<selectedcontent></selectedcontent></button>
        { props.children }
    </StyledSelect>
}


const StyledSelect = styled.select<{
}>`
    appearance: base-select;
    
    &::picker(select) {
        /*appearance: base-select;*/
        border: 0;
        border-radius: var(--theme-buttonBorderRadius);
        background-color: var(--theme-buttonBkg);
        color: inherit;
        font-family: inherit;
        font-size: inherit;
    }

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
`
//${ props => props.$checked ? "background-color: var(--theme-buttonBkgSelected);" : "" }