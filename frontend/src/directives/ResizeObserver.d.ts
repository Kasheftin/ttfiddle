export interface Window {
  ResizeObserver: ResizeObserver
}

export type ResizeObserver = {
  new (callback: ResizeObserverCallback): ResizeObserver
  observe: (target: Element) => void
  unobserve: (target: Element) => void
  disconnect: () => void
}

export type ResizeObserverCallback = (
  entries: ResizeObserverEntry[],
  observer: ResizeObserver,
) => void

export interface ResizeObserverEntry {
  readonly borderBoxSize: ResizeObserverEntryBoxSize
  readonly contentBoxSize: ResizeObserverEntryBoxSize
  readonly contentRect: DOMRectReadOnly
  readonly target: Element
}

export interface ResizeObserverEntryBoxSize {
  blockSize: number
  inlineSize: number
}
