export async function waitFrame()
{
    return new Promise((resolve, _) => requestAnimationFrame(resolve))
}


export async function waitSeconds(seconds: number)
{
    return new Promise((resolve, _) => setTimeout(resolve, seconds * 1000))
}


export class Mutex
{
    locked: boolean


    constructor()
    {
        this.locked = false
    }


    async acquire()
    {
        while (this.locked)
        {
            await waitFrame()
        }

        this.locked = true
    }


    async release()
    {
        this.locked = false
    }
}