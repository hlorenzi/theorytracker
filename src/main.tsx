import * as Solid from "solid-js"
import * as SolidWeb from "solid-js/web"
import { styled } from "solid-styled-components"
import * as State from "./state.ts"
import * as Timeline from "./timeline"


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
    </AppRoot>
}


const AppRoot = styled.div`
    display: grid;
    grid-template: auto 1fr / 1fr;
    margin: auto;
    width: 100%;
    height: 100%;
    min-height: 0;
`


SolidWeb.render(
    App,
    document.getElementById("app")!)