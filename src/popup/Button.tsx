import React from "react"
import Rect from "../util/rect"
import { Root } from "./Root"
import { usePopupRoot } from "./popupContext"


interface PopupButtonProps
{
    icon?: any
    label: any
    onClick?: (ev: React.MouseEvent) => void
    children?: any
}


export function Button(props: PopupButtonProps)
{
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const popupRootCtx = usePopupRoot()
    const [rect, setRect] = React.useState(new Rect(0, 0, 0, 0))

    const index = popupRootCtx.itemIndex
    popupRootCtx.itemIndex++

    React.useEffect(() =>
    {
        if (!buttonRef.current)
            return

        const rect = buttonRef.current.getBoundingClientRect()
        setRect(new Rect(rect.x, rect.y - 1, rect.width, rect.height))

        const onEnter = () =>
        {
            popupRootCtx.openSubPopup(buttonRef.current)
        }

        const onLeave = () =>
        {
        }

        buttonRef.current!.addEventListener("mouseenter", onEnter)
        buttonRef.current!.addEventListener("mouseleave", onLeave)

        return () =>
        {
            buttonRef.current!.removeEventListener("mouseenter", onEnter)
            buttonRef.current!.removeEventListener("mouseleave", onLeave)
        }

    }, [])

    const onClick = (ev: React.MouseEvent) =>
    {
        if (props.onClick)
        {
            props.onClick(ev)
        }
        else
        {
            ev.preventDefault()
            ev.stopPropagation()
        }
    }

    return <>
        <button
            ref={ buttonRef }
            className="popupButton"
            onClick={ onClick }
            style={{
                border: "0px",
                padding: "0.5em 1em",
                outline: "none",

                gridRow: index,
                gridColumn: "1 / 4",
        }}>
        </button>

        <div style={{
            border: "0px",
            padding: "0.25em 0.25em 0.25em 0.5em",

            textAlign: "left",
            fontFamily: "inherit",
            fontSize: "1.25em",
            color: "#fff",
            pointerEvents: "none",

            gridRow: index,
            gridColumn: 1,
            alignSelf: "center",
        }}>
            { props.icon }
        </div>

        <div style={{
            border: "0px",
            padding: "0.5em 0.5em 0.5em 0.5em",

            textAlign: "left",
            fontFamily: "inherit",
            color: "#fff",
            pointerEvents: "none",

            gridRow: index,
            gridColumn: 2,
            alignSelf: "center",
        }}>
            { props.label }
        </div>

        <div style={{
            border: "0px",
            padding: "0.5em 0.5em 0.5em 0.5em",

            textAlign: "left",
            fontFamily: "inherit",
            color: "#fff",
            pointerEvents: "none",

            gridRow: index,
            gridColumn: 3,
            alignSelf: "center",
        }}>
            { !props.children ? "" : "▶" }
        </div>

        { !buttonRef.current || !props.children || popupRootCtx.curSubPopup !== buttonRef.current ? null :
            <Root isSub={ true } rect={ rect }>
                { props.children }
            </Root>
        }
    </>
}