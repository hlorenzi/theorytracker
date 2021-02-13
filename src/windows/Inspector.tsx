import React from "react"
import * as Dockable from "../dockable"
import * as Project from "../project"
import * as UI from "../ui"
import { InspectorMultitype } from "./InspectorMultitype"
import { InspectorTrack } from "./InspectorTrack"
import { InspectorKeyChange } from "./InspectorKeyChange"
import { InspectorMeterChange } from "./InspectorMeterChange"
import { InspectorChord } from "./InspectorChord"


interface InspectorProps
{
	elemIds: Project.ID[]
}


export function Inspector()
{
    const windowCtx = Dockable.useWindow()
	
	const props: InspectorProps = windowCtx.data
	const [elemIds, setElemIds] = React.useState(props.elemIds)

    const dockable = Dockable.useDockable()
	

	const elemTypes = React.useMemo(() =>
	{
		const types = new Map<Project.Element["type"], number>()

		for (const elemId of elemIds)
		{
			const elem = Project.global.project.elems.get(elemId)
			if (!elem)
				continue

			const typeCount = types.get(elem.type)
			if (typeCount === undefined)
			{
				types.set(elem.type, 1)
			}
			else
			{
				types.set(elem.type, typeCount + 1)
			}
		}

		return types

	}, [elemIds])!


	if (elemTypes.size == 1)
	{
		switch (elemTypes.keys().next().value as Project.Element["type"])
		{
			case "track":
			{
				windowCtx.setPreferredSize(900, 500)
				return <InspectorTrack elemIds={ elemIds }/>
			}
			case "keyChange":
			{
    			windowCtx.setPreferredSize(500, 350)
				return <InspectorKeyChange elemIds={ elemIds }/>
			}
			case "meterChange":
			{
    			windowCtx.setPreferredSize(500, 350)
				return <InspectorMeterChange elemIds={ elemIds }/>
			}
			case "chord":
			{
    			windowCtx.setPreferredSize(500, 350)
				return <InspectorChord elemIds={ elemIds }/>
			}
			default:
				return null
		}
	}
	else
	{
		windowCtx.setPreferredSize(500, 350)
		return <InspectorMultitype
			elemIds={ elemIds }
			setElemIds={ setElemIds }
			elemTypes={ elemTypes }
		/>
	}
}