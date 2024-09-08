import React from "react"


interface ButtonProps
{
    label: any
    onClick?: () => void
    disabled?: boolean
}


export function Button(props: ButtonProps)
{
    return <button
        onClick={ props.onClick }
        disabled={ props.disabled }
        style={{
            cursor: "pointer",
            border: "1px solid #888",
            backgroundColor: "#000",
            color: "#fff",
            fontFamily: "inherit",
            padding: "0.25em 0.75em",
    }}>

        { props.label }

    </button>
}