import stylelint, { type Rule } from 'stylelint';

const ruleName = 'koobiq/use-block';

const messages = stylelint.utils.ruleMessages(ruleName, {
    gap: 'Expected no empty line between `@use` and `@forward` statements.',
    order: 'Expected `@use` and `@forward` before any other statement.'
});

const isLoad = (node: { type: string; name?: string }): boolean =>
    node.type === 'atrule' && (node.name === 'use' || node.name === 'forward');

/** Keeps the `@use` and `@forward` statements of a file in one block at its top, so its dependencies read as a list. */
const rule: Rule = (primary) => (root, result) => {
    if (!stylelint.utils.validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;

    let afterLoad = false;
    let afterOther = false;

    for (const node of root.nodes) {
        if (!isLoad(node)) {
            // Sass lets a variable come before `@use`, so that a `with (...)` clause can pass it.
            if (
                node.type === 'comment' ||
                (node.type === 'decl' && node.prop.startsWith('$')) ||
                (node.type === 'atrule' && node.name === 'charset')
            ) {
                continue;
            }

            afterOther = true;
            afterLoad = false;
            continue;
        }

        if (afterOther) {
            stylelint.utils.report({ result, ruleName, node, message: messages.order });
        } else if (afterLoad && /\n[ \t]*\r?\n/.test(node.raws.before ?? '')) {
            stylelint.utils.report({
                result,
                ruleName,
                node,
                message: messages.gap,
                fix: () => {
                    node.raws.before = '\n';
                }
            });
        }

        afterLoad = true;
    }
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = { fixable: true, url: '' };

export default stylelint.createPlugin(ruleName, rule);
