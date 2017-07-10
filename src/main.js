var g_Editor = null;
var g_Song = null;
var g_Synth = null;

var g_CurrentKey = null;


function main()
{
	test();
	
	g_Synth = new Synth();
	
	g_Song = new Song();
	
	let elemSvgEditor = document.getElementById("editor");
	g_Editor = new Editor(elemSvgEditor, g_Synth);
	g_Editor.setSong(g_Song);
	g_Editor.refresh();
	g_Editor.callbackTogglePlay = toolboxPlaybackRefresh;
	g_Editor.callbackCursorChange = callbackCursorChange;
	g_Editor.usePopularNotation = false;
	g_Editor.useChordPatterns = true;
	
	toolboxInit();
	callbackCursorChange(new Rational(0));
	
	window.onresize = () => g_Editor.refresh();
	window.onbeforeunload = eventBeforeUnload;
	window.onmessage = eventMessage;
	document.getElementById("main").style.visibility = "visible";
	
	clearSongData();
	
	let urlSong = getURLQueryParameter("song");
	if (urlSong != null)
		loadSongData(urlSong, true);
}


function eventMessage(ev)
{
	if (ev.data.kind == "request_songdata")
	{
		ev.source.postMessage(
		{
			kind: "reply_songdata",
			param: ev.data.param,
			song: g_Song.saveJSON()
		}, ev.origin);
		
		ev.preventDefault();
	}
	
	else if (ev.data.kind == "set_songdata")
	{
		loadSongData(ev.data.song, false);		
		ev.preventDefault();
	}
}


function eventBeforeUnload()
{
	return (g_Editor.unsavedChanges ? "Discard unsaved changes?" : null);
}


function askUnsavedChanges()
{
	if (g_Editor.unsavedChanges)
		return window.confirm("Discard unsaved changes?");
	else
		return true;
}


function clearSongData()
{
	g_Song.clear();
	g_Song.sanitize();
	document.getElementById("input-tempo").value = g_Song.bpm.toString();
	g_Editor.setSong(g_Song);
	g_Editor.cursorSetTickBoth(new Rational(0));
	g_Editor.refresh();
	g_Editor.setUnsavedChanges(false);
}


function loadSongData(data, binaryCompressed)
{
	try
	{
		if (binaryCompressed)
			g_Song.loadBinary(data);
		else
			g_Song.loadJSON(data);
		
		document.getElementById("input-tempo").value = g_Song.bpm.toString();
		g_Editor.setSong(g_Song);
		g_Editor.cursorSetTickBoth(new Rational(0));
		g_Editor.refreshHeader();
		g_Editor.refresh();
		g_Editor.setUnsavedChanges(false);
	}
	catch (err)
	{
		window.alert("Error loading song data.\n\nError: " + err.toString());
		clearSongData();
	}
}


function refreshURL(songData)
{
	let urlWithoutQuery = [location.protocol, "//", location.host, location.pathname].join("");
	let newUrl = urlWithoutQuery + (songData == null ? "" : "?song=" + encodeURIComponent(songData));
	window.location = newUrl;
}


function callbackCursorChange(tick)
{
	let keyAtTick = g_Song.keyChanges.findPrevious(tick);
	if (keyAtTick == null)
		return;
	
	g_CurrentKey = keyAtTick;
	toolboxChordsRefresh();
}


function getURLQueryParameter(name)
{
	var url = window.location.search;
	
	name = name.replace(/[\[\]]/g, "\\$&");
	
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
	var results = regex.exec(url);
	
	if (!results)
		return null;
	
	if (!results[2])
		return "";
	
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}