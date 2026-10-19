import { TAG_BODY } from '../../../utils/tag-patterns';
import type { AreaData, Replacement } from '../data';

/** The first constructor argument (one level of nested calls), followed by a second one. */
const SECOND_ARGUMENT = '\\((?:[^(),]|\\([^()]*\\))+,\\s*[^\\s)]';

const CONSTRUCTOR =
    '`KbqTreeOptionChange` takes only the option now: drop the second argument, the `isUserInput` it set was ' +
    'removed.';

/** Renames the `(from)` listener on an opening `<tag>` to `(to)`. */
function renameOutput(tag: string, from: string, to: string): Replacement {
    return { from: `(<${tag}(?![\\w-])${TAG_BODY}*?\\s)\\(${from}\\)(?=\\s*=)`, to: `$1(${to})` };
}

/**
 * Removed in 21.0.0: KbqTreeOptionChange.isUserInput and the constructor parameter that set it. Neither has a
 * replacement, so both are reported. The `isUserInput` of the select and tree-select change events stays.
 *
 * Deprecated for removal in 22.0.0: the `onSelectAll` and `onCopy` outputs of KbqTreeSelection and the
 * `onSelectionChange` output of KbqTreeOption, which emit the same events as their replacements, and
 * KbqTreeNode.mostRecentTreeNode. The outputs of the same names on the list selection, the tree-select and
 * KbqOption are not deprecated.
 */
export const tree: AreaData = {
    templateReplacements: [
        renameOutput('kbq-tree-selection', 'onSelectAll', 'selectAllChange'),
        renameOutput('kbq-tree-selection', 'onCopy', 'copyChange'),
        renameOutput('kbq-tree-option', 'onSelectionChange', 'selectionChange')
    ],
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
            // Matched before the rename above, so the deprecated name counts too.
            pattern: `<kbq-tree-option(?![\\w-])${TAG_BODY}*?\\((?:onS|s)electionChange\\)\\s*=\\s*"[^"]*\\$event\\??\\.isUserInput\\b`,
            message:
                '`KbqTreeOptionChange.isUserInput` was removed: the tree never set it, so `$event.isUserInput` of ' +
                'a `kbq-tree-option` was always `false`. Delete the check together with the branch it guarded.'
        },
        { pattern: `\\bnew\\s+KbqTreeOptionChange\\s*${SECOND_ARGUMENT}`, message: CONSTRUCTOR },
        {
            anchor: '\\bextends\\s+KbqTreeOptionChange\\b',
            pattern: `\\bsuper\\s*${SECOND_ARGUMENT}`,
            message: CONSTRUCTOR
        },
        {
            anchor: '\\bKbqTreeSelection\\b|["\']kbqTreeSelection["\']',
            pattern: '\\.(?:onSelectAll|onCopy)\\b',
            message:
                '`onSelectAll` and `onCopy` of `KbqTreeSelection` are deprecated and will be removed in 22.0.0: ' +
                'use `selectAllChange` and `copyChange`, which emit the same events. The outputs of the same ' +
                'names on `KbqListSelection` and `KbqTreeSelect` stay.'
        },
        {
            anchor: '\\bKbqTreeOption\\b|["\']kbqTreeOption["\']',
            pattern: '\\.onSelectionChange\\b',
            message:
                '`KbqTreeOption.onSelectionChange` is deprecated and will be removed in 22.0.0: use ' +
                '`selectionChange`, which emits the same event. The `onSelectionChange` of `KbqOption` stays.'
        },
        {
            // The CDK tree node has a static of the same name.
            anchor: '@koobiq/components/tree[\'"]',
            pattern: '\\.mostRecentTreeNode\\b',
            message:
                '`KbqTreeNode.mostRecentTreeNode` is deprecated and will be removed in 22.0.0: nothing in the ' +
                'library reads it, and it held the node created last on the page, in any tree. Query the nodes ' +
                'of the tree instead, for example with `viewChildren(KbqTreeOption)`.'
        }
    ]
};
