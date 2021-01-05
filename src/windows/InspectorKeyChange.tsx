import React from "react"
import * as Dockable from "../dockable"
import * as Project from "../project"
import * as Prefs from "../prefs"
import * as Theory from "../theory"
import * as UI from "../ui"


export interface InspectorKeyChangeProps
{
    elemIds: Project.ID[]
}


export function InspectorKeyChange(props: InspectorKeyChangeProps)
{
    const windowCtx = Dockable.useWindow()
    const project = Project.useProject()
    const prefs = Prefs.usePrefs()


	const keyChs: Project.KeyChange[] = []
	for (const elemId of props.elemIds)
	{
		const keyCh = Project.getElem(project.ref.current, elemId, "keyChange")
		if (!keyCh)
			continue

		keyChs.push(keyCh)
	}

	if (keyChs.length == 0)
		return null


	windowCtx.setTitle(keyChs.length == 1 ? `Key Change` : `${ keyChs.length } Key Changes`)


	let sameTonicLetter: number | null = keyChs[0].key.tonic.letter
	let sameTonicAccidental: number | null = keyChs[0].key.tonic.accidental
	let sameScale: Theory.Scale | null = keyChs[0].key.scale
	for (const keyCh of keyChs)
	{
		if (keyCh.key.tonic.letter !== sameTonicLetter)
			sameTonicLetter = null

		if (keyCh.key.tonic.accidental !== sameTonicAccidental)
			sameTonicAccidental = null

		if (sameScale && keyCh.key.scale.id !== sameScale.id)
			sameScale = null
	}
	
	const sameKey =
		sameTonicLetter === null ||
		sameTonicAccidental === null ||
		sameScale === null ?
			null :
			Theory.Key.fromTonicAndScale(
				new Theory.PitchName(sameTonicLetter, sameTonicAccidental),
				sameScale)


	const tonicLetterOptions = /*[0, 4, 1, 5, 2, 6, 3]*/[0, 1, 2, 3, 4, 5, 6].map(letter =>
	{
		return {
			label: Theory.Utils.letterToStr(letter),
			value: letter,
		}
	})


	const tonicAccidentalOptions = [-1, 0, 1].map(acc =>
	{
		return {
			label: acc == 0 ? "♮" : Theory.Utils.accidentalToStr(acc),
			value: acc,
		}
	})


	const scaleOptions = Theory.Scale.list.map(scale =>
	{
		return {
			label: scale.names[0],
			value: scale.id,
		}
	})


	const chromaticOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(chroma =>
	{
		const key = sameKey ?? Theory.Key.parse("C Major")

		return {
			label: key.nameForChroma(chroma).str,
			value: chroma,
			bkgColor: Theory.Utils.degreeToColor(key.degreeForChroma(chroma)),
			width: "2em",
		}
	})


	const chromaticSelected = !sameKey ? [] : [0, 1, 2, 3, 4, 5, 6].map(degree =>
	{
		const key = sameKey ?? Theory.Key.parse("C Major")
		return key.chromaForDegree(degree)
	})


	const modifyKeyChs = (func: (keyCh: Project.KeyChange) => Project.KeyChange) =>
	{
		for (const keyCh of keyChs)
		{
			const newKeyCh = func(keyCh)
			console.log("InspectorKeyChange.modifyKeyChs", keyCh, newKeyCh)
			project.ref.current = Project.upsertElement(project.ref.current, newKeyCh)
		}

        project.commit()
        window.dispatchEvent(new Event("timelineRefresh"))
	}


	const onChangeTonicLetter = (item: any) =>
	{
		modifyKeyChs((keyCh) =>
		{
			const tonic = new Theory.PitchName(item.value, keyCh.key.tonic.accidental)
			const newKey = new Theory.Key(tonic, keyCh.key.scale)
			return Project.elemModify(keyCh, { key: newKey })
		})
	}


	const onChangeTonicAccidental = (item: any) =>
	{
		modifyKeyChs((keyCh) =>
		{
			const tonic = new Theory.PitchName(keyCh.key.tonic.letter, item.value)
			const newKey = new Theory.Key(tonic, keyCh.key.scale)
			return Project.elemModify(keyCh, { key: newKey })
		})
	}


	const onChangeScale = (item: any) =>
	{
		modifyKeyChs((keyCh) =>
		{
			const scale = Theory.Scale.fromId(item.value)
			const newKey = new Theory.Key(keyCh.key.tonic, scale)
			return Project.elemModify(keyCh, { key: newKey })
		})
	}


	return <div style={{
		padding: "1em",
	}}>

		<div style={{
			display: "grid",
			gridTemplate: "auto auto auto 1em auto / auto",
			gridRowGap: "0.25em",
			gridColumnGap: "0.25em",
			justifyItems: "start",
			alignItems: "center",

			minWidth: 0,
			maxWidth: "max-content",
		}}>
			<div style={{
			}}>
				Tonic
			</div>

			<UI.ButtonList
				items={ tonicLetterOptions }
				selected={ sameTonicLetter }
				onChange={ onChangeTonicLetter }
			/>

			<div style={{
			}}>
				Accidental
			</div>

			<UI.ButtonList
				items={ tonicAccidentalOptions }
				selected={ sameTonicAccidental }
				onChange={ onChangeTonicAccidental }
			/>

			<div style={{
			}}>
				Scale
			</div>

			<UI.DropdownMenu
				items={ scaleOptions }
				selected={ sameScale && sameScale.id }
				onChange={ onChangeScale }
			/>

			<div style={{
				marginBottom: "1em",
			}}/>

			<div style={{
			}}>
				Pitches
			</div>

			<UI.ButtonList
				multiple
				items={ chromaticOptions }
				selected={ chromaticSelected }
				onChange={ () => {} }
			/>

		</div>

	</div>
}