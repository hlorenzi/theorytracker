function Theory()
{
	var that = this;
	
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
		
	
	// Scale without pitches will be generated below.
	this.scales =
	[
		{ name: "Major", pitches: [ C,  D,  E,  F,  G,  A,  B  ] },
		{ name: "Dorian" },
		{ name: "Phrygian" },
		{ name: "Lydian" },
		{ name: "Mixolydian" },
		{ name: "Natural Minor" },
		{ name: "Locrian" },
		
		{ name: "Harmonic Minor", pitches: [ C,  D,  Ds, F,  G,  Gs, B  ] },
		
		{ name: "Double Harmonic", pitches: [ C,  Cs, E,  F,  G,  Gs, B  ] },
		{ name: "Lydian ♯2 ♯6" },
		{ name: "Ultraphrygian" },
		{ name: "Hungarian Minor" },
		{ name: "Oriental" },
		{ name: "Ionian Augmented ♯2" },
		{ name: "Locrian ♭♭3 ♭♭7" },
		
		{ name: "Phrygian Dominant", pitches: [ C,  Cs, E,  F,  G,  Gs, As ] },
	];
	
	// Generate the other modes of the non-null scales.
	for (var i = 0; i < this.scales.length; i++)
	{
		if (!this.scales[i].hasOwnProperty("pitches"))
		{
			this.scales[i].pitches = [];
			var offset = this.scales[i - 1].pitches[1];
			for (var j = 0; j < 7; j++)
			{
				this.scales[i].pitches[j] = (this.scales[i - 1].pitches[(j + 1) % 7] + 12 - offset) % 12;
			}
		}
	}
	
	// Generate the mapping from pitch to scale degree.
	for (var i = 0; i < this.scales.length; i++)
	{
		this.scales[i].pitchToDegreeMap = [];
		
		var curPitch = 0;		
		for (var j = 0; j < 7; j++)
		{
			while (curPitch < this.scales[i].pitches[j])
			{
				this.scales[i].pitchToDegreeMap.push(j - 0.5);
				curPitch++;
			}
			
			this.scales[i].pitchToDegreeMap.push(j);
			curPitch++;
		}
	}
	

	this.chords =
	[
		{ name: "Major",                    roman: "X",     romanSup: "",       romanSub: "",       pitches: [ C,  E,  G  ] },
		{ name: "Minor",                    roman: "x",     romanSup: "",       romanSub: "",       pitches: [ C,  Ds, G  ] },
		{ name: "Diminished",               roman: "x",     romanSup: "o",      romanSub: "",       pitches: [ C,  Ds, Fs ] },
		{ name: "Augmented",                roman: "X",     romanSup: "+",      romanSub: "",       pitches: [ C,  E,  Gs ] },
		{ name: "Flat Fifth(?)",            roman: "X",     romanSup: "(♭5)",   romanSub: "",       pitches: [ C,  E,  Fs ] },
		{ name: "?",                        roman: "X",     romanSup: "?",      romanSub: "",       pitches: [ C,  D,  Fs ] },
		{ name: "Dominant Seventh",         roman: "X",     romanSup: "7",      romanSub: "",       pitches: [ C,  E,  G,  As ] },
		{ name: "Major Seventh",            roman: "X",     romanSup: "M7",     romanSub: "",       pitches: [ C,  E,  G,  B  ] },
		{ name: "Minor Seventh",            roman: "x",     romanSup: "7",      romanSub: "",       pitches: [ C,  Ds, G,  As ] },
		{ name: "Minor-Major Seventh",      roman: "X",     romanSup: "m(M7)",  romanSub: "",       pitches: [ C,  Ds, G,  B  ] },
		{ name: "Diminished Seventh",       roman: "x",     romanSup: "o7",     romanSub: "",       pitches: [ C,  Ds, G,  A  ] },
		{ name: "Half-Diminished Seventh",  roman: "x",     romanSup: "ø7",     romanSub: "",       pitches: [ C,  Ds, Fs, As ] },
		{ name: "Augmented Seventh",        roman: "X",     romanSup: "+7",     romanSub: "",       pitches: [ C,  E,  Gs, As ] },
		{ name: "Augmented Major Seventh",  roman: "X",     romanSup: "+(M7)",  romanSub: "",       pitches: [ C,  E,  Gs, B  ] }
	];
	
	
	this.getMinPitch = function()
	{
		return 60 - 12 * 2;
	}
	
	
	this.getMaxPitch = function()
	{
		return 60 + 12 * 3 - 1;
	}
	

	this.getNameForPitch = function(pitch, scale, tonicPitch)
	{
		// TODO: Take the scale also into consideration.
		var notes = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
		return notes[pitch % 12];
	};
	

	this.getRomanNumeralForPitch = function(pitch, scale, tonicPitch)
	{
		// TODO: Take the scale also into consideration for naming.
		var numerals = ["I", "♭II", "II", "♭III", "III", "IV", "♭V", "V", "♭VI", "VI", "♭VII", "VII"];
		return numerals[(pitch + 12 - tonicPitch) % 12];
	};
	
	
	this.getIdForChord = function(chord)
	{
		return this.chords.indexOf(chord);
	}
	
	
	this.getChordForId = function(id)
	{
		return this.chords[id];
	}
	
	
	this.getIdForScale = function(scale)
	{
		return this.scales.indexOf(scale);
	}
	
	
	this.getScaleForId = function(id)
	{
		return this.scales[id];
	}
	

	this.getOctaveForPitch = function(pitch)
	{
		return Math.floor(pitch / 12);
	};
	

	this.getOctaveForDegree = function(degree)
	{
		return Math.floor(degree / 7);
	};
	
	
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
	
	this.getColorForDegree = function(degree)
	{
		return colors[degree];
	};
	
	
	// Returns the scale degree of the given pitch, according to the given key.
	// May return fractional values, which indicates that the pitch falls
	// between scale degrees.
	this.getDegreeForPitch = function(pitch, scale, tonicPitch)
	{
		return scale.pitchToDegreeMap[(pitch + 12 - tonicPitch) % 12];
	};


	// Returns the row index where a note of the given pitch would be placed,
	// according to the given key. May return fractional values, which
	// indicates that the pitch falls between scale degrees.
	this.getRowForPitch = function(pitch, scale, tonicPitch)
	{
		var pitchOctave = that.getOctaveForPitch(pitch - tonicPitch);
		var pitchDegree = that.getDegreeForPitch(pitch, scale, tonicPitch);
		
		var offset = 0;
		if (tonicPitch != 0)
			offset = Math.floor(this.getRowForPitch(tonicPitch, scale, 0));
		
		
		return pitchDegree + offset + pitchOctave * 7;
	};


	// Returns the pitch of the given row index, according to the given key.
	this.getPitchForRow = function(row, scale, tonicPitch)
	{
		var rowOctave = Math.floor(row / 7);
		
		var offset = 0;
		if (tonicPitch != 0)
			offset = Math.floor(that.getRowForPitch(tonicPitch, scale, 0));
		
		return scale.pitches[Math.floor(row + 7 - offset) % 7] + tonicPitch + Math.floor((row - offset) / 7) * 12;
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
		synth.playNote(pitch, 960 / 8, 1);
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
			synth.playNoteDelayed((tonicPitch + scale.degrees[k]) + 60, k * 60, 960 / 8, 1);
		}
		synth.playNoteDelayed((tonicPitch + scale.degrees[0] + 12) + 60, scale.degrees.length * 60, 960 / 8, 1);
	}
}
