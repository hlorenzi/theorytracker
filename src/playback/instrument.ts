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
	outputNode: AudioNode


	constructor(synth: Playback.SynthManager, outputNode: AudioNode)
	{
		this.synth = synth
		this.outputNode = outputNode
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