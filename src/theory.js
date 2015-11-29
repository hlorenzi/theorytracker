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
		{ name: "Dorian",					degrees: [ C,  D,  Ds, F,  G,  A,  As ] },
		{ name: "Mixolydian",				degrees: [ C,  D,  E,  F,  G,  A,  As ] },
		{ name: "Natural Minor",			degrees: [ C,  D,  Ds, F,  G,  Gs, As ] },
		{ name: "Phrygian Dominant",		degrees: [ C,  Cs, E,  F,  G,  Gs, As ] }
	];
	

	this.chords =
	[
		{ name: "Major",		roman: "X",		romanSup: "",		romanSub: "",		pitches: [ C,  E,  G  ] },
		{ name: "Minor",		roman: "x",		romanSup: "",		romanSub: "",		pitches: [ C,  Ds, G  ] },
		{ name: "Diminished",	roman: "x",		romanSup: "o",		romanSub: "",		pitches: [ C,  Ds, Fs ] },
		{ name: "Augmented",	roman: "X",		romanSup: "+",		romanSub: "",		pitches: [ C,  E,  Gs ] },
		{ name: "Suspended 2",	roman: "X",		romanSup: "",		romanSub: "sus2",	pitches: [ C,  D,  G  ] }
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
		
		return null;
	}
}
