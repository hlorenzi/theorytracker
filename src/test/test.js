function test()
{
	testPitchDegrees();
	testPitchRows();
}


// Test pitch-degree-pitch roundtrip.
function testPitchDegrees()
{
	// For each scale
	for (var s = 0; s < Theory.scales.length; s++)
	{
		// For each tonic pitch
		for (var t = 0; t < 12; t++)
		{
			// For each absolute pitch
			for (var p = Theory.midiPitchMin; p <= Theory.midiPitchMax; p++)
			{
				// For each notation mode
				for (var n = 0; n < 2; n++)
				{
					var pop = [false, true][n];
					
					var degree = Theory.getPitchDegree(s, t, p, pop);
					var pitch  = Theory.getDegreePitch(s, t, degree, pop);
					
					console.assert(p == pitch,
						"pitch-degree-pitch (", p, " == ", pitch, ")",
						" -- s(", s, ") t(", t, ") p(", p, ") degree(", degree, ") pitch(", pitch, "), n(", n, ")");
				}
			}
		}
	}
}


// Test pitch-row-pitch roundtrip.
function testPitchRows()
{
	// For each scale
	for (var s = 0; s < Theory.scales.length; s++)
	{
		// For each tonic pitch
		for (var t = 0; t < 12; t++)
		{
			// For each absolute pitch
			for (var p = Theory.midiPitchMin; p <= Theory.midiPitchMax; p++)
			{
				// For each notation mode
				for (var n = 0; n < 2; n++)
				{
					var pop = [false, true][n];
					
					var row   = Theory.getPitchRow(s, t, p, pop);
					var pitch = Theory.getRowPitch(s, t, row, pop);
					
					console.assert(p == pitch,
						"pitch-row-pitch roundtrip (", p, " == ", pitch, ")",
						"-- s(", s, ") t(", t, ") p(", p, ") row(", row, ") pitch(", pitch, "), n(", n, ")");
				}
			}
		}
	}
}