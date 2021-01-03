export interface Prefs
{
    editor:
    {
        bkgColor: string
        bkgVoidColor: string
        trackVBorderColor: string
        trackHBorderColor: string
        
        selectionCursorColor: string
        selectionBkgColor: string
        playbackCursorColor: string
        trackSeparatorColor: string

        measureColor: string
        submeasureColor: string
        halfSubmeasureColor: string
        measureAlternateBkgColor: string

        octaveDividerColor: string
        noteRowAlternateBkgColor: string

        meterChangeColor: string
        keyChangeColor: string
        noteVelocityMarkerColor: string
        noteVelocityMarkerInactiveColor: string

        keyPan: string
        keyPencil: string
        keySelectMultiple: string
        keySelectRect: string
        keyDisplaceCursor2: string
        keyDisplaceFast: string
        keyDisplaceChromatically: string
        keyDisplaceStretch: string

        mouseDoubleClickThresholdMs: number

        mouseDragXLockedDistance: number
        mouseDragYLockedDistance: number

        mouseEdgeScrollThreshold: number
        mouseEdgeScrollSpeed: number
    }
}


export function getDefault(): Prefs
{
    return {
        editor:
        {
            bkgColor: "#202225",//"#29242e",
            bkgVoidColor: "#0004",
            trackVBorderColor: "#888",
            trackHBorderColor: "#888",
            
            selectionCursorColor: "#0af",
            selectionBkgColor: "#024",
            playbackCursorColor: "#f00",
            trackSeparatorColor: "#aaa",
        
            measureColor: "#444",
            submeasureColor: "#222",
            halfSubmeasureColor: "#111",
            measureAlternateBkgColor: "#fff1",
        
            octaveDividerColor: "#444",
            noteRowAlternateBkgColor: "#222",//"#19141e",
        
            meterChangeColor: "#0cf",
            keyChangeColor: "#f0c",
            noteVelocityMarkerColor: "#0c4",
            noteVelocityMarkerInactiveColor: "#063",
        
            keyPan: " ",
            keyPencil: "a",
            keySelectMultiple: "control",
            keySelectRect: "shift",
            keyDisplaceCursor2: "shift",
            keyDisplaceFast: "control",
            keyDisplaceChromatically: "shift",
            keyDisplaceStretch: "shift",

            mouseDoubleClickThresholdMs: 300,
        
            mouseDragXLockedDistance: 10,
            mouseDragYLockedDistance: 10,
        
            mouseEdgeScrollThreshold: 10,
            mouseEdgeScrollSpeed: 1,
        },
    }
}