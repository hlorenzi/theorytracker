let checkboxSettingAbsoluteNotation = document.getElementById("checkbox-setting-absnot").childNodes[0];
let checkboxSettingChordPatterns = document.getElementById("checkbox-setting-chordpatt").childNodes[0];


function toolboxDrawerSettingsInit()
{
	checkboxSettingAbsoluteNotation.onchange = toolboxSettingAbsoluteNotationRefresh;
	checkboxSettingChordPatterns.onchange = toolboxSettingChordPatternsRefresh;
}


function toolboxSettingAbsoluteNotationRefresh()
{
	g_Editor.usePopularNotation = checkboxSettingAbsoluteNotation.checked;
	g_Editor.refresh();
	toolboxDrawerNotesChordsRefresh();
}


function toolboxSettingChordPatternsRefresh()
{
	g_Editor.useChordPatterns = checkboxSettingChordPatterns.checked;
}