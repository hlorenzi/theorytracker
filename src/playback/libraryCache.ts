import { sflibUrl, SflibMeta, SflibInstrument } from "./library"
import zlib from "zlib"


const sflibCache = new Map<string, SflibInstrument>()


export async function sflibGetInstrument(meta: SflibMeta, id: string): Promise<SflibInstrument | null>
{
    const cached = sflibCache.get(id)
    if (cached)
        return cached

    const [collectionId, instrumentId] = id.split("/")
    const collMeta = meta.collections.find(c => c.id == collectionId)
    if (!collMeta)
        return null
    
    const instrMeta = collMeta.instruments.find(i => i.id == instrumentId)
    if (!instrMeta)
        return null

    const instrFilename = instrMeta.filename

    const data = await fetch(sflibUrl + collectionId + "/" + instrFilename)
    const dataCompressed = await data.arrayBuffer()
    console.log(dataCompressed)
    const instr: SflibInstrument = JSON.parse(zlib.inflateSync(Buffer.from(dataCompressed)).toString("utf8"))

    console.log("loaded sflib instrument", instr)

    sflibCache.set(id, instr)
    return instr
}