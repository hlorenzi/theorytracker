export interface Prefs
{
    ui:
    {
        windowAnchorColor: string
        windowOverlayColor: string
        windowVoidColor: string
        windowPanelColor: string
        windowActiveBorderColor: string
    }

    editor:
    {
        bkgColor: string
        bkgAlternateMeasureColor: string
        bkgInactiveOverlayColor: string
        trackVBorderColor: string
        trackHBorderColor: string
        
        selectionCursorColor: string
        selectionBkgColor: string
        playbackCursorColor: string
        trackSeparatorColor: string

        measureColor: string
        submeasureColor: string
        halfSubmeasureColor: string

        measureLabelColor: string
        octaveLabelColor: string

        meterChangeColor: string
        keyChangeColor: string
        noteVelocityMarkerColor: string
        noteVelocityMarkerInactiveColor: string

        keyPan: string
        keyPencil: string
        keySelectMultiple: string
        keySelectRange: string
        keySelectRect: string
        keySelectClone: string
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
        ui:
        {
            windowAnchorColor: "#0bf",
            windowOverlayColor: "#fff4",
            windowVoidColor: "#202225",
            windowPanelColor: "#2f3136",
            windowActiveBorderColor: "#fff",
        },

        editor:
        {
            bkgColor: "#202225",
            bkgAlternateMeasureColor: "#1a1c1f",
            bkgInactiveOverlayColor: "#0008",
            trackVBorderColor: "#888",
            trackHBorderColor: "#888",
            
            selectionCursorColor: "#0af",
            selectionBkgColor: "#0248",
            playbackCursorColor: "#f00",
            trackSeparatorColor: "#aaa",
        
            measureColor: "#040404",
            submeasureColor: "#080808",
            halfSubmeasureColor: "#181818",
        
            measureLabelColor: "#aaa",
            octaveLabelColor: "#aaa",
        
            meterChangeColor: "#0cf",
            keyChangeColor: "#f0c",
            noteVelocityMarkerColor: "#0c4",
            noteVelocityMarkerInactiveColor: "#063",
        
            keyPan: " ",
            keyPencil: "a",
            keySelectMultiple: "control",
            keySelectRange: "shift",
            keySelectRect: "shift",
            keySelectClone: "alt",
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