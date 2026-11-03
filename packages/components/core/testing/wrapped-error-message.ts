import { escapeRegExp } from '../highlight/highlight-base';

/** @docs-private */
export function wrappedErrorMessage(e: Error) {
    return new RegExp(escapeRegExp(e.message));
}
