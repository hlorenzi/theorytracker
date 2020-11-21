import React from "react"
import styled from "styled-components"
import "../types"


interface StyledListBoxItemProps
{
    readonly selected: boolean
}


const StyledListBoxItem = styled.button<StyledListBoxItemProps>`
    width: 100%;
    border: 0;
    padding: 0.25em 0.5em;
    text-align: left;
    font-family: inherit;
    color: #fff;
    background-color: ${ props => props.selected ? "#08f" : "#000" };
`


export interface ListBoxProps
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


export function ListBox(props: ListBoxProps)
{
    //const selectedIndex = props.items.findIndex(i => i.value == props.selected)
    const [columns, setColumns] = React.useState(1)
    const refDiv = React.useRef<HTMLDivElement>(null!)


    const itemsRendered = React.useMemo(() =>
    {
        return props.items.map((item, i) =>
            <StyledListBoxItem
                key={ i }
                onClick={ () => props.onChange(item, i) }
                selected={ props.selected == item.value }
            >

                { item.label }

            </StyledListBoxItem>
        )

    }, [props.items, props.selected])


    React.useLayoutEffect(() =>
    {
        const resizeObserver = new ResizeObserver(entries =>
        {
            for (const entry of entries)
            {
                const newColumns = Math.max(1, Math.floor(entry.contentRect.width / 150))
                setColumns(newColumns)
                break
            }
        })

        resizeObserver.observe(refDiv.current)
        return () => resizeObserver.unobserve(refDiv.current)

    }, [refDiv.current])
    

    return <div ref={ refDiv } style={{
        backgroundColor: "#000",
        color: "#fff",
        border: "1px solid #888",
        overflowY: "auto",
    }}>
        <div
            style={{
                display: "grid",
                gridTemplate: "repeat(" + Math.ceil(props.items.length / columns) + ", auto) / repeat(" + columns + ", 1fr)",
                gridAutoFlow: "column",

                margin: 0,
                padding: 0,

                minWidth: 0,
                minHeight: 0,

                justifyItems: "stretch",

                ...props.style,
        }}>
            { itemsRendered }
        </div>
    </div>
}