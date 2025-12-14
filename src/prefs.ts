export interface Prefs
{
    timeline:
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

        fontWeightChord: string,
        fontNameChord: string,

        fontWeightMarker: string,
        fontNameMarker: string,
    
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
        
        hoverOuterStretchWidth: number
        hoverInnerStretchWidth: number
    }
}


export function makeNew(): Prefs
{
    return {
        timeline: {
            bkgColor: "#202225",
            bkgAlternateMeasureColor: "#1c1e21",
            bkgInactiveOverlayColor: "#0008",
            trackVBorderColor: "#888",
            trackHBorderColor: "#888",
            
            selectionCursorColor: "#0af",
            selectionBkgColor: "#8cf4",
            playbackCursorColor: "#f00",
            trackSeparatorColor: "#aaa",
        
            measureColor: "#040404",
            submeasureColor: "#181818",
            halfSubmeasureColor: "#181818",
        
            measureLabelColor: "#aaa",
            octaveLabelColor: "#aaa",
        
            meterChangeColor: "#0cf",
            keyChangeColor: "#f0c",
            noteVelocityMarkerColor: "#0c4",
            noteVelocityMarkerInactiveColor: "#063",

            fontWeightChord: "",
            fontNameChord: "Verdana",

            fontWeightMarker: "bold",
            fontNameMarker: "Calibri",
        
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

            hoverOuterStretchWidth: 8,
            hoverInnerStretchWidth: 8,
        }
    }
}