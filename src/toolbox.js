let selectedTab = 2;


let buttonPlay = document.getElementById("button-play");
let buttonRewind = document.getElementById("button-rewind");
let inputTempo = document.getElementById("input-tempo");
let selectSnap = document.getElementById("select-snap");


let buttonTabs =
[
	document.getElementById("tab-file"),
	document.getElementById("tab-markers"),
	document.getElementById("tab-notes-chords"),
	document.getElementById("tab-settings")
];


let drawers =
[
	document.getElementById("toolbox-drawer-file"),
	document.getElementById("toolbox-drawer-markers"),
	document.getElementById("toolbox-drawer-notes-chords"),
	document.getElementById("toolbox-drawer-settings")
];


function toolboxInit()
{
	toolboxDrawerFileInit();
	toolboxDrawerMarkersInit();
	toolboxDrawerNotesChordsInit();
	toolboxDrawerSettingsInit();
	
	buttonPlay.onclick = () => g_Editor.togglePlay();
	buttonRewind.onclick = () => g_Editor.rewind();
	
	inputTempo.onkeydown = (ev) => ev.stopPropagation();
	inputTempo.onchange = toolboxTempoRefresh;
	
	
	for (var i = 0; i < Theory.allowedSnaps.length; i++)
	{
		if (Theory.allowedSnaps[i].startGroup != undefined)
		{
			var group = document.createElement("optgroup");
			group.label = "-- " + Theory.allowedSnaps[i].startGroup + " --";
			selectSnap.appendChild(group);
		}
		
		var option = document.createElement("option");
		option.innerHTML = Theory.allowedSnaps[i].snap.toUserString();
		selectSnap.appendChild(option);
	}
	selectSnap.selectedIndex = 0;
	selectSnap.onchange = toolboxSnapRefresh;
	
	
	for (let i = 0; i < buttonTabs.length; i++)
	{
		buttonTabs[i].onclick = () =>
		{
			selectedTab = i;
			toolboxRefresh();
		};
		
		buttonTabs[i].className = (selectedTab == i ?
			"toolbox-tab-selected" : "toolbox-tab");
			
		drawers[i].style.display = (selectedTab == i ?
			"grid" : "none");
	}
}


function toolboxRefresh()
{
	for (let i = 0; i < buttonTabs.length; i++)
	{
		buttonTabs[i].className = (selectedTab == i ?
			"toolbox-tab-selected" : "toolbox-tab");
			
		drawers[i].style.display = (selectedTab == i ?
			"grid" : "none");
	}
}


function toolboxPlaybackRefresh(isPlaying)
{
	buttonPlay.childNodes[1].innerHTML = isPlaying ? "stop" : "play_arrow";
}


function toolboxTempoRefresh()
{
	var tempo = parseInt(inputTempo.value);
	
	if (Theory.isValidBpm(tempo))
		g_Song.bpm = tempo;
}


function toolboxSnapRefresh()
{
	let snapIndex = selectSnap.selectedIndex;
	g_Editor.setCursorSnap(Theory.allowedSnaps[snapIndex].snap);
}