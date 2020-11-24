import React from "react"


interface ButtonListProps
{
    column?: boolean
    multiple?: boolean
    selected: any

    items:
    {
        label: any
        value: any
        bkgColor?: string
        width?: string
    }[]

    onChange: (item: any, index: number) => void
}


export function ButtonList(props: ButtonListProps)
{
    const isSelected = (value: any) =>
    {
        if (props.multiple && Array.isArray(props.selected))
            return props.selected.some(v => v == value)
        else
            return props.selected == value
    }


    return <div style={{
        display: "grid",
        gridTemplate: "auto / auto",
        gridAutoFlow: props.column ? "row" : "column",

        maxWidth: "min-content",
        maxHeight: "min-content",
        minWidth: 0,
        minHeight: 0,

        backgroundColor: "#000",
    }}>

        { props.items.map((item, i) =>
            <button
                key={ i }
                onClick={ () => props.onChange(item, i) }
                style={{
                    border: "1px solid #888",
                    borderTop: (!props.column || i == 0 ? "1px solid #888" : 0),
                    borderLeft: (props.column || i == 0 ? "1px solid #888" : 0),
                    backgroundColor: (isSelected(item.value) ? item.bkgColor || "#444" : "#000"),
                    color: "#fff",
                    fontFamily: "inherit",
                    padding: item.width ? "0.25em 0" : "0.25em 0.75em",
                    width: item.width,
            }}>

                { item.label }

            </button>
        )}

    </div>
}