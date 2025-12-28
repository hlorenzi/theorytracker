import * as Solid from "solid-js"
import { styled } from "solid-styled-components"


let currentDraggedGroupId: string | undefined = undefined
let currentDraggedValue: boolean = false


Solid.createRoot(() => {
    const onMouseUp = () => {
        currentDraggedGroupId = undefined
    }

    window.addEventListener("mouseup", onMouseUp)
    Solid.onCleanup(() => {
        window.removeEventListener("mouseup", onMouseUp)
    })
})


export function TrackButton(props: {
    children?: Solid.JSXElement,
    style?: Solid.JSX.CSSProperties,
    label?: Solid.JSXElement,
    disabled?: boolean,
    checked?: boolean,
    groupId?: string,
    onSet?: (newValue: boolean) => void,
})
{
    const onMouseDown = Solid.createMemo(() => (ev: MouseEvent) => {
        const newValue = !props.checked
        props.onSet?.(newValue)
        currentDraggedGroupId = props.groupId
        currentDraggedValue = newValue
        ev.stopPropagation()
    })

    const onMouseEnter = Solid.createMemo(() => (ev: MouseEvent) => {
        if (currentDraggedGroupId === undefined ||
            currentDraggedGroupId !== props.groupId)
            return

        if (props.checked === currentDraggedValue)
            return
        
        props.onSet?.(currentDraggedValue)
        ev.stopPropagation()
    })

    const onMouseUp = (ev: MouseEvent) => {
        currentDraggedGroupId = undefined
        ev.stopPropagation()
    }

    return <StyledButton
        data-checked={ !!props.checked }
        onMouseDown={ onMouseDown() }
        onMouseEnter={ onMouseEnter() }
        onMouseUp={ onMouseUp }
        disabled={ !!props.disabled }
        style={ props.style }
    >
        { props.label ?? props.children }
    </StyledButton>
}


const StyledButton = styled.button<{
    "data-checked": boolean,
}>`
    display: inline-block;
    justify-self: stretch;
    align-self: center;
    user-select: none;
    cursor: pointer;

    margin: 0;
    padding: 0.05em 0.05em;
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
`