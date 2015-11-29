var theory = new Theory();


function Theory()
{
	var C  = 0;
	var Cs = 1;
	var D  = 2;
	var Ds = 3;
	var E  = 4;
	var F  = 5;
	var Fs = 6;
	var G  = 7;
	var Gs = 8;
	var A  = 9;
	var As = 10;
	var B  = 11;
	
	
	this.C  = C;
	this.Cs = Cs;
	this.D  = D;
	this.Ds = Ds;
	this.E  = E;
	this.F  = F;
	this.Fs = Fs;
	this.G  = G;
	this.Gs = Gs;
	this.A  = A;
	this.As = As;
	this.B  = B;
		
		
	this.scales =
	[
		{ name: "Major",					degrees: [ C,  D,  E,  F,  G,  A,  B  ] },
		{ name: "Dorian",					degrees: null },
		{ name: "Phrygian",					degrees: null },
		{ name: "Lydian",					degrees: null },
		{ name: "Mixolydian",				degrees: null },
		{ name: "Natural Minor",			degrees: null },
		{ name: "Locrian",					degrees: null },
		{ name: "Harmonic Minor",			degrees: [ C,  D,  Ds, F,  G,  Gs, B  ] },
		{ name: "Double Harmonic",			degrees: [ C,  Cs, E,  F,  G,  Gs, B  ] },
		{ name: "Lydian ♯2 ♯6",				degrees: null },
		{ name: "Ultraphrygian",			degrees: null },
		{ name: "Hungarian Minor",			degrees: null },
		{ name: "Oriental",					degrees: null },
		{ name: "Ionian Augmented ♯2",		degrees: null },
		{ name: "Locrian ♭♭3 ♭♭7",			degrees: null },
		{ name: "Phrygian Dominant",		degrees: [ C,  Cs, E,  F,  G,  Gs, As ] },
	];
	
	// Generate the other modes of the base scales.
	for (var i = 0; i < this.scales.length; i++)
	{
		if (this.scales[i].degrees == null)
		{
			this.scales[i].degrees = [];
			var offset = this.scales[i - 1].degrees[1];
			for (var j = 0; j < 7; j++)
			{
				this.scales[i].degrees[j] = (this.scales[i - 1].degrees[(j + 1) % 7] + 12 - offset) % 12;
			}
		}
	}
	

	this.chords =
	[
		{ name: "Major",					roman: "X",		romanSup: "",		romanSub: "",		pitches: [ C,  E,  G  ] },
		{ name: "Minor",					roman: "x",		romanSup: "",		romanSub: "",		pitches: [ C,  Ds, G  ] },
		{ name: "Diminished",				roman: "x",		romanSup: "o",		romanSub: "",		pitches: [ C,  Ds, Fs ] },
		{ name: "Augmented",				roman: "X",		romanSup: "+",		romanSub: "",		pitches: [ C,  E,  Gs ] },
		{ name: "Flat Fifth(?)",			roman: "X",		romanSup: "(♭5)",	romanSub: "",		pitches: [ C,  E,  Fs ] },
		{ name: "?",						roman: "X",		romanSup: "?",		romanSub: "",		pitches: [ C,  D,  Fs ] },
		{ name: "Dominant Seventh",			roman: "X",		romanSup: "7",		romanSub: "",		pitches: [ C,  E,  G,  As ] },
		{ name: "Major Seventh",			roman: "X",		romanSup: "M7",		romanSub: "",		pitches: [ C,  E,  G,  B  ] },
		{ name: "Minor Seventh",			roman: "x",		romanSup: "7",		romanSub: "",		pitches: [ C,  Ds, G,  As ] },
		{ name: "Minor-Major Seventh",		roman: "X",		romanSup: "m(M7)",	romanSub: "",		pitches: [ C,  Ds, G,  B  ] },
		{ name: "Diminished Seventh",		roman: "x",		romanSup: "o7",		romanSub: "",		pitches: [ C,  Ds, G,  A  ] },
		{ name: "Half-Diminished Seventh",	roman: "x",		romanSup: "ø7",		romanSub: "",		pitches: [ C,  Ds, Fs, As ] },
		{ name: "Augmented Seventh",		roman: "X",		romanSup: "+7",		romanSub: "",		pitches: [ C,  E,  Gs, As ] },
		{ name: "Augmented Major Seventh",	roman: "X",		romanSup: "+(M7)",	romanSub: "",		pitches: [ C,  E,  Gs, B  ] }
	];
	

	this.getNameForPitch = function(pitch, scale)
	{
		// TODO: Take the scale also into consideration.
		var notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
		return notes[pitch % 12];
	};
	

	this.getRomanNumeralForPitch = function(pitch, key)
	{
		// TODO: Take the scale also into consideration for naming.
		var numerals = ["I", "♭II", "II", "♭III", "III", "IV", "♭V", "V", "♭VI", "VI", "♭VII", "VII"];
		return numerals[(pitch + 12 - key.tonicPitch) % 12];
	};
	
	
	this.getColorForDegree = function(degree)
	{
		var colors =
		[
			"#ff0000",
			"#ffb014",
			"#efe600",
			"#00d300",
			"#4800ff",
			"#b800e5",
			"#ff00cb"
		];
		return colors[degree];
	};
	
	
	// Returns the scale degree of the given pitch, according to the given key.
	// May return fractional values, which indicates that the pitch falls
	// between scale degrees.
	this.getDegreeForPitch = function(pitch, key)
	{
		var pitchInOctave = ((pitch + 12 - key.tonicPitch) % 12);
		var pitchDegree = key.scale.degrees.length - 0.5;
		
		for (var i = 0; i < key.scale.degrees.length; i++)
		{
			if (key.scale.degrees[i] == pitchInOctave)
			{
				pitchDegree = i;
				break;
			}
			else if (key.scale.degrees[i] > pitchInOctave)
			{
				pitchDegree = i - 0.5;
				break;
			}
		}
		
		return pitchDegree;
	};


	// Returns the row index where a note of the given pitch would be placed,
	// according to the given key. May return fractional values, which
	// indicates that the pitch falls between scale degrees.
	this.getRowForPitch = function(pitch, key)
	{
		var pitchInOctave = ((pitch + 12 - key.tonicPitch) % 12);
		var pitchDegree = key.scale.degrees.length - 0.5;
		
		var degreeOffsetFromC = 0;
		if (key.tonicPitch != 0)
		{
			var originalTonicPitch = key.tonicPitch;
			key.tonicPitch = 0;
			degreeOffsetFromC = Math.floor(this.getRowForPitch(originalTonicPitch, key));
			key.tonicPitch = originalTonicPitch;
		}
		
		for (var i = 0; i < key.scale.degrees.length; i++)
		{
			if (key.scale.degrees[i] == pitchInOctave)
			{
				pitchDegree = i;
				break;
			}
			else if (key.scale.degrees[i] > pitchInOctave)
			{
				pitchDegree = i - 0.5;
				break;
			}
		}
		
		return pitchDegree + degreeOffsetFromC + (Math.floor((pitch - key.tonicPitch) / 12) * key.scale.degrees.length);
	};


	// Returns the pitch of the given row index, according to the given key.
	this.getPitchForRow = function(row, key)
	{
		var degreeOffsetFromC = 0;
		if (key.tonicPitch != 0)
		{
			var originalTonicPitch = key.tonicPitch;
			key.tonicPitch = 0;
			degreeOffsetFromC = Math.floor(this.getRowForPitch(originalTonicPitch, key));
			key.tonicPitch = originalTonicPitch;
		}
		
		return key.scale.degrees[(row + key.scale.degrees.length - degreeOffsetFromC) % key.scale.degrees.length] + key.tonicPitch;
	};
	
	
	// Returns the first chord in the chord array that fits the given pitches.
	this.getFirstFittingChordForPitches = function(pitches)
	{
		for (var i = 0; i < this.chords.length; i++)
		{
			var chord = this.chords[i];
			
			if (pitches.length != chord.pitches.length)
				continue;
			
			var offset = pitches[0];
			var match = true;
			for (var j = 0; j < chord.pitches.length; j++)
			{
				if (chord.pitches[j] != pitches[j] - offset)
				{
					match = false;
					break;
				}
			}
			
			if (match)
				return chord;
		}
		
		console.log("Missing chord data for pitches:");
		console.log(pitches);
		return null;
	}
	
	
	// Plays a sample of the given note.
	this.playNoteSample = function(synth, pitch)
	{
		synth.playNote(pitch + 60, 960 / 8, 1);
	}
	
	
	// Plays a sample of the given chord.
	this.playChordSample = function(synth, chord, rootPitch)
	{
		for (var k = 0; k < chord.pitches.length; k++)
		{
			synth.playNote((rootPitch + chord.pitches[k]) % 12 + 60, 960 / 8, 0.75);
		}
	}
	
	
	// Plays a sample of the given scale.
	this.playScaleSample = function(synth, scale, tonicPitch)
	{
		for (var k = 0; k < scale.degrees.length; k++)
		{
			synth.playNoteDelayed((tonicPitch + scale.degrees[k]) + 60, k * 5, 960 / 8, 1);
		}
		synth.playNoteDelayed((tonicPitch + scale.degrees[0] + 12) + 60, scale.degrees.length * 5, 960 / 8, 1);
	}
}
