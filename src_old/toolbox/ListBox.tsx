import React from "react"


interface ListBoxProps
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


export default function ListBox(props: ListBoxProps)
{
    //const selectedIndex = props.items.findIndex(i => i.value == props.selected)


    return <div style={{
        backgroundColor: "#000",
        color: "#fff",
        border: "1px solid #888",
        overflowY: "auto",
    }}>
        <div
            style={{
                display: "grid",
                gridTemplate: "auto / auto",
                gridAutoFlow: "row",

                margin: 0,
                padding: 0,

                minWidth: 0,
                minHeight: 0,

                justifyItems: "stretch",

                ...props.style,
        }}>

            { props.items.map((item, i) =>
                <button
                    key={ i }
                    value={ item.value }
                    onClick={ () => props.onChange(item, i) }
                    style={{
                        width: "100%",
                        border: 0,
                        padding: "0.25em 0.5em",
                        textAlign: "left",
                        fontFamily: "inherit",
                        color: "#fff",
                        backgroundColor: props.selected == item.value ? "#08f" : "#000",
                }}>

                    { item.label }

                </button>
            )}

        </div>
    </div>
}