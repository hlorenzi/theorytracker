export async function waitFrame()
{
    return new Promise((resolve, _) => requestAnimationFrame(resolve))
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