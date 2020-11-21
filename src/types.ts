declare class ResizeObserver
{
    constructor(callback: (entries: any) => void)
    observe(elem: HTMLElement): void
    unobserve(elem: HTMLElement): void
}