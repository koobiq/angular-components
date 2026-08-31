import { callRule, chain, Rule, SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { addRootProvider, readWorkspace, writeWorkspace } from '@schematics/angular/utility';
import { firstValueFrom } from 'rxjs';
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
 * Whether any `.ts` file under `projectRoot` already contains `needle`. `addRootProvider` has no
 * built-in guard against inserting the same expression twice, so callers use this to skip
 * insertion on re-run instead of accumulating duplicate provider calls.
 */
function projectSourceContains(tree: Tree, projectRoot: string, needle: string): boolean {
    let found = false;

    tree.getDir(projectRoot).visit((filePath) => {
        if (found || !filePath.endsWith('.ts')) return;
        if (tree.read(filePath)!.toString('utf-8').includes(needle)) found = true;
    });

    return found;
}

const THEME_PROVIDER_CALL = /kbqThemeProvider\(\{\s*mode:\s*'(?:light|dark|auto)'\s*\}\)/;

/**
 * If a previous `ng-add` run already inserted the exact `kbqThemeProvider({ mode: '...' })` call
 * this schematic generates, rewrites its `mode` in place to match the current `theme` — instead of
 * leaving a stale mode behind when re-running with a different choice. Returns `true` when such a
 * call was found (and updated, or already correct), so the caller knows not to insert a new one.
 * A hand-written call with extra options (`themes`, `storageKey`, ...) won't match this narrow
 * pattern and is left untouched, same as any other manual setup `addRootProvider` can't see.
 */
function updateThemeProviderMode(tree: Tree, projectRoot: string, theme: KoobiqTheme): boolean {
    let found = false;

    tree.getDir(projectRoot).visit((filePath) => {
        if (found || !filePath.endsWith('.ts')) return;

        const content = tree.read(filePath)!.toString('utf-8');

        if (!THEME_PROVIDER_CALL.test(content)) return;

        found = true;
        const updated = content.replace(THEME_PROVIDER_CALL, `kbqThemeProvider({ mode: '${theme}' })`);

        if (updated !== content) tree.overwrite(filePath, updated);
    });

    return found;
}

/**
 * Runs `rule` against `tree` and swallows any error it throws (e.g. `addRootProvider` failing to
 * statically analyze a non-standard bootstrap), logging `fallbackMessage` instead — one project's
 * unusual setup shouldn't abort the rest of `ng add`.
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

        if (project) {
            const workspace = await readWorkspace(tree);
            const projectWorkspace = workspace.projects.get(project);

            if (!projectWorkspace) {
                throw new SchematicsException(messages.noProject(project));
            }
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
        const workspace = await readWorkspace(tree);
        const wiredProjects = applyKoobiqWorkspaceStyles(workspace, theme, project);

        await writeWorkspace(tree, workspace);

        if (wiredProjects.length === 0) {
            logMessage(context.logger, messages.noWiredProjects());
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

            if (wired.isSsr) sawSsrProject = true;

            if (
                !updateThemeProviderMode(tree, wired.projectRoot, theme) &&
                !projectSourceContains(tree, wired.projectRoot, 'kbqThemeProvider(')
            ) {
                providerRules.push(
                    safeRule(
                        addRootProvider(wired.projectName, ({ code, external }) => {
                            return code`${external('kbqThemeProvider', '@koobiq/components/core')}({ mode: '${theme}' })`;
                        }),
                        messages.themeProviderFallback(wired.projectName, theme)
                    )
                );
            }

            // `kbqThemeProvider({ mode: 'auto' })` only configures `KbqThemeService` — the service
            // is `providedIn: 'root'` and nothing in the library injects it eagerly, so without an
            // initializer forcing that first injection, the OS color scheme is never actually
            // applied until something else (e.g. a theme-toggle button) happens to inject it.
            if (theme === 'auto' && !projectSourceContains(tree, wired.projectRoot, 'inject(KbqThemeService)')) {
                providerRules.push(
                    safeRule(
                        addRootProvider(wired.projectName, ({ code, external }) => {
                            const provideAppInitializer = external('provideAppInitializer', '@angular/core');
                            const inject = external('inject', '@angular/core');
                            const kbqThemeService = external('KbqThemeService', '@koobiq/components/core');

                            return code`${provideAppInitializer}(() => { ${inject}(${kbqThemeService}); })`;
                        }),
                        messages.themeServiceFallback(wired.projectName)
                    )
                );
            }

            if (animations && !projectSourceContains(tree, wired.projectRoot, 'provideAnimations(')) {
                providerRules.push(
                    safeRule(
                        addRootProvider(wired.projectName, ({ code, external }) => {
                            return code`${external('provideAnimations', '@angular/platform-browser/animations')}()`;
                        }),
                        messages.animationsManualSetup(wired.projectName)
                    )
                );
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
