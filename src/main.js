var g_Editor = null;
var g_Song = null;
var g_Synth = null;

var songPlaying = false;


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
}


function refreshButtonPlay(isPlaying)
{
	var button = document.getElementById("buttonPlay");
	button.innerHTML = isPlaying ? "◼ Stop" : "► Play";
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
	g_Editor.cursorSetTickBoth(new Rational(0));
	g_Editor.refresh();
}


function handleButtonSaveLocal()
{
	var data = g_Song.save();
	window.prompt("Copy and save this data to a file:", data);
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