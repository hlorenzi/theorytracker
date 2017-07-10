let selectKeyPitch = document.getElementById("select-key-tonic");
let selectKeyScale = document.getElementById("select-key-scale");
let selectMeterNumerator = document.getElementById("select-meter-num");	
let selectMeterDenominator = document.getElementById("select-meter-den");
let buttonInsertKeyChange = document.getElementById("button-insert-keych");
let buttonInsertMeterChange = document.getElementById("button-insert-meterch");
let buttonInsertMeasureBreak = document.getElementById("button-insert-measurebrk");
let buttonInsertLineBreak = document.getElementById("button-insert-linebrk");


function toolboxDrawerMarkersInit()
{
	for (let i = 0; i < Theory.keyTonicPitches.length; i++)
	{
		let option = document.createElement("option");
		option.innerHTML = Theory.getPitchLabel(Theory.keyTonicPitches[i], Theory.keyAccidentalOffsets[i]);
		selectKeyPitch.appendChild(option);
	}
	selectKeyPitch.selectedIndex = 8;
	
	
	for (let i = 0; i < Theory.scales.length; i++)
	{
		let option = document.createElement("option");
		option.innerHTML = Theory.scales[i].name;
		selectKeyScale.appendChild(option);
	}
	selectKeyScale.selectedIndex = 0;
	
	
	for (let i = 0; i < Theory.meterNumerators.length; i++)
	{
		let option = document.createElement("option");
		option.innerHTML = Theory.meterNumerators[i].toString();
		selectMeterNumerator.appendChild(option);
	}
	selectMeterNumerator.selectedIndex = 3;

	
	for (let i = 0; i < Theory.meterDenominators.length; i++)
	{
		let option = document.createElement("option");
		option.innerHTML = Theory.meterDenominators[i].toString();
		selectMeterDenominator.appendChild(option);
	}
	selectMeterDenominator.selectedIndex = 2;
	
	
	buttonInsertKeyChange.onclick = toolboxInsertKeyChange;
	buttonInsertMeterChange.onclick = toolboxInsertMeterChange;
	buttonInsertMeasureBreak.onclick = toolboxInsertMeasureBreak;
	buttonInsertLineBreak.onclick = toolboxInsertLineBreak;
}


function toolboxInsertKeyChange()
{
	let pitchIndex = selectKeyPitch.selectedIndex;
	let scaleIndex = selectKeyScale.selectedIndex;
	g_Editor.insertKeyChange(scaleIndex, Theory.keyTonicPitches[pitchIndex], Theory.keyAccidentalOffsets[pitchIndex]);
}


function toolboxInsertMeterChange()
{
	let numeratorIndex = selectMeterNumerator.selectedIndex;
	let denominatorIndex = selectMeterDenominator.selectedIndex;
	g_Editor.insertMeterChange(
		Theory.meterNumerators[numeratorIndex],
		Theory.meterDenominators[denominatorIndex]);
}


function toolboxInsertMeasureBreak()
{
	g_Editor.insertMeasureBreak();
}


function toolboxInsertLineBreak()
{
	g_Editor.insertLineBreak();
}