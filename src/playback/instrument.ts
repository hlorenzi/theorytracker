import * as Playback from "./index"
import * as Project from "../project"


export interface NoteRequest
{
	trackId: Project.ID
	noteId: Project.ID
	
	startMs: number
	durationMs: number

	midiPitchSeq: TimeVariableProperty[]
	volumeSeq: TimeVariableProperty[]
	velocitySeq: TimeVariableProperty[]
}


export interface TimeVariableProperty
{
	timeMs: number
	value: number
}


export class Instrument
{
	synth: Playback.SynthManager


	constructor(synth: Playback.SynthManager)
	{
		this.synth = synth
	}


	async prepare()
	{

	}


	async destroy()
	{

	}


	isFinished()
	{
		return true
	}


	playNote(request: Playback.NoteRequest)
	{
		
    }


	stopAll()
	{

	}


	process(deltaTimeMs: number)
	{
		
	}
}