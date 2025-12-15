import * as Project from "../project"
import * as Timeline from "./index.ts"
import Rect from "../utils/rect.ts"
import Rational from "../utils/rational.ts"
import Range from "../utils/range.ts"


export function mouseUp(
    timeline: Timeline.State,
    project: Project.Mutable,
    rightButton: boolean)
{
    if (!timeline.mouse.down)
        return
            
    timeline.mouse.down = false
    timeline.mouse.action = Timeline.MouseAction.None

    const origProject = project.root
    Timeline.selectionResolveOverlappingAndDegenerate(timeline, project)
    return project.root !== origProject
}