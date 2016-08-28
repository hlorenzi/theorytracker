function Theory()
{
	var C  = 0;  this.C  = C;
	var Cs = 1;  this.Cs = Cs;
	var D  = 2;  this.D  = D;
	var Ds = 3;  this.Ds = Ds;
	var E  = 4;  this.E  = E;
	var F  = 5;  this.F  = F;
	var Fs = 6;  this.Fs = Fs;
	var G  = 7;  this.G  = G;
	var Gs = 8;  this.Gs = Gs;
	var A  = 9;  this.A  = A;
	var As = 10; this.As = As;
	var B  = 11; this.B  = B;


	this.scales =
	[
		{ name: "Major", notes: [ C, D, E, F, G, A, B ], degrees: [0, 0.5, 1, 1.5, 2, 3, 3.5, 4, 4.5, 5, 5.5, 6] }
	];
}


Theory.prototype.pitchNameInScale = function(scaleIndex, midiPitch)
{
	// TODO: Take into consideration scale accidentals.
	var names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
	return names[midiPitch % 12];
}


Theory.prototype.pitchDegreeInKey = function(scaleIndex, rootMidiPitch, midiPitch)
{
	return this.scales[scaleIndex].degrees[(midiPitch + 12 - rootMidiPitch) % 12];
}


Theory.prototype.degreeColor = function(degree)
{
	switch (degree)
	{
		case 0:  return "#ff0000";
		case 1:  return "#ff8800";
		case 2:  return "#ffdd00";
		case 3:  return "#00dd00";
		case 4:  return "#0000ff";
		case 5:  return "#8800ff";
		case 6:  return "#ff00ff";
		case 7:  return "#ff0000";
		default: return "#888888";
	}
}


var theory = new Theory();