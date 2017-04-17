function test()
{
	testPitchDegrees();
	testPitchRows();
	testIntegerBinaryIO();
	testRationalBinaryIO();
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
			// For each accidental offset
			for (var a = -1; a <= 1; a++)
			{
				var key = { scaleIndex: s, tonicMidiPitch: t, accidentalOffset: a };
				
				// For each absolute pitch
				for (var p = Theory.midiPitchMin; p <= Theory.midiPitchMax; p++)
				{
					// For each notation mode
					for (var n = 0; n < 2; n++)
					{
						var pop = [false, true][n];
						
						var degree = Theory.getPitchDegree(key, p, pop);
						var pitch  = Theory.getDegreePitch(key, degree, pop);
						
						console.assert(p == pitch,
							"pitch-degree-pitch roundtrip (", p, " != ", pitch, ")",
							" -- key(", key, ") p(", p, ") degree(", degree, ") pitch(", pitch, "), n(", n, ")");
					}
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
			// For each accidental offset
			for (var a = -1; a <= 1; a++)
			{
				var key = { scaleIndex: s, tonicMidiPitch: t, accidentalOffset: a };
				
				// For each absolute pitch
				for (var p = Theory.midiPitchMin; p <= Theory.midiPitchMax; p++)
				{
					// For each notation mode
					for (var n = 0; n < 2; n++)
					{
						var pop = [false, true][n];
						
						var row   = Theory.getPitchRow(key, p, pop);
						var pitch = Theory.getRowPitch(key, row, pop);
						
						console.assert(p == pitch,
							"pitch-row-pitch roundtrip (", p, " != ", pitch, ")",
							"-- key(", key, ") p(", p, ") row(", row, ") pitch(", pitch, "), n(", n, ")");
					}
				}
			}
		}
	}
}


// Test BinaryIO integer write-read roundtrip.
function testIntegerBinaryIO()
{
	var test = function(num)
	{
		var writer = new BinaryWriter();
		writer.writeInteger(num);
		var reader = new BinaryReader(writer.data);
		var readNum = reader.readInteger();
		console.assert(num == readNum, "integer binary io roundtrip (", num, " != ", readNum, ")");
	};
	
	test(0);
	
	test(1);
	test(2);
	test(10);
	test(0x7f);
	test(0x80);
	test(0x81);
	test(0xff);
	test(0x100);
	test(0x101);
	test(0xfff);
	test(0xffff);
	test(0xfffff);
	test(0xffffff);
	test(0xfffffff);
	
	test(-1);
	test(-2);
	test(-10);
	test(-0x7f);
	test(-0x80);
	test(-0x81);
	test(-0xff);
	test(-0x100);
	test(-0x101);
	test(-0xfff);
	test(-0xffff);
	test(-0xfffff);
	test(-0xffffff);
	test(-0xfffffff);
}


// Test BinaryIO rational write-read roundtrip.
function testRationalBinaryIO()
{
	var test = function(rational)
	{
		var writer = new BinaryWriter();
		writer.writeRational(rational);
		var reader = new BinaryReader(writer.data);
		var readRational = reader.readRational();
		console.assert(rational.compare(readRational) == 0, "rational binary io roundtrip (", rational.toString(), " != ", readRational.toString(), ")");
	};
	
	test(new Rational(0));
	
	test(new Rational(1));
	test(new Rational(0x7f));
	test(new Rational(0x80));
	test(new Rational(0x81));
	
	test(new Rational(-1));
	test(new Rational(-0x7f));
	test(new Rational(-0x80));
	test(new Rational(-0x81));
	
	test(new Rational(0, 0, 1));
	test(new Rational(0, 1, 2));
	test(new Rational(0, 3, 4));
	test(new Rational(0, 5, 8));
	test(new Rational(0x7f, 1, 2));
	test(new Rational(0xff, 3, 4));
	test(new Rational(0x81, 5, 8));
	
	test(new Rational(-1, 1, 2));
	test(new Rational(-1, 3, 4));
	test(new Rational(-1, 5, 8));
	test(new Rational(-0x7f, 1, 2));
	test(new Rational(-0xff, 3, 4));
	test(new Rational(-0x81, 5, 8));
}