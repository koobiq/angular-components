export function isBoolean(value: unknown): value is boolean {
    return typeof value === 'boolean';
}

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
    return /^mac/i.test(navigator?.platform);
}
