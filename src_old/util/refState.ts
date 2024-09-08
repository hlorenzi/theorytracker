import React from "react"


export interface RefState<T>
{
    ref: React.MutableRefObject<T>
    update: boolean
    commit: () => void
}


export function useRefState<T>(initializer: () => T):  RefState<T>
{
    const [update, setUpdate] = React.useState(false)

    const ref = React.useRef<T>(null!)
    if (ref.current === null)
        ref.current = initializer()

    return {
        ref,
        update,
        commit: () => setUpdate(n => !n)
    }
}