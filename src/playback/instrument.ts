import * as Playback from "./index"
import * as Project from "../project"


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


	playNote(noteId: Project.ID, midiPitch: number, volume: number)
	{
		
    }
    

    releaseNote(noteId: Project.ID)
    {
		
    }


	stopAll()
	{

	}


	process(deltaTimeMs: number)
	{
		
	}
}