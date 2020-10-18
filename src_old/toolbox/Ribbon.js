import React from "react"


function Tab(props)
{
    return null
}


function FixedTab(props)
{
    return null
}


function Group(props)
{
    return null
}


function CustomGroup(props)
{
    return null
}


function TallBox(props)
{
    return null
}


function SlotLayout(props)
{
    if (props.tall)
    {
        const iconSize = (typeof props.icon === "string" ? "3em" : undefined)

        return <>
            <div style={{
                display: "grid",
                gridTemplate: "1fr 0.25em auto / 1fr",
                height: "100%",
                padding: "0 0.5em",
                boxSizing: "border-box",
                alignItems: "center",
                justifyItems: "center",
                justifySelf: "center",
            }}>
                <div style={{ gridRow: 1, gridColumn: 1, fontSize: iconSize }}>{ props.icon }</div>
                <div style={{ gridRow: 3, gridColumn: 1, padding: "0.15em 0", }}>{ props.label }</div>
            </div>
        </>
    }
    else
    {
        const iconSlotWidth = (props.icon ? "auto" : "0")
        const sepSlotWidth = (props.icon ? "0.25em" : "0")
        const iconSize = (typeof props.icon === "string" ? "1.15em" : undefined)

        return <>
            <div style={{
                display: "grid",
                gridTemplate: "1fr / " + iconSlotWidth + " " + sepSlotWidth + " 1fr",
                height: "100%",
                padding: "0 0.5em",
                boxSizing: "border-box",
                alignItems: "center",
                justifyContent: "start",
                justifyItems: "center",
                justifySelf: "center",
                textAlign: "center",
            }}>
                <div style={{ gridRow: 1, gridColumn: 1, alignSelf: "center", minWidth: "1.5em", fontSize: iconSize, }}>{ props.icon }</div>
                <div style={{ gridRow: 1, gridColumn: 3, justifySelf: "start", }}>{ props.label }</div>
            </div>
        </>
    }
}


function Slot(props)
{
    const baseStyle =
    {
        borderRadius: "0.5em",
        boxSizing: "border-box",
    }

    const className =
        (props.supressClass ? "" : "ribbonSlot") + " " +
        (props.selected ? "ribbonButtonSelected" : "")

    if (props.tall)
    {
        return <>
            <div className={ className } onClick={ props.onClick } style={{
                ...baseStyle,
                gridRow: "1 / 4",
            }}>
                { props.children }
            </div>
        </>
    }
    else
    {
        return <>
            <div className={ className } onClick={ props.onClick } style={{
                ...baseStyle,
                textAlign: "left",
            }}>
                { props.children }
            </div>
        </>
    }
}


function Button(props)
{
    const className =
        "ribbonButton " +
        (props.selected ? "ribbonButtonSelected" : "")

    return <>
        <button
            className={ className }
            onClick={ props.onClick }
            style={{
                display: "inline-block",
                width: (props.expand ? "100%" : undefined),
                height: (props.expand ? "100%" : undefined),
                border: 0,
                borderRadius: "0.5em",
                padding: 0,
                boxSizing: "border-box",
                minWidth: "1em",
                cursor: (props.disabled ? undefined : "pointer"),
                opacity: (props.disabled ? 0.25 : undefined),
                fontFamily: "inherit",
                ...props.style,
        }}>
            { props.children }
        </button>
    </>
}


function SlotButton(props)
{
    return <>
        <Slot
            supressClass
            tall={ props.tall }
            thin={ props.thin }
        >
            <Button expand
                selected={ props.selected }
                disabled={ props.disabled }
                onClick={ props.onClick }
            >
                <SlotLayout
                    tall={ props.tall }
                    thin={ props.thin }
                    icon={ props.icon }
                    label={ props.label }/>
            </Button>
        </Slot>
    </>
}


function SlotRadioGroup(props)
{
	return <>
        { props.options.map(option =>
            <SlotButton
                key={ option.value }
                thin={ props.thin }
                selected={ props.current === option.value }
                onClick={ () => props.onChange(option.value) }
                style={{
                    height: "100%",
                    padding: "0.25em 0.5em",
                    margin: "0 0.125em",
                }}
                label={ option.render }
            />
        )}
    </>
}


function InlineRadioGroup(props)
{
	return <>
        { props.options.map(option =>
            <Button
                key={ option.value }
                selected={ props.current === option.value }
                onClick={ () => props.onChange(option.value) }
                style={{
                    height: "100%",
                    padding: "0.25em 0.5em",
                    margin: "0 0.125em",
                }}
            >
                { option.render }
            </Button>
        )}
    </>
}


function Input(props)
{
    return <input
        type={ props.type }
        value={ props.value }
        onChange={ props.onChange }
        onKeyDown={ ev => ev.stopPropagation() }
        style={{
            gridRow: 1,
            gridColumn: 1,
            width: "4em",
            border: 0,
            fontFamily: "inherit",
            textAlign: "left",
            padding: "0.25em",
            borderRadius: "0.25em",
            ...props.style,
    }}/>
}


function Select(props)
{
    return <select
        value={ props.value }
        onChange={ props.onChange }
        onKeyDown={ ev => ev.stopPropagation() }
        style={{
            gridRow: 1,
            gridColumn: 1,
            border: 0,
            fontFamily: "inherit",
            textAlign: "left",
            padding: "0.25em",
            borderRadius: "0.25em",
            ...props.style,
    }}>
        { props.children }
    </select>
}


function getChildren(children)
{
    if (!children)
        children = []
    
    else if (!Array.isArray(children))
        children = [children]

    return children.filter(c => !!c)
}


function flattenChildrenOfType(children, type)
{
    const res = []

    for (const c of getChildren(children))
    {
        if (c.type === type)
            res.push(c)
        else if (c.props && c.props.children)
        {
            for (const c2 of flattenChildrenOfType(c.props.children, type))
                res.push(c2)
        }
    }

    return res
}


function Toolbar(props)
{
    const [curTab, setCurTab] = React.useState(0)

    //console.log(props.children)
    const tabs = flattenChildrenOfType(props.children, Tab)
    const fixedTab = flattenChildrenOfType(props.children, FixedTab)
    const groups = flattenChildrenOfType(tabs[curTab].props.children, Group)
    const fixedGroups = []//fixedTab.length == 0 ? [] : flattenChildrenOfType(fixedTab[0].props.children, Group)

    return <>
        <div style={{
            display: "grid",
            gridTemplate: "auto 1fr / auto",
            width: "100%",
            height: "100%",
            userSelect: "none",
            ...props.style,
        }}>
            <div style={{
                backgroundColor: "#ddd",
                gridRow: 1,
                gridColumn: 1,
                textAlign: "left",
            }}>
                { tabs.map((tab, i) =>
                    <button
                        key={ i }
                        onClick={ () => setCurTab(i) }
                        style={{
                            display: "inline-block",
                            padding: "0.5em 2em",
                            border: 0,
                            backgroundColor: (curTab === i ? "#eee" : "transparent"),
                            transition: "0.2s background-color",
                            borderTopLeftRadius: "0.5em",
                            borderTopRightRadius: "0.5em",
                            cursor: "pointer",
                            fontFamily: "inherit",
                    }}>
                        { tab.props.label }
                    </button>
                )}
            </div>

            <div style={{
                gridRow: 2,
                gridColumn: 1,
                backgroundColor: "#eee",
                height: "100%",
                display: "grid",
                gridTemplate: "1fr auto / auto",
                gridAutoColumns: "auto",
                gridAutoFlow: "column",
                alignItems: "center",
                justifyContent: "start",
                justifyItems: "center",
            }}>
                { [...fixedGroups, ...groups].map((group, i) =>
                    <React.Fragment key={ i }>
                        <div style={{
                            gridRow: 1,
                            width: "100%",
                            height: "100%",
                            boxSizing: "border-box",
                            padding: "0.5em 0.25em 0 0.25em",
                        }}>
                            <div style={{
                                width: "100%",
                                height: "100%",
                                boxSizing: "border-box",
                                padding: "0.25em",
                                backgroundColor: "#fff",
                                borderRadius: "0.5em",
                                display: "grid",
                                gridTemplate: "1fr 1fr 1fr / auto",
                                gridAutoColumns: "auto",
                                gridAutoFlow: "column",
                            }}>
                                { group.props.children }
                            </div>
                        </div>
                        <div style={{
                            gridRow: 2,
                            padding: "0.15em " + (group.props.thin ? "0.5em" : "2em"),
                        }}>
                            { group.props.label }
                        </div>
                    </React.Fragment>
                )}
            </div>
        </div>
    </>
}


export default
{
    Toolbar,
    Tab,
    FixedTab,
    Group,
    TallBox,
    Slot,
    SlotLayout,
    Button,
    SlotButton,
    InlineRadioGroup,
    SlotRadioGroup,
    Input,
    Select,
}