import type { Path } from '@angular-devkit/core';
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { visitProjectFiles } from '../../utils/project-files';
import type { Schema } from './schema';

/**
 * The 119 keycode constants `@koobiq/components/core` still exports — deprecated there in favor of
 * `@angular/cdk/keycodes` and removed in 22.0.0. Mirrored from the library: a schematic cannot
 * import it, and the consumer's installed version may predate the change.
 */
const KEYCODE_NAMES: ReadonlySet<string> = new Set([
    'MAC_ENTER',
    'BACKSPACE',
    'TAB',
    'NUM_CENTER',
    'ENTER',
    'SHIFT',
    'CONTROL',
    'ALT',
    'PAUSE',
    'CAPS_LOCK',
    'ESCAPE',
    'SPACE',
    'PAGE_UP',
    'PAGE_DOWN',
    'END',
    'HOME',
    'LEFT_ARROW',
    'UP_ARROW',
    'RIGHT_ARROW',
    'DOWN_ARROW',
    'PLUS_SIGN',
    'PRINT_SCREEN',
    'INSERT',
    'DELETE',
    'ZERO',
    'ONE',
    'TWO',
    'THREE',
    'FOUR',
    'FIVE',
    'SIX',
    'SEVEN',
    'EIGHT',
    'NINE',
    'FF_SEMICOLON',
    'FF_EQUALS',
    'QUESTION_MARK',
    'AT_SIGN',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'META',
    'MAC_WK_CMD_LEFT',
    'MAC_WK_CMD_RIGHT',
    'CONTEXT_MENU',
    'NUMPAD_ZERO',
    'NUMPAD_ONE',
    'NUMPAD_TWO',
    'NUMPAD_THREE',
    'NUMPAD_FOUR',
    'NUMPAD_FIVE',
    'NUMPAD_SIX',
    'NUMPAD_SEVEN',
    'NUMPAD_EIGHT',
    'NUMPAD_NINE',
    'NUMPAD_MULTIPLY',
    'NUMPAD_PLUS',
    'NUMPAD_MINUS',
    'NUMPAD_PERIOD',
    'NUMPAD_DIVIDE',
    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
    'F7',
    'F8',
    'F9',
    'F10',
    'F11',
    'F12',
    'NUM_LOCK',
    'SCROLL_LOCK',
    'FIRST_MEDIA',
    'FF_MINUS',
    'MUTE',
    'VOLUME_DOWN',
    'VOLUME_UP',
    'FF_MUTE',
    'FF_VOLUME_DOWN',
    'LAST_MEDIA',
    'FF_VOLUME_UP',
    'SEMICOLON',
    'EQUALS',
    'COMMA',
    'DASH',
    'PERIOD',
    'SLASH',
    'APOSTROPHE',
    'TILDE',
    'OPEN_SQUARE_BRACKET',
    'BACKSLASH',
    'CLOSE_SQUARE_BRACKET',
    'SINGLE_QUOTE',
    'MAC_META'
]);

const CORE_SPECIFIER = '@koobiq/components/core';
const CDK_SPECIFIER = '@angular/cdk/keycodes';
const TS_EXT = '.ts';

/**
 * An `import` / `export ... from` statement with named bindings from `core`; the binding list is
 * matched whole so multiline lists qualify. Quote-anchored on the exact specifier.
 */
const STATEMENT_FROM_CORE = /(import|export)(\s+type)?\s*\{([^{}]*)\}\s*from\s*(['"])@koobiq\/components\/core\4\s*;?/g;

const migrate = (content: string): { content: string; changed: boolean } => {
    let changed = false;
    const migrated = content.replace(
        STATEMENT_FROM_CORE,
        (
            statement: string,
            keyword: string,
            typeKeyword: string | undefined,
            bindingsSource: string,
            quote: string
        ) => {
            const bindings = bindingsSource
                .split(',')
                .map((binding) => binding.trim())
                .filter(Boolean);
            const keycodes: string[] = [];
            const rest: string[] = [];

            for (const binding of bindings) {
                const imported = binding
                    .replace(/^type\s+/, '')
                    .split(/\s+as\s+/)
                    .at(0)
                    ?.trim();

                if (imported && KEYCODE_NAMES.has(imported)) {
                    keycodes.push(binding);
                } else {
                    rest.push(binding);
                }
            }

            if (!keycodes.length) return statement;

            changed = true;

            const typePrefix = typeKeyword ? 'type ' : '';
            const cdkStatement = `${keyword} ${typePrefix}{ ${keycodes.join(', ')} } from ${quote}${CDK_SPECIFIER}${quote};`;

            if (!rest.length) return cdkStatement;

            return `${keyword} ${typePrefix}{ ${rest.join(', ')} } from ${quote}${CORE_SPECIFIER}${quote};
${cdkStatement}`;
        }
    );

    return { content: migrated, changed };
};

/**
 * The 119 keycode constants of `@koobiq/components/core` are deprecated there (removal in 22.0.0) —
 * `@angular/cdk/keycodes` is their source from 21.2.0 on. This rewrites the import statements: the
 * keycode bindings of an `import` / `export ... from` from `core` move to a statement from the CDK,
 * the remaining bindings stay on `core`, and a statement with no bindings left is replaced outright.
 */
export default function (options: Schema): Rule {
    const label = '[keycodes-import-path]';

    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        // `ng update` invokes migrations with no options at all, and migrations.json declares no
        // schema, so the schema default never reaches us — applying the fix is intended there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        let touched = 0;

        visitProjectFiles(rootDir, (filePath: Path, entry) => {
            if (!filePath.endsWith(TS_EXT)) return;

            const originalContent = entry?.content.toString();

            if (!originalContent || !originalContent.includes(CORE_SPECIFIER)) return;

            const { content, changed } = migrate(originalContent);

            if (!changed) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [`${label} would update ${filePath} (run with --fix to apply)`]);
            }
        });

        logMessage(context.logger, [
            `${label} processed tree under "${root || '<workspace root>'}", ` +
                `${fix ? 'updated' : 'would update'} ${touched} file(s).`
        ]);
    };
}
