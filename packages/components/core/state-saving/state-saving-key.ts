import { InjectionToken } from '@angular/core';

/**
 * Produces the storage key for a component that persists state without being given a `stateSavingKey`.
 *
 * Returning an empty string means "this host cannot be identified": the component then persists
 * nothing rather than writing under a key a later load would not reproduce.
 */
export type KbqStateSavingKeyResolver = (host: Element | null) => string;

/**
 * Ids a component library generates. They carry an instantiation counter, so they are exactly as
 * unstable as the key this resolver replaces and never anchor a path.
 */
const generatedIdPattern = /^(kbq|cdk|mat|ng)[-_]/i;

/** The element's index among its preceding siblings of the same tag — `nth-of-type`, zero-based. */
const siblingIndex = (element: Element): number => {
    let index = 0;
    let sibling = element.previousElementSibling;

    while (sibling) {
        if (sibling.tagName === element.tagName) index++;

        sibling = sibling.previousElementSibling;
    }

    return index;
};

/**
 * The element the path continues from.
 *
 * `parentElement` is `null` at a shadow root, whose `host` continues the path in the light tree.
 * Without this every component inside a micro-frontend's shadow root would resolve to an empty key
 * (see `kbqShadowDomOverlayProvider`).
 */
const parentOf = (element: Element): Element | null =>
    element.parentElement ?? (element.getRootNode() as Partial<ShadowRoot>).host ?? null;

/**
 * Default `KbqStateSavingKeyResolver`: builds the key from where the host sits in the document.
 *
 * Each segment is the tag name, suffixed with `:n` when earlier siblings share it. An author-written
 * `id` ends the walk and becomes the root segment, which is what makes the key survive a restructuring
 * above the component — and gives an author a way to pin it without reaching for `stateSavingKey`.
 *
 * ```
 * app-root/main/kbq-accordion
 * app-root/main/kbq-accordion:1
 * #settings-panel/div/kbq-accordion
 * #faq
 * ```
 */
export const kbqStructuralStateSavingKey: KbqStateSavingKeyResolver = (host) => {
    const body = host?.ownerDocument?.body;

    if (!host || !body) return '';

    const segments: string[] = [];
    let element: Element | null = host;

    while (element && element !== body) {
        const id = element.getAttribute('id');

        if (id && !generatedIdPattern.test(id)) {
            segments.push(`#${id}`);

            return segments.reverse().join('/');
        }

        const tag = element.tagName.toLowerCase();
        const index = siblingIndex(element);

        segments.push(index ? `${tag}:${index}` : tag);
        element = parentOf(element);
    }

    // The walk ran out of ancestors without reaching `<body>`: the host is not in the document, so its
    // position is not something the next load can reproduce.
    return element === body ? segments.reverse().join('/') : '';
};

/**
 * Injection token for the strategy that derives a storage key from the host element when a component
 * persists state without a `stateSavingKey`. Defaults to `kbqStructuralStateSavingKey`.
 *
 * Replace it to key the state on something the DOM does not know about — an application that keeps the
 * same layout across parameterized routes can prefix the resolved key with the route it is on.
 *
 * @example
 * ```ts
 * providers: [
 *     {
 *         provide: KBQ_STATE_SAVING_KEY_RESOLVER,
 *         useFactory: () => {
 *             const router = inject(Router);
 *
 *             return (host: Element | null) => `${router.url}|${kbqStructuralStateSavingKey(host)}`;
 *         }
 *     }
 * ]
 * ```
 */
export const KBQ_STATE_SAVING_KEY_RESOLVER = new InjectionToken<KbqStateSavingKeyResolver>(
    'KBQ_STATE_SAVING_KEY_RESOLVER',
    { providedIn: 'root', factory: () => kbqStructuralStateSavingKey }
);
