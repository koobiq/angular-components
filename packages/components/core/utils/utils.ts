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
