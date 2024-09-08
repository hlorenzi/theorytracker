import React from "react"


interface DropdownMenuProps
{
    selected: any

    items:
    {
        label: string
        value?: any
        subitems?:
        {
            label: string
            value: any
        }[]
    }[]

    onChange?: (item: any, index: number) => void

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

            const selectedIndex = ev.target.selectedIndex - (hasDefinite ? 0 : 1)

            let itemIndex = 0
            for (const item of props.items)
            {
                if (item.subitems)
                {
                    for (const subitem of item.subitems)
                    {
                        if (itemIndex == selectedIndex)
                        {
                            props.onChange?.(subitem, selectedIndex)
                        }
                        itemIndex++
                    }
                }
                else
                {
                    if (itemIndex == selectedIndex)
                    {
                        props.onChange?.(item, selectedIndex)
                    }
                    itemIndex++
                }
            }

        }}
        style={{
            display: "inline-block",

            backgroundColor: "#000",
            color: "#fff",
            border: "1px solid #888",
            padding: "0.25em 0.25em",
            fontFamily: "inherit",

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
            item.subitems ?
                <optgroup key={ i } label={ item.label }>
                    { item.subitems.map((item2, j) =>
                        <option
                            key={ j }
                            value={ item2.value }
                        >

                            { item2.label }

                        </option>
                    )}
                </optgroup>
            :
                <option
                    key={ i }
                    value={ item.value }
                >
                    { item.label }
                </option>
        )}

    </select>
}