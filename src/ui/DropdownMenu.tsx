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
    const hasDefinite = props.selected !== null


    return <select
        value={ props.selected }
        onChange={ ev =>
        {
            if (!hasDefinite && ev.target.selectedIndex == 0)
                return

            const index = ev.target.selectedIndex - (hasDefinite ? 0 : 1)
            props.onChange(props.items[index], index)
        }}
        style={{
            display: "grid",
            gridTemplate: "auto / auto",
            gridAutoFlow: "row",

            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #888",
            padding: "0.25em 0.25em",
            fontFamily: "inherit",

            minWidth: 0,
            minHeight: 0,
            maxWidth: "max-content",
            maxHeight: "max-content",

            ...props.style,
    }}>

        { hasDefinite ? null :
            <option
                value={ "" }
            >
                ---
            </option>
        }

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