import { workspaces } from '@angular-devkit/core';
import { callRule, chain, Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addRootProvider, readWorkspace, writeWorkspace } from '@schematics/angular/utility';
import { findAppConfig } from '@schematics/angular/utility/standalone/app_config';
import {
    findBootstrapApplicationCall,
    findProvidersLiteral,
    getMainFilePath
} from '@schematics/angular/utility/standalone/util';
import { firstValueFrom } from 'rxjs';
// `@schematics/angular`'s own bundled copy of the TypeScript compiler, not the `typescript`
// package — `findAppConfig`/`findProvidersLiteral` return nodes created by this exact instance,
// and `ts.isCallExpression`/`ts.isIdentifier` key off `SyntaxKind` numeric values, which are not
// guaranteed to line up between two different compiler versions (they didn't: `CallExpression` is
// 213 in this repo's `typescript` and 214 in the compiler `@schematics/angular` 20.3.34 bundles).
import ts from '@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript';
import { setKoobiqThemeBodyClass } from '../utils/html-config';
import { logMessage } from '../utils/messages';
import { addPackageToPackageJson, getPackageVersionFromPackageJson } from '../utils/package-config';
import { applyKoobiqWorkspaceStyles, KoobiqTheme } from '../utils/workspace-styles';
import * as messages from './messages';
import { Schema } from './schema';

const VERSIONS = {
    ANGULAR_ANIMATIONS: '^0.0.0',
    ANGULAR_CDK: '^0.0.0',
    KOOBIQ_ANGULAR_LUXON_ADAPTER: '^0.0.0',
    KOOBIQ_LUXON_DATE_ADAPTER: '^0.0.0',
    KOOBIQ_DATE_FORMATTER: '^0.0.0',
    KOOBIQ_DATE_ADAPTER: '^0.0.0',
    KOOBIQ_ICONS: '^0.0.0',
    KOOBIQ_DESIGN_TOKENS: '^0.0.0',
    LUXON: '^0.0.0',
    OVERLAYSCROLLBARS: '^0.0.0'
};

/**
 * The `providers: [...]` array literal of a project's application config, resolved through its
 * actual `bootstrapApplication` call — the same file `addRootProvider` itself would edit. Scoping
 * every "is this already registered" check to this one array (instead of grepping every `.ts` file
 * under the project) means a provider call sitting in a comment, a spec fixture, `node_modules`, or
 * a sibling project can never be mistaken for the real thing.
 */
interface ResolvedProviders {
    filePath: string;
    sourceFile: ts.SourceFile;
    literal: ts.ArrayLiteralExpression;
}

/**
 * Resolves `ResolvedProviders` for `projectName`, or `null` when the project's bootstrap can't be
 * statically analyzed (a non-standalone/custom bootstrap, a missing `build` target, a `providers`
 * array that isn't a plain array literal, ...). `null` is also what tells the caller that
 * `addRootProvider` is expected to fail the same way, and should be run through `safeRule` instead
 * of directly.
 */
async function resolveProviders(tree: Tree, projectName: string): Promise<ResolvedProviders | null> {
    try {
        const mainFilePath = await getMainFilePath(tree, projectName);
        const bootstrapCall = findBootstrapApplicationCall(tree, mainFilePath);
        const appConfig = findAppConfig(bootstrapCall, tree, mainFilePath);

        if (!appConfig) return null;

        const literal = findProvidersLiteral(appConfig.node);

        if (!literal) return null;

        return { filePath: appConfig.filePath, sourceFile: appConfig.node.getSourceFile(), literal };
    } catch {
        return null;
    }
}

/** The callee name of a `providers` array element, e.g. `'kbqThemeProvider'` for `kbqThemeProvider({ ... })`. */
function calleeName(node: ts.Expression): string | null {
    if (ts.isIdentifier(node)) return node.text;
    if (ts.isPropertyAccessExpression(node)) return node.name.text;

    return null;
}

function findProviderCall(providers: ResolvedProviders, name: string): ts.CallExpression | undefined {
    return providers.literal.elements.find(
        (element): element is ts.CallExpression =>
            ts.isCallExpression(element) && calleeName(element.expression) === name
    );
}

/**
 * Whether `providers` already has a `provideAppInitializer(...)` call that mentions
 * `KbqThemeService` — narrowed to text inside that one call, not the whole file, so an unrelated
 * initializer elsewhere in the same providers array doesn't get mistaken for ours, and a mention of
 * `KbqThemeService` in a comment or spec elsewhere in the project never does.
 */
function hasThemeServiceInitializer(providers: ResolvedProviders): boolean {
    return providers.literal.elements.some(
        (element) =>
            ts.isCallExpression(element) &&
            calleeName(element.expression) === 'provideAppInitializer' &&
            element.getText(providers.sourceFile).includes('KbqThemeService')
    );
}

/**
 * The `kbqThemeProvider({ ... })` call this schematic generates for `theme`. `'light'`/`'dark'`
 * additionally pin `themes` to just that one entry — without it, `KBQ_THEME_CONFIG` keeps its
 * default `themes: KBQ_DEFAULT_THEMES` (both registered), so a stale `localStorage` value from a
 * previous session, or a call to `KbqThemeService.toggle()`, can switch the app to the theme whose
 * token file was never added to `angular.json`, and every `--kbq-*` colour resolves to nothing.
 */
function themeProviderCallText(theme: KoobiqTheme): string {
    if (theme === 'auto') return `kbqThemeProvider({ mode: 'auto' })`;

    return `kbqThemeProvider({ mode: '${theme}', themes: [{ name: '${theme}', className: 'kbq-${theme}', colorScheme: '${theme}' }] })`;
}

/** Replaces the exact source range of `node` in `filePath` with `text`, leaving everything else untouched. */
function replaceNode(tree: Tree, providers: ResolvedProviders, node: ts.Node, text: string): void {
    const content = tree.readText(providers.filePath);
    const start = node.getStart(providers.sourceFile);
    const end = node.getEnd();

    tree.overwrite(providers.filePath, content.slice(0, start) + text + content.slice(end));
}

/**
 * Runs `rule` against `tree` and swallows any error it throws, logging `fallbackMessage` instead.
 * Only ever used for the case `resolveProviders` has already told us to expect: a bootstrap it
 * couldn't statically analyze, where `addRootProvider` is expected to fail the same way. Any other,
 * genuinely unexpected error is left to propagate instead of being silently turned into a warning.
 */
function safeRule(rule: Rule, fallbackMessage: string[]): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        try {
            await firstValueFrom(callRule(rule, tree, context));
        } catch {
            logMessage(context.logger, fallbackMessage);
        }
    };
}

/** `addRootProvider` rule inserting the `kbqThemeProvider({ ... })` call built by `themeProviderCallText`. */
function themeProviderRule(projectName: string, theme: KoobiqTheme): Rule {
    return addRootProvider(projectName, ({ code, external }) => {
        const kbqThemeProvider = external('kbqThemeProvider', '@koobiq/components/core');

        return theme === 'auto'
            ? code`${kbqThemeProvider}({ mode: 'auto' })`
            : code`${kbqThemeProvider}({ mode: '${theme}', themes: [{ name: '${theme}', className: 'kbq-${theme}', colorScheme: '${theme}' }] })`;
    });
}

/**
 * `addRootProvider` rule forcing the first injection of `KbqThemeService` so the `'auto'` theme's
 * OS-color-scheme listener actually starts. Guarded by `isPlatformBrowser`: an SSR project runs
 * this same initializer on the server too (via `app.config.server.ts`'s `mergeApplicationConfig`),
 * and `KbqThemeService` constructs `window.matchMedia` unconditionally in a field initializer —
 * without the guard, injecting it eagerly here turns a latent, opt-in limitation into a guaranteed
 * `ng build` failure for every SSR project.
 */
function themeServiceInitializerRule(projectName: string): Rule {
    return addRootProvider(projectName, ({ code, external }) => {
        const provideAppInitializer = external('provideAppInitializer', '@angular/core');
        const inject = external('inject', '@angular/core');
        const isPlatformBrowser = external('isPlatformBrowser', '@angular/common');
        const platformId = external('PLATFORM_ID', '@angular/core');
        const kbqThemeService = external('KbqThemeService', '@koobiq/components/core');

        return code`${provideAppInitializer}(() => { if (${isPlatformBrowser}(${inject}(${platformId}))) ${inject}(${kbqThemeService}); })`;
    });
}

/** `addRootProvider` rule inserting `provideAnimations()`. */
function animationsRule(projectName: string): Rule {
    return addRootProvider(projectName, ({ code, external }) => {
        return code`${external('provideAnimations', '@angular/platform-browser/animations')}()`;
    });
}

/**
 * This is executed when `ng add @koobiq/components` is run.
 * It adds all dependencies to the 'package.json' and schedules their installation, wires the
 * library's styles and theme into `angular.json`/`index.html`, and registers the corresponding
 * root providers.
 */
export default function ngAdd(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const theme: KoobiqTheme = options.theme ?? 'auto';
        const animations = options.animations ?? true;

        // `readWorkspace` only ever looks at `/angular.json`, even though the Angular CLI itself
        // also accepts `/.angular.json` — a real, if rare, workspace shape. Reading it once, up
        // front, both avoids that second read further down doing nothing useful with its result,
        // and turns an unreadable workspace into the same clear, immediate failure as an unknown
        // `--project`, before any dependency has been written to `package.json`.
        let workspace: workspaces.WorkspaceDefinition;

        try {
            workspace = await readWorkspace(tree);
        } catch {
            throw new SchematicsException(messages.workspaceReadFailed());
        }

        if (project && !workspace.projects.get(project)) {
            throw new SchematicsException(messages.noProject(project));
        }

        // Installing dependencies
        // `@angular/animations` is a mandatory peer: the components declare `animations: [...]`
        // metadata and bind synthetic `[@state]` properties, which throw NG05105 without it.
        //
        // Its range has to come from the application, not from this repository: every
        // `@angular/animations` release pins `@angular/core` EXACTLY, so the version installed here
        // must line up with the Angular the application is already on. Writing the range this
        // monorepo happens to build with would produce `ERESOLVE` for every consumer on a different
        // patch — including ones well inside the `peerDependencies` range of `@koobiq/components`.
        const angularCoreRange = getPackageVersionFromPackageJson(tree, '@angular/core');

        addPackageToPackageJson(tree, '@angular/animations', angularCoreRange || VERSIONS.ANGULAR_ANIMATIONS);
        addPackageToPackageJson(tree, '@angular/cdk', VERSIONS.ANGULAR_CDK);
        addPackageToPackageJson(tree, '@koobiq/angular-luxon-adapter', VERSIONS.KOOBIQ_ANGULAR_LUXON_ADAPTER);
        // `@koobiq/angular-luxon-adapter` is a wrapper: it extends `LuxonDateAdapter` from the base
        // package and re-exports its formats, both as value imports. That makes the base a mandatory
        // peer of the wrapper, and installing a package without its mandatory peers only works on
        // npm — Yarn leaves them out, so the application ends up unable to resolve the adapter.
        addPackageToPackageJson(tree, '@koobiq/luxon-date-adapter', VERSIONS.KOOBIQ_LUXON_DATE_ADAPTER);
        addPackageToPackageJson(tree, '@koobiq/date-formatter', VERSIONS.KOOBIQ_DATE_FORMATTER);
        addPackageToPackageJson(tree, '@koobiq/date-adapter', VERSIONS.KOOBIQ_DATE_ADAPTER);
        addPackageToPackageJson(tree, '@koobiq/icons', VERSIONS.KOOBIQ_ICONS);
        addPackageToPackageJson(tree, '@koobiq/design-tokens', VERSIONS.KOOBIQ_DESIGN_TOKENS);
        addPackageToPackageJson(tree, 'luxon', VERSIONS.LUXON);
        // `overlayscrollbars` is a mandatory peer too: `@koobiq/components/scrollbar` imports it
        // unconditionally, and content-panel, notification-center and app-switcher all pull that in.
        addPackageToPackageJson(tree, 'overlayscrollbars', VERSIONS.OVERLAYSCROLLBARS);

        // `addPackageToPackageJson` only edits the manifest — nothing in the Angular CLI installs
        // what a schematic adds there, so without this task the application is left with
        // dependencies it has not actually got, and the instruction below cannot be followed.
        context.addTask(new NodePackageInstallTask());

        // Wiring styles: prepend the documented style entries to every application project's
        // `build` target (or just `project`, when given), then apply the theme class to each
        // project's index.html.
        const wiredProjects = applyKoobiqWorkspaceStyles(workspace, theme, project);

        await writeWorkspace(tree, workspace);

        if (wiredProjects.length === 0) {
            logMessage(context.logger, messages.noWiredProjects());

            // The unconditional warning this replaced fired for every project; now that "no
            // application project was found" is possible (e.g. `--project` names a library), the
            // animations instruction has to be repeated here too, or it never reaches the user at
            // all on that path.
            if (animations) logMessage(context.logger, messages.animationsManualSetup());
        }

        const providerRules: Rule[] = [];
        let sawSsrProject = false;

        for (const wired of wiredProjects) {
            if (tree.exists(wired.indexHtmlPath)) {
                const { content, changed } = setKoobiqThemeBodyClass(
                    tree.read(wired.indexHtmlPath)!.toString('utf-8'),
                    theme
                );

                if (changed) tree.overwrite(wired.indexHtmlPath, content);
            }

            if (!wired.stylesWired) {
                logMessage(context.logger, messages.noStylesTarget(wired.projectName));
            }

            if (wired.isSsr) sawSsrProject = true;

            const resolved = await resolveProviders(tree, wired.projectName);

            if (resolved) {
                const existingThemeCall = findProviderCall(resolved, 'kbqThemeProvider');
                const newThemeCallText = themeProviderCallText(theme);

                if (existingThemeCall) {
                    if (existingThemeCall.getText(resolved.sourceFile) !== newThemeCallText) {
                        replaceNode(tree, resolved, existingThemeCall, newThemeCallText);
                    }
                } else {
                    providerRules.push(themeProviderRule(wired.projectName, theme));
                }

                // `kbqThemeProvider({ mode: 'auto' })` only configures `KbqThemeService` — the
                // service is `providedIn: 'root'` and nothing in the library injects it eagerly, so
                // without an initializer forcing that first injection, the OS color scheme is never
                // actually applied until something else (e.g. a theme-toggle button) happens to
                // inject it.
                if (theme === 'auto' && !hasThemeServiceInitializer(resolved)) {
                    providerRules.push(themeServiceInitializerRule(wired.projectName));
                }

                if (animations && !findProviderCall(resolved, 'provideAnimations')) {
                    providerRules.push(animationsRule(wired.projectName));
                }
            } else {
                // The bootstrap couldn't be statically analyzed (a non-standalone/custom
                // bootstrap, a missing `build` target, ...) — `addRootProvider` is expected to fail
                // for the same reason, so route it through `safeRule` and tell the user to wire the
                // provider up by hand instead.
                providerRules.push(
                    safeRule(
                        themeProviderRule(wired.projectName, theme),
                        messages.themeProviderFallback(wired.projectName, theme)
                    )
                );

                if (theme === 'auto') {
                    providerRules.push(
                        safeRule(
                            themeServiceInitializerRule(wired.projectName),
                            messages.themeServiceFallback(wired.projectName)
                        )
                    );
                }

                if (animations) {
                    providerRules.push(
                        safeRule(animationsRule(wired.projectName), messages.animationsManualSetup(wired.projectName))
                    );
                }
            }
        }

        if (!animations) {
            logMessage(context.logger, messages.animationsManualSetup());
        }

        if (sawSsrProject) {
            logMessage(context.logger, messages.ssrSuggestion());
        }

        logMessage(context.logger, messages.fontsSuggestion());

        return chain(providerRules);
    };
}
