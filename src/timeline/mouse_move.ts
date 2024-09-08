import * as Project from "../project"
import * as Timeline from "./index.ts"
import Rect from "../utils/rect.ts"
import Range from "../utils/range.ts"


export function mouseMove(
    timeline: Timeline.State,
    project: Project.ImmutableRoot,
    x: number,
    y: number)
{
    timeline.mouse.point = Timeline.pointAt(timeline, x, y)

    if (!timeline.mouse.down)
    {
        timeline.hover = undefined
        hoverRecursive(timeline, timeline.layout.elements, x, y)
    }
}


function hoverRecursive(
    timeline: Timeline.State,
    elements: Timeline.LayoutElement[],
    x: number,
    y: number)
{
    for (const elem of elements)
    {
        if (x >= elem.rect.x &&
            x < elem.rect.x + elem.rect.w &&
            y >= elem.rect.y &&
            y < elem.rect.y + elem.rect.h)
        {
            if (timeline.hover === undefined ||
                (elem.priority ?? 0) >= (timeline.hover.priority ?? 0))
                timeline.hover = elem

            if (elem.subElements)
                hoverRecursive(timeline, elem.subElements, x, y)
        }
    }
}