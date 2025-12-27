import * as Theory from "./index.ts"


export type ChordStacking = 0 | 7 | 9 | 11 | 13


export interface ChordOptions
{
    withStacking: ChordStacking
    withSus2: boolean
    withSus4: boolean
    withAdd9: boolean
    withAdd11: boolean
    withAdd13: boolean
    withNo3: boolean
    withNo5: boolean
    withFlat5: boolean
    withSharp5: boolean
    withFlat9: boolean
    withSharp9: boolean
    withSharp11: boolean
    withFlat13: boolean
    borrowFromScaleId?: string
}


export namespace ChordOptions
{
    export function makeEmpty(): ChordOptions
    {
        return {
            withStacking: 0,
            withSus2: false,
            withSus4: false,
            withAdd9: false,
            withAdd11: false,
            withAdd13: false,
            withNo3: false,
            withNo5: false,
            withFlat5: false,
            withSharp5: false,
            withFlat9: false,
            withSharp9: false,
            withSharp11: false,
            withFlat13: false,
            borrowFromScaleId: undefined,
        }
    }


    export function buildChord(
        key: Theory.Key,
        rootDegree: number,
        opts: ChordOptions)
    {
        let chord = Theory.Chord.fromDiatonicTriad(key, rootDegree)

        if (opts.withStacking >= 7)
            chord = chord.withAdded7(key)

        if (opts.withStacking >= 9)
            chord = chord.withAdded9(key)

        if (opts.withStacking >= 11)
            chord = chord.withAdded11(key)

        if (opts.withStacking >= 13)
            chord = chord.withAdded13(key)

        if (opts.withSus2)
            chord = chord.withSuspended2(key)

        if (opts.withSus4)
            chord = chord.withSuspended4(key)

        if (opts.withAdd9)
            chord = chord.withAdded9(key)

        if (opts.withAdd11)
            chord = chord.withAdded11(key)

        if (opts.withAdd13)
            chord = chord.withAdded13(key)

        if (opts.withFlat5)
            chord = chord.withAdded5(key, -1)

        if (opts.withSharp5)
            chord = chord.withAdded5(key, 1)

        if (opts.withFlat9)
            chord = chord.withAdded9(key, -1)

        if (opts.withSharp9)
            chord = chord.withAdded9(key, 1)

        if (opts.withSharp11)
            chord = chord.withAdded11(key, 1)

        if (opts.withFlat13)
            chord = chord.withAdded13(key, -1)

        if (opts.withNo3)
            chord = chord.withNo3()

        if (opts.withNo5)
            chord = chord.withNo5()

        return chord
    }


    export function makeFromChord(
        key: Theory.Key,
        chord: Theory.Chord)
        : ChordOptions
    {
        for (const withStacking of [0, 7, 9, 11, 13] satisfies ChordStacking[])
        {
            for (let degree = 0; degree < 7; degree++)
            {
                const testOpts: ChordOptions = { ...makeEmpty(), withStacking }
                if (chord.isEqual(buildChord(key, degree, testOpts)))
                    return testOpts
            }
        }

        const opts = makeEmpty()
        
        if (chord.add7 !== undefined)
        {
            opts.withStacking = 7
            if (chord.add9 !== undefined)
            {
                opts.withStacking = 9
                if (chord.add11 !== undefined)
                {
                    opts.withStacking = 11
                    if (chord.add13 !== undefined)
                        opts.withStacking = 13
                }
            }
        }

        if (chord.sus2 !== undefined)
            opts.withSus2 = true

        if (chord.sus4 !== undefined)
            opts.withSus4 = true

        if (chord.no3)
            opts.withNo3 = true

        if (chord.no5)
            opts.withNo3 = true

        if (chord.add5 === -1)
            opts.withFlat5 = true

        if (chord.add5 === 1)
            opts.withSharp5 = true

        if (chord.add9 === -1)
            opts.withFlat9 = true

        if (chord.add9 === 0)
            opts.withAdd9 = true

        if (chord.add9 === 1)
            opts.withSharp9 = true

        if (chord.add11 === 0)
            opts.withAdd11 = true

        if (chord.add11 === 1)
            opts.withSharp11 = true

        if (chord.add13 === -1)
            opts.withFlat13 = true

        if (chord.add13 === 0)
            opts.withAdd13 = true

        return opts
    }
}