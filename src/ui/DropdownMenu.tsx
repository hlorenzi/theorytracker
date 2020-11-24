import React from "react"


interface DropdownMenuProps
{
    selected: any

    items:
    {
        label: any
        value: any
    }[]

    onChange: (item: any, index: number) => void

    style?: any
}


export function DropdownMenu(props: DropdownMenuProps)
{
    //const selectedIndex = props.items.findIndex(i => i.value == props.selected)


    return <select
        value={ props.selected }
        onChange={ ev => props.onChange(props.items[ev.target.selectedIndex], ev.target.selectedIndex) }
        style={{
            display: "grid",
            gridTemplate: "auto / auto",
            gridAutoFlow: "row",

            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #888",
            padding: "0.25em 0.75em",
            fontFamily: "inherit",

            minWidth: 0,
            minHeight: 0,
            maxWidth: "max-content",
            maxHeight: "max-content",

            ...props.style,
    }}>

        { props.items.map((item, i) =>
            <option
                key={ i }
                value={ item.value }
            >

                { item.label }

            </option>
        )}

    </select>
}