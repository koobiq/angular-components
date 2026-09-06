export type Orientation = 'horizontal' | 'vertical';
export type Direction = 'ltr' | 'rtl';

export const ENTRY_FOCUS = 'rovingFocusGroup.onEntryFocus';
export const EVENT_OPTIONS = { bubbles: false, cancelable: true };

type FocusIntent = 'first' | 'last' | 'prev' | 'next';

/**
 * `PageUp`/`PageDown` are deliberately absent: the primitive is used by navigation trails rather than by
 * composite widgets, and swallowing the paging keys stops the document from scrolling.
 */
export const MAP_KEY_TO_FOCUS_INTENT: Record<string, FocusIntent> = {
    ArrowLeft: 'prev',
    ArrowUp: 'prev',
    ArrowRight: 'next',
    ArrowDown: 'next',
    Home: 'first',
    End: 'last'
};

export function getDirectionAwareKey(key: string, dir?: Direction) {
    if (dir !== 'rtl') return key;

    return key === 'ArrowLeft' ? 'ArrowRight' : key === 'ArrowRight' ? 'ArrowLeft' : key;
}

export function getFocusIntent(event: KeyboardEvent, orientation?: Orientation, dir?: Direction) {
    const key = getDirectionAwareKey(event.key, dir);

    if (orientation === 'vertical' && ['ArrowLeft', 'ArrowRight'].includes(key)) return undefined;
    if (orientation === 'horizontal' && ['ArrowUp', 'ArrowDown'].includes(key)) return undefined;

    return MAP_KEY_TO_FOCUS_INTENT[key];
}

/**
 * The node that owns the `activeElement` of a given element: its shadow root when it has one, its
 * document otherwise. Taken from the element rather than from a global so the helper stays usable
 * outside a browser and inside shadow DOM.
 */
export function getActiveElementRoot(element: HTMLElement): Document | ShadowRoot {
    const rootNode = element.getRootNode();

    return 'activeElement' in rootNode ? (rootNode as Document | ShadowRoot) : element.ownerDocument;
}

export function focusFirst(candidates: HTMLElement[], preventScroll = false, rootNode?: Document | ShadowRoot) {
    const root = rootNode ?? (candidates.length ? getActiveElementRoot(candidates[0]) : undefined);
    const previouslyFocusedElement = root?.activeElement ?? null;

    for (const candidate of candidates) {
        // if focus is already where we want to go, we don't want to keep going through the candidates
        if (candidate === previouslyFocusedElement) return;
        candidate.focus({ preventScroll });
        if (root?.activeElement !== previouslyFocusedElement) return;
    }
}

/**
 * Wraps an array around itself at a given start index
 * Example: `wrapArray(['a', 'b', 'c', 'd'], 2) === ['c', 'd', 'a', 'b']`
 */
export function wrapArray<T>(array: T[], startIndex: number) {
    return array.map((_, index) => array[(startIndex + index) % array.length]);
}

export function generateId(): string {
    return `rf-item-${Math.random().toString(36).slice(2, 11)}`;
}
