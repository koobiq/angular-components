import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { logMessage } from '../../utils/messages';
import { addPackageToPackageJson, getPackageVersionFromPackageJson } from '../../utils/package-config';

const VERSIONS = {
    KOOBIQ_DESIGN_TOKENS: '^0.0.0'
};

const PACKAGE = '@koobiq/design-tokens';

/** Writes `version` over the entry the project already has, wherever it declared it. */
function setPackageVersion(tree: Tree, pkg: string, version: string): boolean {
    if (!tree.exists('package.json')) return false;

    const json = JSON.parse(tree.read('package.json')!.toString('utf-8'));
    const section = ['dependencies', 'devDependencies'].find((name) => json[name]?.[pkg]);

    if (!section) return false;

    json[section][pkg] = version;
    tree.overwrite('package.json', JSON.stringify(json, null, 2));

    return true;
}

/**
 * `@koobiq/components` requires `@koobiq/design-tokens` 4 now.
 *
 * The bump is not optional: v4 removed the component tokens, and the library stopped declaring
 * copies of the three it still ships — code-block, scrollbar and skeleton — so a project left on v3
 * renders those three with no values at all. The rest of the upgrade is a consumer's own
 * stylesheets, which `@koobiq/design-tokens` ships a codemod for; pointing at it beats a second,
 * worse implementation of the same rewrite here.
 */
export default function migrate(): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const declared = getPackageVersionFromPackageJson(tree, PACKAGE, true);

        if (declared) {
            setPackageVersion(tree, PACKAGE, VERSIONS.KOOBIQ_DESIGN_TOKENS);
        } else {
            // A project can reach the tokens through the library's peer dependency alone, in which
            // case npm has installed them and nothing says so in package.json.
            addPackageToPackageJson(tree, PACKAGE, VERSIONS.KOOBIQ_DESIGN_TOKENS);
        }

        context.addTask(new NodePackageInstallTask());

        logMessage(context.logger, [
            `\`${PACKAGE}\` was set to "${VERSIONS.KOOBIQ_DESIGN_TOKENS}". Three things need doing by hand:`,
            '',
            '1. Add the component tokens to your styles, next to the `css-tokens*.css` you already',
            '   load: `component-tokens.css` plus the light and/or dark half. They are opt-in in v4,',
            '   and the library carries no copies, so code-block, scrollbar and skeleton render',
            '   unstyled without them.',
            '2. Run `npx koobiq-tokens-codemod src` over your own styles and templates. It rewrites',
            '   the import paths that moved (`web/new/**` → `web/css/**`) and the tokens that have a',
            '   one-for-one replacement, and reports the rest — the removed `--kbq-palette-*` scale,',
            '   `--kbq-background-overlay-theme`, and any component token you referenced directly.',
            '3. Look at your code blocks and scrollbars. Those are the only two places v4 changes',
            '   pixels without being asked.'
        ]);
    };
}
