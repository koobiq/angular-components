import { escapeRegExp } from '../highlight/highlight-base';

export function wrappedErrorMessage(e: Error) {
    return new RegExp(escapeRegExp(e.message));
}
