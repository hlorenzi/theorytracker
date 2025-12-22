import * as Solid from "solid-js"
import * as SolidWeb from "solid-js/web"
import { styled } from "solid-styled-components"
import * as State from "./state.ts"
import * as Timeline from "./timeline"
import * as Inspector from "./inspector"


function App()
{
    return <AppRoot>
        <div>
            Hello, world! { State.get().test }<br/>
            <button onClick={ () => { State.get().test++; State.refresh() }}>
                Increment
            </button>
        </div>
        <Timeline.Element/>
        <Inspector.InspectorRoot/>
    </AppRoot>
}


const AppRoot = styled.div`
    display: grid;
    grid-template: auto 1fr 1fr / 1fr;
    margin: auto;
    width: 100%;
    height: 100%;
    min-height: 0;
    box-sizing: border-box;
    background-color: #101215;
    color: #fff;
    font-family: Verdana;

    --theme-buttonBkg: #444;
    --theme-buttonBkgHover: #555;
    --theme-buttonBkgPress: #333;
    --theme-buttonBkgSelected: #06a;
`


SolidWeb.render(
    App,
    document.getElementById("app")!)