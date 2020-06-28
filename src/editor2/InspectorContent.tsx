import React from "react"
import ButtonList from "../toolbox/ButtonList"
import DropdownMenu from "../toolbox/DropdownMenu"
import Editor from "./editor"
import { AppState } from "../AppState"
import Rect from "../util/rect"
import Project from "../project/project2"
import * as Theory from "../theory/theory"
import { useAppManager } from "../AppContext"


interface InspectorContentProps
{
	contentId: number
	rect: Rect
}


interface InspectorState
{
	elemIds: Project.ID[]
}


export default function InspectorContent(props: InspectorContentProps)
{
	const appManager = useAppManager()
	const contentCtx = appManager.makeContentManager<InspectorState>(props.contentId)


	const elem = contentCtx.appState.project.elems.get(contentCtx.contentState.elemIds[0])
	if (!elem)
		return null


	const keyCh = elem as Project.KeyChange
	const key = keyCh.key


	const chromaticOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(chroma =>
	{
		chroma = Theory.Utils.mod(chroma + key.tonic.chroma, 12)
		return {
			label: key.nameForChroma(chroma).str,
			value: chroma,
			bkgColor: Theory.Utils.degreeToColor(key.degreeForChroma(chroma)),
			width: "2em",
		}
	})


	const chromaticSelected = [0, 1, 2, 3, 4, 5, 6].map(degree => key.chromaForDegree(degree))


	const tonicLetterOptions = [0, 4, 1, 5, 2, 6, 3].map(letter =>
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


	const onChangeTonicLetter = (item: any) =>
	{
		const tonic = new Theory.PitchName(item.value, key.tonic.accidental)
		const newKey = new Theory.Key(tonic, key.scale)
		changeKey(newKey)
	}


	const onChangeTonicAccidental = (item: any) =>
	{
		const tonic = new Theory.PitchName(key.tonic.letter, item.value)
		const newKey = new Theory.Key(tonic, key.scale)
		changeKey(newKey)
	}


	const onChangeScale = (item: any) =>
	{
		const scale = Theory.Scale.fromId(item.value)
		const newKey = new Theory.Key(key.tonic, scale)
		changeKey(newKey)
	}


	const changeKey = (newKey: Theory.Key) =>
	{
		const newKeyCh = Project.Element.withChanges(keyCh, { key: newKey })
		const project = Project.upsertTimedElement(appManager.appState.project, newKeyCh)
		appManager.mergeAppState({ project })
		appManager.dispatch()
	}


	return <div style={{
		padding: "0.5em",
	}}>

		<div style={{
			marginBottom: "0.5em",
			fontSize: "1.125em",
			color: appManager.appState.prefs.editor.keyChangeColor,
			textAlign: "center",
		}}>
			[Key Change]<br/>
			{ (elem as Project.KeyChange).key.str }
		</div>

		<div style={{
			display: "grid",
			gridTemplate: "auto auto auto 1em auto / auto auto",
			gridRowGap: "0.25em",
			gridColumnGap: "0.25em",
			justifyItems: "start",
			alignItems: "center",

			minWidth: 0,
			maxWidth: "max-content",
		}}>
			<div style={{
				justifySelf: "right",
			}}>
				Tonic
			</div>

			<ButtonList
				items={ tonicLetterOptions }
				selected={ key.tonic.letter }
				onChange={ onChangeTonicLetter }
			/>

			<div style={{
				justifySelf: "right",
			}}>
				Accidental
			</div>

			<ButtonList
				items={ tonicAccidentalOptions }
				selected={ key.tonic.accidental }
				onChange={ onChangeTonicAccidental }
			/>

			<div style={{
				justifySelf: "right",
			}}>
				Scale
			</div>

			<DropdownMenu
				items={ scaleOptions }
				selected={ key.scale.id }
				onChange={ onChangeScale }
			/>

			<div/>
			<div/>

			<div style={{
				justifySelf: "right",
			}}>
				Pitches
			</div>

			<ButtonList
				multiple
				items={ chromaticOptions }
				selected={ chromaticSelected }
				onChange={ () => {} }
			/>

		</div>

	</div>
}