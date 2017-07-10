let buttonNew = document.getElementById("button-new");
let buttonSaveLink = document.getElementById("button-save-link");
let buttonLoadDropbox = document.getElementById("button-load-dropbox");
let buttonLoadString = document.getElementById("button-load-string");
let buttonSaveString = document.getElementById("button-save-string");
let buttonLoadCompressed = document.getElementById("button-load-compressed");
let buttonSaveCompressed = document.getElementById("button-save-compressed");


function toolboxDrawerFileInit()
{
	buttonNew.onclick = toolboxNew;
	buttonSaveLink.onclick = toolboxGenerateLink;
	buttonLoadDropbox.onclick = toolboxLoadDropbox;
	buttonLoadString.onclick = toolboxLoadString;
	buttonSaveString.onclick = toolboxSaveString;
	buttonLoadCompressed.onclick = toolboxLoadCompressed;
	buttonSaveCompressed.onclick = toolboxSaveCompressed;
}


function toolboxNew()
{
	if (!askUnsavedChanges())
		return;
	
	clearSongData();
	g_Editor.setUnsavedChanges(false);
	refreshURL(null);
}


function toolboxGenerateLink()
{
	var songData = g_Song.saveBinary();
	g_Editor.setUnsavedChanges(false);
	refreshURL(songData);
}


function toolboxLoadString()
{
	if (!askUnsavedChanges())
		return;
	
	var data = window.prompt("Paste JSON song data:", "");
	if (data == null)
		return;
	
	loadSongData(data, false);
}


function toolboxSaveString()
{
	var songData = g_Song.saveJSON();
	var data = "data:text/plain," + encodeURIComponent(songData);
	window.open(data);
	g_Editor.setUnsavedChanges(false);
}


function toolboxLoadCompressed()
{
	if (!askUnsavedChanges())
		return;
	
	var data = window.prompt("Paste Base64-compressed song data:", "");
	if (data == null)
		return;
	
	loadSongData(data, true);
}


function toolboxSaveCompressed()
{
	var songData = g_Song.saveBinary();
	var data = "data:text/plain," + encodeURIComponent(songData);
	window.open(data);
	g_Editor.setUnsavedChanges(false);
}


function toolboxLoadDropbox()
{
	if (!askUnsavedChanges())
		return;
	
	Dropbox.choose(
	{
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
					loadSongData(xhr.response, false);
				else
					window.alert("Error loading Dropbox file.");
			};
			xhr.send();
		}
	});
}


// Still not working...
function toolboxSaveDropbox()
{
	var songData = g_Song.saveJSON();
	var data = "data:text/plain," + encodeURIComponent(songData);
	
	Dropbox.save(
		data,
		"song.txt",
		{
			success: function() { window.alert("Successfully saved file to Dropbox."); g_Editor.setUnsavedChanges(false); },
			error: function(msg) { window.alert("Error saving file to Dropbox.\n\nError message: " + msg); }
		});
}


// Still not working...
function toolboxSaveAsDropbox()
{
	var filename = window.prompt("Save under what filename?", "song.txt");
	if (filename == null)
		return;
	
	var songData = g_Song.saveJSON();
	var data = "data:text/plain," + encodeURIComponent(songData);
	
	Dropbox.save(
		data,
		filename,
		{
			success: function() { window.alert("Successfully saved file to Dropbox."); g_Editor.setUnsavedChanges(false); },
			error: function(msg) { window.alert("Error saving file to Dropbox.\n\nError message: " + msg); }
		});
}