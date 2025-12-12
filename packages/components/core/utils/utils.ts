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

/**
 * Will be removed in the next major release
 *
 * @deprecated Use `booleanAttribute` instead
 */
export function toBoolean(value: unknown): boolean {
    return value != null && `${value}` !== 'false';
}

export const getNodesWithoutComments = (nodes: NodeList): Node[] => {
    const COMMENT_NODE = 8;

    return Array.from(nodes).filter((node) => node.nodeType !== COMMENT_NODE);
};

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
