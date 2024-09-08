export function getMidiPresetEmoji(midiBank: number, midiPreset: number): string
{
    if (midiBank == 128) // Percussion
        return "🥁"

    if (midiPreset <= 7) // Piano
        return "🎹"
    else if (midiPreset <= 15) // Chromatic Percussion
        return "🔔"
    else if (midiPreset <= 23) // Organ
        return "💨"
    else if (midiPreset <= 31) // Guitar
        return "🎸"
    else if (midiPreset <= 39) // Bass
        return "🎸"
    else if (midiPreset <= 47) // Strings
        return "🎻"
    else if (midiPreset <= 55) // Ensemble
        return "🎻"
    else if (midiPreset <= 63) // Brass
        return "🎺"
    else if (midiPreset <= 71) // Reed
        return "🎷"
    else if (midiPreset <= 79) // Pipe
        return "✏️"
    else if (midiPreset <= 87) // Synth Lead
        return "🕹️"
    else if (midiPreset <= 95) // Synth Pad
        return "🕹️"
    else if (midiPreset <= 103) // Synth FX
        return "🕹️"
    else if (midiPreset <= 111) // Ethnic
        return "🪕"
    else if (midiPreset <= 119) // Percussive
        return "🥁"
    else if (midiPreset <= 127) // Sound FX
        return "🔊"
    else
        return "🎹"
}