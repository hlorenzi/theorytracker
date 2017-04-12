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
						"pitch-degree-pitch roundtrip (", p, " != ", pitch, ")",
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
						"pitch-row-pitch roundtrip (", p, " != ", pitch, ")",
						"-- s(", s, ") t(", t, ") p(", p, ") row(", row, ") pitch(", pitch, "), n(", n, ")");
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
		var reader = new BinaryReader(writer.finish());
		var readNum = reader.readInteger();
		console.assert(num == readNum, "integer binary io roundtrip (", num, " != ", readNum, ")");
	};
	
	for (var i = -0xfff; i <= 0xfff; i++)
		test(i);
}


// Test BinaryIO rational write-read roundtrip.
function testRationalBinaryIO()
{
	var test = function(rational)
	{
		var writer = new BinaryWriter();
		writer.writeRational(rational);
		var reader = new BinaryReader(writer.finish());
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