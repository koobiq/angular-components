/** Part of a text field's value that is being completed: the query right before the caret. */
export interface KbqTextQuery {
    /** Index the query starts at, including its trigger character. Replacing the query starts here. */
    start: number;
    /** Index the query ends at — the caret. */
    end: number;
    /** Text to match the options against, without the trigger character. */
    text: string;
    /** Trigger the query starts with, or `null` when the query is the word before the caret. */
    trigger: string | null;
}

/** Options of {@link kbqGetTextQuery}. */
export interface KbqTextQueryOptions {
    /**
     * Strings that start a query, such as `/` for commands or `@` for mentions. When empty, the word before the
     * caret is the query.
     */
    triggers?: readonly string[];
    /** Shortest query that counts. Defaults to `1` for a word and to `0` after a trigger. */
    minLength?: number;
}

/** A character a word is made of: a letter, a combining mark or a digit of any script, `_` or `-`. */
const WORD_CHARACTER = /^[\p{L}\p{M}\p{N}_-]$/u;

const WHITESPACE = /\s/;

/**
 * Query right before `caret` in `value`, or `null` when the text there is not one.
 *
 * With `triggers`, the query runs from the closest trigger to the caret. The trigger has to start the line or
 * follow whitespace — so that the `@` of an e-mail address opens nothing — and no whitespace may stand between it
 * and the caret. Without `triggers`, the query is the word the caret ends.
 */
export const kbqGetTextQuery = (
    value: string,
    caret: number,
    { triggers = [], minLength }: KbqTextQueryOptions = {}
): KbqTextQuery | null => {
    if (triggers.length) {
        return findTriggeredQuery(value.slice(0, caret), triggers, minLength ?? 0);
    }

    const start = findWordStart(value, caret);

    if (caret - start < (minLength ?? 1)) return null;

    return { start, end: caret, text: value.slice(start, caret), trigger: null };
};

/**
 * Start of the word that ends at `caret`, walking back one code point at a time. A pattern anchored at the caret is
 * retried from every position of a long run of word characters that does not reach it, which takes seconds for a
 * pasted token.
 */
const findWordStart = (value: string, caret: number): number => {
    let start = caret;

    while (start > 0) {
        const previous = value.charCodeAt(start - 1);
        // The second half of a surrogate pair is read together with the first.
        const size = previous >= 0xdc00 && previous <= 0xdfff && start > 1 ? 2 : 1;

        if (!WORD_CHARACTER.test(value.slice(start - size, start))) break;

        start -= size;
    }

    return start;
};

const findTriggeredQuery = (
    beforeCaret: string,
    triggers: readonly string[],
    minLength: number
): KbqTextQuery | null => {
    let closest: KbqTextQuery | null = null;

    for (const trigger of triggers) {
        if (!trigger) continue;

        const start = beforeCaret.lastIndexOf(trigger);

        if (start < 0 || (closest && start <= closest.start)) continue;

        const text = beforeCaret.slice(start + trigger.length);
        const startsToken = start === 0 || WHITESPACE.test(beforeCaret[start - 1]);

        if (!startsToken || WHITESPACE.test(text)) continue;

        closest = { start, end: beforeCaret.length, text, trigger };
    }

    return closest && closest.text.length >= minLength ? closest : null;
};
