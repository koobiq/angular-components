import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compileString, Logger } from 'sass';
import stylelint, { type Rule } from 'stylelint';

const ruleName = 'koobiq/no-unused-use';

const messages = stylelint.utils.ruleMessages(ruleName, {
    unused: (namespace: string) => `The members of "${namespace}" are never read and loading it emits no CSS.`
});

/** The URL of a `@use`, its `as` name and whether it has a `with` clause. */
const USE_PARAMS = /^['"]([^'"]+)['"](?:\s+as\s+([\w-]+|\*))?(\s+with\b)?/;

/**
 * Comments, where a mention of a namespace does not read it, and the heads of the `@use` statements. A `with (...)`
 * clause stays: a value it passes can read another module.
 */
const NOT_CODE = /\/\*[\s\S]*?\*\/|\/\/.*$|^\s*@use\s+['"][^'"]*['"](?:\s+as\s+[\w*-]+)?/gm;

/** The placeholders a file extends: a module that only defines placeholders emits CSS once one of them is extended. */
const EXTENDED_PLACEHOLDER = /@extend\s+(%[\w-]+)/g;

const defaultNamespace = (url: string): string => {
    const lastSegment = url.split(/[/:]/).pop() ?? url;

    return lastSegment.replace(/^_/, '').replace(/\.s?css$/, '');
};

/**
 * Whether loading a module emits CSS, which is what a `@use` without any member read is for: tokens, fonts, global
 * styles, or a placeholder the file extends. A module that does not load from here, such as a build output, counts as
 * emitting: only a build can tell.
 */
const emitsCss = (url: string, from: string, placeholders: string[]): boolean => {
    const directory = dirname(from);
    const extensions = placeholders.map((placeholder) => `@extend ${placeholder} !optional;`).join(' ');

    try {
        const { css } = compileString(`@use '${url}';${extensions && ` .__no-unused-use { ${extensions} }`}`, {
            url: pathToFileURL(join(directory, '__no-unused-use.scss')),
            loadPaths: [
                process.cwd(),
                join(process.cwd(), 'node_modules'),
                directory
            ],
            logger: Logger.silent
        });

        return css.trim().length > 0;
    } catch {
        return true;
    }
};

/**
 * Disallows a `@use` that does nothing: none of its members are read and the module emits no CSS. Run on `as *` it can
 * not tell which names come from the module, so `scss/at-use-no-unnamespaced` keeps those out.
 */
const rule: Rule = (primary) => (root, result) => {
    if (!stylelint.utils.validateOptions(result, ruleName, { actual: primary, possible: [true] })) return;

    const source = root.source?.input.file;
    const code = root.toString().replace(NOT_CODE, '');
    const placeholders = [
        ...new Set(Array.from(code.matchAll(EXTENDED_PLACEHOLDER), ([, placeholder]) => placeholder!))
    ];

    root.walkAtRules('use', (atRule) => {
        const [, url, alias, configured] = atRule.params.match(USE_PARAMS) ?? [];

        // A configured module is loaded for its configuration, which the modules that load it after this one share.
        if (!url || alias === '*' || configured) return;

        const namespace = alias ?? defaultNamespace(url);
        const isRead = new RegExp(`(^|[^\\w$.-])${namespace}\\.[\\w$-]|['"]${namespace}['"]`).test(code);

        if (isRead) return;
        if (!url.startsWith('sass:') && (!source || emitsCss(url, source, placeholders))) return;

        stylelint.utils.report({
            result,
            ruleName,
            node: atRule,
            word: atRule.params,
            message: messages.unused(namespace),
            fix: () => {
                atRule.remove();
            }
        });
    });
};

rule.ruleName = ruleName;
rule.messages = messages;
rule.meta = { fixable: true, url: '' };

export default stylelint.createPlugin(ruleName, rule);
