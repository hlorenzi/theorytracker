import * as Solid from "solid-js"
import * as SolidWeb from "solid-js/web"
import { styled } from "solid-styled-components"
import * as State from "./state.ts"
import * as Timeline from "./timeline"
import * as Ui from "./ui"
import { setupKeyboardShortcuts } from "./shortcuts.ts"


function App()
{
    State.get()
    setupKeyboardShortcuts()

    return <AppRoot>
        <Timeline.Element/>
        <Ui.InspectorRoot/>
    </AppRoot>
}


const AppRoot = styled.div`
    display: grid;
    grid-template: 1fr 1fr / 1fr;
    margin: auto;
    width: 100%;
    height: 100%;
    min-height: 0;
    padding: 2em 0;
    box-sizing: border-box;
    background-color: #101215;
    color: #fff;
    font-family: Verdana;

    --theme-buttonBkg: #444;
    --theme-buttonBkgHover: #555;
    --theme-buttonBkgPress: #333;
    --theme-buttonBkgSelected: #06a;
    --theme-buttonBorderRadius: 0.25em;
`


SolidWeb.render(
    App,
    document.getElementById("app")!)