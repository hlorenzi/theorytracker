import React from "react"


export interface GlobalObservable
{
    updateToken: boolean
    observers: (() => void)[]
    notifyObservers: () => void
}


export function makeGlobalObservable(): GlobalObservable
{
    const globalObs: GlobalObservable =
    {
        updateToken: false,
        observers: [],
        notifyObservers: () => {},
    }

    globalObs.notifyObservers = () =>
    {
        globalObs.updateToken = !globalObs.updateToken
        for (const obs of globalObs.observers)
            obs()
    }

    return globalObs
}


export function useGlobalObservable(globalObs: GlobalObservable)
{
    const [updateToken, setUpdateToken] = React.useState(globalObs.updateToken)


    React.useEffect(() =>
    {
        const callback = () =>
        {
            //console.log("useGlobalObservable.callback " + globalObs.updateToken)
            setUpdateToken(globalObs.updateToken)
        }

        globalObs.observers.push(callback)
        return () =>
        {
            globalObs.observers = globalObs.observers.filter(c => c !== callback)
        }

    }, [])
}