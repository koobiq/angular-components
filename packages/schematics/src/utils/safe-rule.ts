import { callRule, type Rule, type SchematicContext, type Tree } from '@angular-devkit/schematics';
import { firstValueFrom } from 'rxjs';
import { logMessage } from './messages';

/**
 * Runs `rule` against `tree` and swallows any error it throws, logging `fallbackMessage` instead. Meant for
 * `addRootProvider`, which throws on a bootstrap it cannot analyze statically, such as a custom bootstrap or a missing
 * `build` target. What the rule changed before it threw stays: `addRootProvider` adds its imports first.
 */
export function safeRule(rule: Rule, fallbackMessage: string[]): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        try {
            // eslint-disable-next-line rxjs-x/no-ignored-default-value -- `callRule` emits the tree once or fails
            await firstValueFrom(callRule(rule, tree, context));
        } catch {
            logMessage(context.logger, fallbackMessage);
        }
    };
}
