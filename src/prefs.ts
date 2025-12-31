export interface Prefs
{
    timeline:
    {
        bkgColor: string
        bkgAlternateMeasureColor: string
        bkgInactiveOverlayColor: string
        trackVBorderColor: string
        trackHBorderColor: string

        outOfBoundsColor1: string
        outOfBoundsColor2: string
        
        selectionCursorColor: string
        selectionBkgColor: string
        playbackCursorColor: string
        trackSeparatorColor: string

        measureColor: string
        submeasureColor: string
        halfSubmeasureColor: string

        measureLabelColor: string
        octaveLabelColor: string

        tempoChangeColor: string
        keyChangeColor: string
        meterChangeColor: string
        noteVelocityMarkerColor: string
        noteVelocityMarkerInactiveColor: string

        fontWeightChord: string,
        fontNameChord: string,

        fontWeightMarker: string,
        fontNameMarker: string,
    
        keyPan: string
        keyPencil: string
        keySelectMultiple: string
        keyForceCursorSelect: string
        keyClone: string
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
            
            outOfBoundsColor1: "#161719",
            outOfBoundsColor2: "#141416",
            
            selectionCursorColor: "#0af",
            selectionBkgColor: "#8cf4",
            playbackCursorColor: "#0c4",
            trackSeparatorColor: "#aaa",
        
            measureColor: "#040404",
            submeasureColor: "#181818",
            halfSubmeasureColor: "#181818",
        
            measureLabelColor: "#aaa",
            octaveLabelColor: "#aaa",
        
            tempoChangeColor: "#d98",
            keyChangeColor: "#f0c",
            meterChangeColor: "#0cf",
            noteVelocityMarkerColor: "#0c4",
            noteVelocityMarkerInactiveColor: "#063",

            fontWeightChord: "",
            fontNameChord: "Verdana",

            fontWeightMarker: "bold",
            fontNameMarker: "Calibri",
        
            keyPan: "q",
            keyPencil: "a",
            keySelectMultiple: "control",
            keyForceCursorSelect: "shift",
            keyClone: "alt",
            keyDisplaceCursor2: "shift",
            keyDisplaceFast: "control",
            keyDisplaceChromatically: "shift",
            keyDisplaceStretch: "shift",

            mouseDoubleClickThresholdMs: 300,
        
            mouseDragXLockedDistance: 10,
            mouseDragYLockedDistance: 10,
        
            mouseEdgeScrollThreshold: 10,
            mouseEdgeScrollSpeed: 1,

            hoverOuterStretchWidth: 16,
            hoverInnerStretchWidth: 12,
        }
    }
}