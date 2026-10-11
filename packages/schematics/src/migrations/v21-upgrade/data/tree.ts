import type { AreaData } from '../data';

/** The first constructor argument (one level of nested calls), followed by a second one. */
const SECOND_ARGUMENT = '\\((?:[^(),]|\\([^()]*\\))+,\\s*[^\\s)]';

const CONSTRUCTOR =
    '`KbqTreeOptionChange` takes only the option now: drop the second argument, the `isUserInput` it set was ' +
    'removed.';

/**
 * Removed in 21.0.0: KbqTreeOptionChange.isUserInput and the constructor parameter that set it. Neither has a
 * replacement, so both are reported. The `isUserInput` of the select and tree-select change events stays.
 */
export const tree: AreaData = {
    warnPatterns: [
        {
            anchor: '\\bKbqTreeOptionChange\\b',
            // `$event` in a template is the next pattern's.
            pattern: '(?<!\\$event\\??)\\.isUserInput\\b',
            message:
                '`KbqTreeOptionChange.isUserInput` was removed: the tree never set it, so it was always `false`. ' +
                'If this `isUserInput` is read from a tree option change, delete the check together with the ' +
                'branch it guarded.'
        },
        {
            pattern:
                '<kbq-tree-option\\b[^>]*?\\((?:onS|s)electionChange\\)\\s*=\\s*"[^"]*\\$event\\??\\.isUserInput\\b',
            message:
                '`KbqTreeOptionChange.isUserInput` was removed: the tree never set it, so `$event.isUserInput` of ' +
                'a `kbq-tree-option` was always `false`. Delete the check together with the branch it guarded.'
        },
        { pattern: `\\bnew\\s+KbqTreeOptionChange\\s*${SECOND_ARGUMENT}`, message: CONSTRUCTOR },
        {
            anchor: '\\bextends\\s+KbqTreeOptionChange\\b',
            pattern: `\\bsuper\\s*${SECOND_ARGUMENT}`,
            message: CONSTRUCTOR
        }
    ]
};
