import { booleanAttribute, numberAttribute } from '@angular/core';

export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

/** Whether the value is undefined. */
export const isUndefined = (value: unknown): value is undefined => {
    return value === undefined;
};

/** Whether the value is null. */
export const isNull = (value: unknown): value is null => {
    return value === null;
};

/** Whether the value is HTMLElement. */
export const isHtmlElement = (value: unknown): value is HTMLElement => {
    return value instanceof HTMLElement;
};

/** Whether the value is Element. */
export const isElement = (value: unknown): value is Element => value instanceof Element;

/** Whether the value is HTMLElement or null. */
export const isHtmlElementOrNull = (value: unknown): value is HTMLElement | null => {
    return isHtmlElement(value) || isNull(value);
};

export const getNodesWithoutComments = (nodes: NodeList): Node[] => {
    return Array.from(nodes).filter((node) => node.nodeType !== Node.COMMENT_NODE);
};

/**
 * Child nodes that take part in the icon detection: comments and whitespace-only text nodes are
 * ignored so that detection does not depend on `preserveWhitespaces`.
 */
export const getContentNodes = (element: Node): Node[] => {
    return getNodesWithoutComments(element.childNodes).filter(
        (node) => node.nodeType !== Node.TEXT_NODE || !!node.textContent?.trim()
    );
};

/** Host tags that support the native `disabled` attribute. */
const nativelyDisableableTags = new Set([
    'button',
    'input',
    'select',
    'textarea'
]);

/** Whether the element supports the native `disabled` attribute; on any other host it is invalid HTML. */
export const supportsNativeDisabled = (element: Element): boolean =>
    nativelyDisableableTags.has(element.nodeName.toLowerCase());

/**
 * Coerces an attribute value to a number, reporting `undefined` for anything that is not a finite one.
 *
 * `numberAttribute` falls back to `NaN`, which is not nullish, so it walks past every `??` and reaches
 * the arithmetic - a valueless attribute ends up rendering `NaNpx`. Use this wherever the input is
 * declared `number | undefined`.
 */
export const kbqOptionalNumberAttribute = (value: unknown): number | undefined => {
    if (value == null) return undefined;

    const coerced = numberAttribute(value);

    return Number.isFinite(coerced) ? coerced : undefined;
};

/**
 * Coerces an attribute value to a boolean while keeping `null` and `undefined` apart from `false`.
 *
 * `booleanAttribute` folds both into `false`, which erases the "no answer yet" state a tri-state input
 * needs. Both nullish values are reported as-is.
 */
export const kbqNullableBooleanAttribute = (value: unknown): boolean | null | undefined =>
    value == null ? (value as null | undefined) : booleanAttribute(value);

export const leftIconClassName = 'kbq-icon_left';
export const rightIconClassName = 'kbq-icon_right';

/** Whether the current platform is a Mac. */
export function isMac(): boolean {
    // eslint-disable-next-line no-restricted-globals
    return /^mac/i.test(navigator?.platform);
}

/** Converts an enumeration (enum) type into a string literal type containing
 * all possible string representations of the values. */
export type KbqEnumValues<T extends string | number> = `${T}`;

/**
 * Recursive counterpart of `Partial<T>`: every property at every depth becomes optional.
 *
 * Arrays and functions are passed through unchanged — making the elements of `string[]` optional
 * would turn it into `{ 0?: string }`, which is never what a partial override means.
 */
export type KbqDeepPartial<T> = T extends (...args: never[]) => unknown
    ? T
    : T extends readonly unknown[]
      ? T
      : T extends object
        ? { [K in keyof T]?: KbqDeepPartial<T[K]> }
        : T;

const isMergeableObject = (value: unknown): value is Record<string, unknown> =>
    !!value && typeof value === 'object' && !Array.isArray(value);

/**
 * Recursively completes `patch` from `base` — the runtime counterpart of {@link KbqDeepPartial}.
 *
 * A shallow spread would be wrong for any `T` with a nested section: `{ ...base, ...patch }` replaces a
 * whole sub-object, dropping the sibling keys the patch never mentioned.
 *
 * Returns `base` itself whenever the patch adds nothing, so that overriding one section leaves every
 * other section referentially identical to the object it was completed from.
 */
export const kbqDeepMerge = <T>(base: T, patch: NoInfer<KbqDeepPartial<T>> | undefined): T => {
    if (patch === undefined) return base;
    if (!isMergeableObject(base) || !isMergeableObject(patch)) return patch as T;

    const result: Record<string, unknown> = { ...base };
    let changed = false;

    for (const key of Object.keys(patch)) {
        const merged = kbqDeepMerge(base[key], patch[key]);

        if (merged !== result[key]) {
            result[key] = merged;
            changed = true;
        }
    }

    return (changed ? result : base) as T;
};
