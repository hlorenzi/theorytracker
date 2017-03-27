var g_Editor = null;
var g_Song = null;
var g_Synth = null;

var g_MainTabIndex = 0;


function main()
{
	g_Synth = new Synth();
	
	var elemSvgEditor = document.getElementById("svgEditor");
	g_Editor = new Editor(elemSvgEditor, g_Synth);
	
	g_Song = new Song();
	g_Editor.setSong(g_Song);
	g_Editor.refresh();
	
	g_Editor.callbackTogglePlay = refreshButtonPlay;
	
	window.onresize = function() { g_Editor.refresh(); };
	document.getElementById("inputTempo").onkeydown = function(ev) { ev.stopPropagation(); };
		
	refreshButtonPlay(false);
	refreshMainTabs();
	refreshSelectBoxes();
	refreshKeyDependentItems();
}


function refreshButtonPlay(isPlaying)
{
	var button = document.getElementById("buttonPlay");
	button.innerHTML = isPlaying ? "◼ Stop" : "► Play";
}


function refreshMainTabs()
{
	document.getElementById("tdTabFile")   .style.display = (g_MainTabIndex == 0 ? "block" : "none");
	document.getElementById("tdTabMarkers").style.display = (g_MainTabIndex == 1 ? "block" : "none");
	document.getElementById("tdTabChords") .style.display = (g_MainTabIndex == 2 ? "block" : "none");
	
	document.getElementById("buttonTabFile")   .className = (g_MainTabIndex == 0 ? "toolboxButtonSelected" : "toolboxButton");
	document.getElementById("buttonTabMarkers").className = (g_MainTabIndex == 1 ? "toolboxButtonSelected" : "toolboxButton");
	document.getElementById("buttonTabChords") .className = (g_MainTabIndex == 2 ? "toolboxButtonSelected" : "toolboxButton");
}


function refreshSelectBoxes()
{
	var selectKeyPitch = document.getElementById("selectKeyPitch");
	for (var i = 0; i < 12; i++)
	{
		var option = document.createElement("option");
		option.innerHTML = Theory.getIndependentPitchLabel(i);
		selectKeyPitch.appendChild(option);
	}
	
	var selectKeyScale = document.getElementById("selectKeyScale");
	for (var i = 0; i < Theory.scales.length; i++)
	{
		var option = document.createElement("option");
		option.innerHTML = Theory.scales[i].name;
		selectKeyScale.appendChild(option);
	}
	
	var selectMeterNumerator = document.getElementById("selectMeterNumerator");
	for (var i = 0; i < Theory.meterNumerators.length; i++)
	{
		var option = document.createElement("option");
		option.innerHTML = Theory.meterNumerators[i].toString();
		selectMeterNumerator.appendChild(option);
	}
	selectMeterNumerator.selectedIndex = 3;
	
	var selectMeterDenominator = document.getElementById("selectMeterDenominator");
	for (var i = 0; i < Theory.meterDenominators.length; i++)
	{
		var option = document.createElement("option");
		option.innerHTML = Theory.meterDenominators[i].toString();
		selectMeterDenominator.appendChild(option);
	}
	selectMeterDenominator.selectedIndex = 2;
}


function refreshKeyDependentItems()
{
	var selectChordKinds = document.getElementById("selectChordKinds");
	
	var optionInKey = document.createElement("option");
	optionInKey.innerHTML = "In Key";
	selectChordKinds.appendChild(optionInKey);
	
	for (var i = 0; i < Theory.chordKinds.length; i++)
	{
		if (Theory.chordKinds[i].startGroup != undefined)
		{
			var optGroup = document.createElement("optgroup");
			optGroup.label = "-- " + Theory.chordKinds[i].startGroup + " --";
			selectChordKinds.appendChild(optGroup);
		}		
		
		var option = document.createElement("option");
		
		var labelMain = document.createElement("span");
		var labelSuperscript = document.createElement("sup");
		
		labelMain.innerHTML = Theory.getChordLabelMain(0, i, 0, []);
		labelSuperscript.innerHTML = Theory.getChordLabelSuperscript(0, i, 0, []);
		
		option.appendChild(labelMain);
		labelMain.appendChild(labelSuperscript);
		selectChordKinds.appendChild(option);
	}
	selectChordKinds.selectedIndex = 0;
	
	/*var divChordKinds = document.getElementById("divChordKinds");
	
	var tableChordColumns = document.createElement("table");
	tableChordColumns.style.textAlign = "left";
	divChordKinds.appendChild(tableChordColumns);
	
	var currentTd = null;
	var groupCount = 0;
	
	for (var i = 0; i < Theory.chordKinds.length; i++)
	{
		if (Theory.chordKinds[i].startGroup != undefined)
		{
			groupCount = 0;
			
			var tr = document.createElement("tr");
			var tdLabel = document.createElement("td");
			var label = document.createElement("span");
			label.className = "toolboxLabel";
			label.innerHTML = Theory.chordKinds[i].startGroup + ":";
			tdLabel.appendChild(label);
			tr.appendChild(tdLabel);
			
			currentTd = document.createElement("td");
			tr.appendChild(currentTd);
			
			tableChordColumns.appendChild(tr);
			
			if (i == 0)
			{
				var button = document.createElement("button");
				button.className = "toolboxButton";
				button.innerHTML = "In Key";
				currentTd.appendChild(button);
			}
		}
		
		var button = document.createElement("button");
		button.className = "toolboxButton";
		
		var labelMain = document.createElement("span");
		var labelSuperscript = document.createElement("sup");
		
		labelMain.innerHTML = Theory.getChordLabelMain(0, i, 0, []);
		labelSuperscript.innerHTML = Theory.getChordLabelSuperscript(0, i, 0, []);
		
		button.appendChild(labelMain);
		button.appendChild(labelSuperscript);
		currentTd.appendChild(button);
		
		groupCount++;
		if (groupCount % 6 == 5)
			currentTd.appendChild(document.createElement("br"));
	}*/
}


function handleButtonPlay()
{
	g_Editor.togglePlay();
}


function handleButtonRewind()
{
	g_Editor.rewind();
}


function handleInputTempo()
{
	var input = document.getElementById("inputTempo");
	var tempo = parseInt(input.value);
	
	if (Theory.isValidBpm(tempo))
		g_Song.bpm = tempo;
}


function handleButtonInsertKeyChange()
{
	var pitch = document.getElementById("selectKeyPitch").selectedIndex;
	var scaleIndex = document.getElementById("selectKeyScale").selectedIndex;
	g_Editor.insertKeyChange(scaleIndex, pitch);
}


function handleButtonInsertMeterChange()
{
	var numeratorIndex = document.getElementById("selectMeterNumerator").selectedIndex;
	var denominatorIndex = document.getElementById("selectMeterDenominator").selectedIndex;
	g_Editor.insertMeterChange(
		Theory.meterNumerators[numeratorIndex],
		Theory.meterDenominators[denominatorIndex]);
}


function handleButtonLoadLocal()
{
	var data = window.prompt("Paste a saved song data:", "");
	if (data == null)
		return;
	
	try
	{
		g_Song.load(data);
	}
	catch (err)
	{
		window.alert("Error loading song data.");
		g_Song.clear();
		g_Song.sanitize();
	}
	
	document.getElementById("inputTempo").value = g_Song.bpm.toString();
	g_Editor.setSong(g_Song);
	g_Editor.cursorSetTickBoth(new Rational(0));
	g_Editor.refresh();
}


function handleButtonSaveLocal()
{
	var songData = g_Song.save();
	var data = "data:text/plain," + encodeURIComponent(songData);
	window.open(data);
}


function handleButtonLoadDropbox()
{
	Dropbox.choose({
		linkType: "direct",
		multiselect: false,
		success: function(files)
		{
			var xhr = new XMLHttpRequest();
			xhr.open("get", files[0].link, true);
			xhr.responseType = "text";
			xhr.onload = function()
			{
				if (xhr.status == 200)
				{
					try
					{
						g_Song.load(xhr.response);
					}
					catch (err)
					{
						window.alert("Error loading song data.");
						g_Song.clear();
						g_Song.sanitize();
					}
				}
				else
				{
					console.log(xhr);
					window.alert("Error loading Dropbox file.");
					g_Song.clear();
					g_Song.sanitize();
				}
				
				document.getElementById("inputTempo").value = g_Song.bpm.toString();
				g_Editor.setSong(g_Song);
				g_Editor.cursorSetTickBoth(new Rational(0));
				g_Editor.refresh();
			};
			xhr.send();
		}
	});
}


// Still not working...
function handleButtonSaveDropbox()
{
	var songData = g_Song.save();
	var data = "data:," + encodeURIComponent(songData);
	
	Dropbox.save(
		data,
		"song.txt",
		{
			success: function() { window.alert("Successfully saved file to Dropbox."); },
			error: function(msg) { window.alert("Error saving file to Dropbox.\n\nError message: " + msg); }
		});
}


// Still not working...
function handleButtonSaveAsDropbox()
{
	var filename = window.prompt("Save under what filename?", "song.txt");
	if (filename == null)
		return;
	
	var songData = g_Song.save();
	var data = "data:," + encodeURIComponent(songData);
	
	Dropbox.save(
		data,
		filename,
		{
			success: function() { window.alert("Successfully saved file to Dropbox."); },
			error: function(msg) { window.alert("Error saving file to Dropbox.\n\nError message: " + msg); }
		});
}