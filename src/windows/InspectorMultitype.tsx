import React from "react"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as UI from "../ui"


export interface InspectorMultitypeProps
{
	elemIds: Project.ID[]
	setElemIds: (elemIds: Project.ID[]) => void
	elemTypes: Map<Project.Element["type"], number>
}


export function InspectorMultitype(props: InspectorMultitypeProps)
{
    const project = Project.useProject()
	const prefs = Prefs.usePrefs()
	
	const onNarrowSelectionDown = (type: Project.Element["type"]) =>
	{
		const newElemIds: Project.ID[] = []

		for (const elemId of props.elemIds)
		{
			const elem = project.ref.current.elems.get(elemId)
			if (!elem)
				continue

			if (elem.type === type)
				newElemIds.push(elem.id)
		}

		props.setElemIds(newElemIds)
	}

	return <div style={{
		padding: "0.5em",
	}}>
		{ [...props.elemTypes.entries()].map((entry, i) =>
			<div key={ i } style={{
				marginBottom: "0.25em",
			}}>
				<a
					onClick={ () => onNarrowSelectionDown(entry[0]) }
					style={{
						fontSize: "1.25em",
						marginBottom: "0.25em",
						cursor: "pointer",
						textDecoration: "underline",
				}}>
					{ entry[0] }: { entry[1].toString() } selected
				</a>
			</div>
		)}
	</div>
}