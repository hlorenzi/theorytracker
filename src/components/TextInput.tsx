import * as Solid from "solid-js"
import { styled } from "solid-styled-components"


export function TextInput(props: {
    children?: Solid.JSXElement,
    labelBefore?: Solid.JSXElement,
    labelAfter?: Solid.JSXElement,
    value?: string,
    onChange?: (newValue: string) => void,
    width?: string,
})
{
    return <Layout>
        { props.labelBefore }
        <StyledInput
            value={ props.value }
            onChange={ ev => props.onChange?.(ev.target.value) }
            onBlur={ ev => props.onChange?.(ev.target.value) }
            style={{
                width: props.width,
        }}/>
        { props.labelAfter }
    </Layout>
}


const Layout = styled.div<{
}>`
    display: inline-block;
    justify-self: stretch;
    align-self: center;
    user-select: none;

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
`


const StyledInput = styled.input<{
}>`
    display: inline-block;
    justify-self: stretch;
    align-self: stretch;

    margin: 0 0.05em;
    padding: 0.25em 0.5em;
    border: 0;
    border-radius: var(--theme-buttonBorderRadius);
    background-color: var(--theme-buttonBkgPress);
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    outline: 0;
`