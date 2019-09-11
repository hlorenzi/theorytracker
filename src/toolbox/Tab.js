import React from "react"


export default function Tab(props)
{
    const border = "1px solid #ccc"

	return <>
        <div style={{
            ...props.style,
        }}>
            { props.options.map(option =>
                <div key={ option.value } onClick={ () => props.onChange(option.value) } style={{
                    display: (props.vertical ? "block" : "inline-block"),
                    borderRadius: "0.25em",
                    border: (props.current === option.value ? border : "1px solid transparent"),
                    padding: "0.1em 1em",
                    userSelect: "none",
                    cursor: "pointer",
                }}>
                    { option.render }
                </div>
            )}
        </div>
    </>
}