import * as Project from "../project"
import * as Timeline from "./index.ts"
import * as Playback from "../playback"
import * as Prefs from "../prefs.ts"
import * as Theory from "../theory/index.ts"
import Rect from "../utils/rect.ts"
import Range from "../utils/range.ts"
import Rational from "../utils/rational.ts"


export class Lane
{
    rect: Rect = Rect.fromVertices(0, 0, 0, 0)

    laneIndex: number = -1
    elements: Timeline.LayoutElement[] = []


    constructor()
    {
        
    }
    
    
    add(elem: Timeline.LayoutElement)
    {
        this.elements.push(elem)
    }


    refreshLayout(
        timeline: Timeline.State,
        project: Project.ImmutableRoot,
        prefs: Prefs.Prefs)
    {

    }


    *iterElementsAtRegion(
        timeline: Timeline.State,
        project: Project.ImmutableRoot,
        range: Range,
        verticalRegion?: { y1: number, y2: number })
        : Generator<Project.ID, void, void>
    {
        
    }
    
    
    click(
        timeline: Timeline.State,
        project: Project.ImmutableRoot,
        playback: Playback.Manager,
        element: Timeline.LayoutElement)
    {

    }


    findPreviousAnchor(
        timeline: Timeline.State,
        project: Project.ImmutableRoot,
        time: Rational)
        : Rational | null
    {
        return null
    }
	
	
	deleteRange(
        timeline: Timeline.State,
        project: Project.Mutable,
        range: Range)
	{
        
	}


    insertByDegree(
        timeline: Timeline.State,
        project: Project.Mutable,
        playback: Playback.Manager,
        prefs: Prefs.Prefs,
        time: Rational,
        degree: number)
    {

    }


    rowAtY(
        timeline: Timeline.State,
        y: number)
    {
        return 0
    }
}