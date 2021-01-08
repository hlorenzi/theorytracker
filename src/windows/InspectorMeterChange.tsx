import React from "react"
import * as Dockable from "../dockable"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Theory from "../theory"
import * as UI from "../ui"


export interface InspectorMeterChangeProps
{
    elemIds: Project.ID[]
}


export function InspectorMeterChange(props: InspectorMeterChangeProps)
{
    const windowCtx = Dockable.useWindow()
    const project = Project.useProject()
    const prefs = Prefs.usePrefs()


	const meterChs: Project.MeterChange[] = []
	for (const elemId of props.elemIds)
	{
		const meterCh = Project.getElem(project.ref.current, elemId, "meterChange")
		if (!meterCh)
			continue

		meterChs.push(meterCh)
	}

	if (meterChs.length == 0)
		return null


	windowCtx.setTitle(meterChs.length == 1 ? `Meter Change` : `${ meterChs.length } Meter Changes`)


	let sameNumerator: number | null = meterChs[0].meter.numerator
	let sameDenominator: number | null = meterChs[0].meter.denominator
	for (const meterCh of meterChs)
	{
		if (meterCh.meter.numerator !== sameNumerator)
            sameNumerator = null

		if (meterCh.meter.denominator !== sameDenominator)
            sameDenominator = null
	}


	const denominatorOptions = [1, 2, 4, 8, 16, 32, 64].map(denominator =>
	{
		return {
			label: denominator.toString(),
			value: denominator,
		}
	})


	const modifyMeterChs = (func: (meterCh: Project.MeterChange) => Project.MeterChange) =>
	{
		for (const meterCh of meterChs)
		{
			const newMeterCh = func(meterCh)
			console.log("InspectorKeyChange.modifyMeterChs", meterCh, newMeterCh)
			project.ref.current = Project.upsertElement(project.ref.current, newMeterCh)
		}

        project.commit()
        window.dispatchEvent(new Event("timelineRefresh"))
	}


	const onChangeNumerator = (value: string) =>
	{
        const numerator = parseInt(value)
        if (!isFinite(numerator) || numerator <= 0 || numerator >= 1000)
            return

		modifyMeterChs((meterCh) =>
		{
			const newMeter = new Theory.Meter(numerator, meterCh.meter.denominator)
			return Project.elemModify(meterCh, { meter: newMeter })
		})
	}


	const onChangeDenominator = (item: any) =>
	{
        const denominator = item.value

		modifyMeterChs((meterCh) =>
		{
			const newMeter = new Theory.Meter(meterCh.meter.numerator, denominator)
			return Project.elemModify(meterCh, { meter: newMeter })
		})
	}


	return <div style={{
		padding: "1em",
	}}>

		<div style={{
			display: "grid",
			gridTemplate: "auto 1em auto / auto",
			gridRowGap: "0.25em",
			gridColumnGap: "0.25em",
			justifyItems: "start",
			alignItems: "center",

			minWidth: 0,
			maxWidth: "max-content",
		}}>
			<div style={{
			}}>
				Meter
			</div>

			<div>
                <UI.Input
                    type="number"
                    value={ sameNumerator ? sameNumerator.toString() : null }
                    onChange={ onChangeNumerator }
                    width="3em"
                />
                { " / " }
                <UI.DropdownMenu
                    items={ denominatorOptions }
                    selected={ sameDenominator }
                    onChange={ onChangeDenominator }
                />
            </div>

		</div>

	</div>
}