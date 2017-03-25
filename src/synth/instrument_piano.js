var InstrumentPiano = {};


InstrumentPiano.generate = function(time, timeReleased, midiPitch)
{
	var envelope = 1;
	
	if (time < 0.1)
		envelope = Math.max(1, 1.5 - time / 0.1 * 0.5);
	else
		envelope = Math.max(0, 1 / (0.9 + time) / (0.9 + time));
	
	if (timeReleased > 0)
		envelope *= Math.max(0, 1 - timeReleased / 0.1);
	
	
	if (envelope == 0)
		return null;
	
	// Frequencies from
	// physics.stackexchange.com/questions/268568
	
	// TODO: Does not yet sound like a real piano...
	return [
		[440/440,  envelope * 1/1],
		[880/440,  envelope * 1/4],
		[1330/440, envelope * 1/6],
		[1780/440, envelope * 1/7],
		[2230/440, envelope * 1/11],
		[2680/440, envelope * 1/12],
		[3140/440, envelope * 1/13],
		[3610/440, envelope * 1/14],
		[4090/440, envelope * 1/15],
		[4570/440, envelope * 1/16],
		[5060/440, envelope * 1/17],
		[5570/440, envelope * 1/18]
	];
}