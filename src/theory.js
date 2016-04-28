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
	this.scaleGroups =
		[ "Modes of Major", "Modes of Double Harmonic", "Modes of Phrygian Dominant" ];
	
	this.scales =
	[
		{ name: "Major", group: 0, pitches: [ C,  D,  E,  F,  G,  A,  B  ] },
		{ name: "Dorian", group: 0, pitches: [] },
		{ name: "Phrygian", group: 0, pitches: [] },
		{ name: "Lydian", group: 0, pitches: [] },
		{ name: "Mixolydian", group: 0, pitches: [] },
		{ name: "Natural Minor", group: 0, pitches: [] },
		{ name: "Locrian", group: 0, pitches: [] },
		
		{ name: "Harmonic Minor", group: 0, pitches: [ C,  D,  Ds, F,  G,  Gs, B  ] },
		
		{ name: "Double Harmonic", group: 1, pitches: [ C,  Cs, E,  F,  G,  Gs, B  ] },
		{ name: "Lydian ♯2 ♯6", group: 1, pitches: [] },
		{ name: "Ultraphrygian", group: 1, pitches: [] },
		{ name: "Hungarian Minor", group: 1, pitches: [] },
		{ name: "Oriental", group: 1, pitches: [] },
		{ name: "Ionian Augmented ♯2", group: 1, pitches: [] },
		{ name: "Locrian ♭♭3 ♭♭7", group: 1, pitches: [] },
		
		{ name: "Phrygian Dominant", group: 2, pitches: [ C,  Cs, E,  F,  G,  Gs, As ] },
	];
	
	// Generate the other modes of the non-null scales.
	for (var i = 0; i < this.scales.length; i++)
	{
		if (this.scales[i].pitches.length == 0)
		{
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
		
		while (curPitch < 12)
		{
			this.scales[i].pitchToDegreeMap.push(6.5);
			curPitch++;
		}
	}
	

	this.chords =
	[
		{ name: "Major",                    uppercase: true,     symbolSup: "",       symbolSub: "",       pitches: [ C,  E,  G  ] },
		{ name: "Minor",                    uppercase: false,    symbolSup: "",       symbolSub: "",       pitches: [ C,  Ds, G  ] },
		{ name: "Diminished",               uppercase: false,    symbolSup: "o",      symbolSub: "",       pitches: [ C,  Ds, Fs ] },
		{ name: "Augmented",                uppercase: true,     symbolSup: "+",      symbolSub: "",       pitches: [ C,  E,  Gs ] },
		{ name: "Flat Fifth(?)",            uppercase: true,     symbolSup: "(♭5)",   symbolSub: "",       pitches: [ C,  E,  Fs ] },
		{ name: "?",                        uppercase: true,     symbolSup: "?",      symbolSub: "",       pitches: [ C,  D,  Fs ] },
		{ name: "Dominant Seventh",         uppercase: true,     symbolSup: "7",      symbolSub: "",       pitches: [ C,  E,  G,  As ] },
		{ name: "Major Seventh",            uppercase: true,     symbolSup: "M7",     symbolSub: "",       pitches: [ C,  E,  G,  B  ] },
		{ name: "Minor Seventh",            uppercase: false,    symbolSup: "7",      symbolSub: "",       pitches: [ C,  Ds, G,  As ] },
		{ name: "Minor-Major Seventh",      uppercase: true,     symbolSup: "m(M7)",  symbolSub: "",       pitches: [ C,  Ds, G,  B  ] },
		{ name: "Diminished Seventh",       uppercase: false,    symbolSup: "o7",     symbolSub: "",       pitches: [ C,  Ds, G,  A  ] },
		{ name: "Half-Diminished Seventh",  uppercase: false,    symbolSup: "ø7",     symbolSub: "",       pitches: [ C,  Ds, Fs, As ] },
		{ name: "Augmented Seventh",        uppercase: true,     symbolSup: "+7",     symbolSub: "",       pitches: [ C,  E,  Gs, As ] },
		{ name: "Augmented Major Seventh",  uppercase: true,     symbolSup: "+(M7)",  symbolSub: "",       pitches: [ C,  E,  Gs, B  ] }
	];
	
	
	this.chordEmbelishments =
	[
		{ name: "Suspended Second",		symbol: "sus2" },
		{ name: "Suspended Fourth",		symbol: "sus4" },
		{ name: "Added Ninth",			symbol: "add9" }
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
	
	
	// Returns a new chord altered by the given embelishments.
	this.getEmbelishedChord = function(chordIndex, embelishmentIndices)
	{
		var newChord = {
			name: this.chords[chordIndex].name,
			uppercase: this.chords[chordIndex].uppercase,
			symbolSup: this.chords[chordIndex].symbolSup,
			symbolSub: this.chords[chordIndex].symbolSub,
			pitches: this.chords[chordIndex].pitches.slice(0)
		};
		
		var hasSus2 = (embelishmentIndices.indexOf(0) >= 0);
		var hasSus4 = (embelishmentIndices.indexOf(1) >= 0);
		var hasAdd9 = (embelishmentIndices.indexOf(2) >= 0);
		
		if (hasAdd9)
		{
			newChord.pitches.splice(1, 0, D);
			newChord.symbolSup += "(add9)";
		}
		else if (hasSus2 && hasSus4)
		{
			newChord.pitches.splice(1, 1, D, F);
			newChord.symbolSub += "sus24";
		}
		else if (hasSus2)
		{
			newChord.pitches[1] = D;
			newChord.symbolSub += "sus2";
		}
		else if (hasSus4)
		{
			newChord.pitches[1] = F;
			newChord.symbolSub += "sus4";
		}
		
		return newChord;
	}
	
	
	// Returns the first chord index in the chord array that fits the given pitches.
	this.getFirstFittingChordIndexForPitches = function(pitches)
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
				return i;
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
		for (var k = 0; k < scale.pitches.length; k++)
		{
			synth.playNoteDelayed((tonicPitch + scale.pitches[k]) + 60, k * 60, 960 / 8, 1);
		}
		synth.playNoteDelayed((tonicPitch + scale.pitches[0] + 12) + 60, scale.pitches.length * 60, 960 / 8, 1);
	}
}
