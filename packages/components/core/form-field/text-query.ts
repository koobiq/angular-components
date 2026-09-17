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

/** Characters a word is made of: letters and digits of any script, `_` and `-`. */
const WORD_BEFORE_CARET = /[\p{L}\p{N}_-]+$/u;

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
    const beforeCaret = value.slice(0, caret);

    if (triggers.length) {
        return findTriggeredQuery(beforeCaret, triggers, minLength ?? 0);
    }

    const word = WORD_BEFORE_CARET.exec(beforeCaret)?.[0] ?? '';

    if (word.length < (minLength ?? 1)) return null;

    return { start: caret - word.length, end: caret, text: word, trigger: null };
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
