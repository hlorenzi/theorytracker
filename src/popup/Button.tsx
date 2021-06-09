import React from "react"
import Rect from "../util/rect"
import { Root } from "./Root"
import * as Popup from "./index"
import * as Command from "../command"


interface PopupButtonProps
{
    command?: Command.Command
    icon?: any
    label?: any
    onClick?: (ev: React.MouseEvent) => void
    children?: any
}


export function Button(props: PopupButtonProps)
{
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const popupRootCtx = Popup.usePopupRoot()
    const [rect, setRect] = React.useState(new Rect(0, 0, 0, 0))

    const index = popupRootCtx.itemIndex
    popupRootCtx.itemIndex++

    React.useLayoutEffect(() =>
    {
        const buttonCurrent = buttonRef.current
        if (!buttonCurrent)
            return

        const rect = buttonCurrent.getBoundingClientRect()
        setRect(new Rect(rect.x, rect.y - 1 - rect.height, rect.width, rect.height))

    }, [])

    React.useEffect(() =>
    {
        const buttonCurrent = buttonRef.current
        if (!buttonCurrent)
            return

        const onEnter = () =>
        {
            console.log("openSubPopup", index)
            popupRootCtx.openSubPopup(buttonCurrent)
        }

        const onLeave = () =>
        {
        }

        buttonCurrent.addEventListener("mouseenter", onEnter)
        buttonCurrent.addEventListener("mouseleave", onLeave)

        return () =>
        {
            buttonCurrent.removeEventListener("mouseenter", onEnter)
            buttonCurrent.removeEventListener("mouseleave", onLeave)
        }

    }, [])

    const onClick = (ev: React.MouseEvent) =>
    {
        if (props.onClick)
        {
            props.onClick(ev)
            Popup.global.elem = null
            Popup.notifyObservers()
        }
        else if (props.command)
        {
            props.command.func({})
            Popup.global.elem = null
            Popup.notifyObservers()
        }
        else
        {
            ev.preventDefault()
            ev.stopPropagation()
        }
    }

    const label = props.label || props.command?.name
    const icon = props.icon || props.command?.icon

    let shortcutStr = ""
    if (props.command && props.command.shortcut)
    {
        if (!props.command.isShortcutAvailable || props.command.isShortcutAvailable())
        {
            const shortcut = props.command.shortcut[0]

            if (shortcut.ctrl)
                shortcutStr += "Ctrl+"

            if (shortcut.shift)
                shortcutStr += "Shift+"

            shortcutStr += shortcut.key.toUpperCase()
        }
    }

    console.log("button", index, "isOpen", !buttonRef.current || !props.children || popupRootCtx.curSubPopup !== buttonRef.current, rect)

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
            { icon }
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
            { label }
        </div>

        <div style={{
            border: "0px",
            padding: "0.5em 0.5em 0.5em 0.5em",

            textAlign: "right",
            fontFamily: "inherit",
            color: "#fff",
            pointerEvents: "none",

            gridRow: index,
            gridColumn: 3,
            alignSelf: "center",
        }}>
            { !props.children ? shortcutStr : "▶" }
        </div>

        { !buttonRef.current || !props.children || popupRootCtx.curSubPopup !== buttonRef.current ? null :
            <Root isSub={ true } rect={ rect }>
                { props.children }
            </Root>
        }
    </>
}