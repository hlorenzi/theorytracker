import React from "react"


interface PopupButtonProps
{
    text: string
    onClick?: (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}


export default function PopupButton(props: PopupButtonProps)
{
    return <button
        className="popupButton"
        onClick={ props.onClick }
        style={{
            //backgroundColor: "#111",
            border: "0px",
            padding: "0.5em 1em",
            outline: "none",

            textAlign: "left",
            fontFamily: "inherit",
            color: "#fff",
    }}>
		{ props.text }
    </button>
}