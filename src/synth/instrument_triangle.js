var InstrumentTriangleWave = {};


InstrumentTriangleWave.generate = function(time, timeReleased, midiPitch)
{
	var envelope = 1;
	
	if (time < 0.1)
		envelope = Math.max(1, 1.75 - time / 0.2);
	else
		envelope = Math.max(0.5, 1 - time / 0.5);
	
	if (timeReleased > 0)
		envelope *= Math.max(0, 1 - timeReleased / 0.1);
	
	
	if (envelope == 0)
		return null;
	
	return [
		[1,  envelope * 1/1/1],
		[3,  envelope * 1/3/3],
		[5,  envelope * 1/5/5],
		[7,  envelope * 1/7/7],
		[9,  envelope * 1/9/9],
		[11, envelope * 1/11/11],
		[13, envelope * 1/13/13],
		[15, envelope * 1/15/15],
		[17, envelope * 1/17/17],
		[19, envelope * 1/19/19]
	];
}