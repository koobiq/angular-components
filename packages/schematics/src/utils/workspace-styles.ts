import { JsonValue, workspaces } from '@angular-devkit/core';

export type KoobiqTheme = 'light' | 'dark' | 'auto';

/**
 * Whether `project` is an application (as opposed to a library) — the same check
 * `@schematics/angular` itself uses (see `utility/workspace.js`'s `createDefaultPath`), rather than
 * an allowlist of builder names. A project can sit on any builder — a custom webpack wrapper, an Nx
 * executor, one this schematic has never heard of — and still be a perfectly good application; only
 * `projectType` reliably says so.
 */
function isApplicationProject(project: workspaces.ProjectDefinition): boolean {
    return project.extensions['projectType'] === 'application';
}

const KOOBIQ_STATIC_STYLE_ENTRIES = [
    'node_modules/@koobiq/icons/fonts/kbq-icons.css',
    'node_modules/@koobiq/design-tokens/web/css-tokens.css',
    'node_modules/@koobiq/components/prebuilt-themes/theme.css'
];

const THEME_TOKENS_PATTERN = /^node_modules\/@koobiq\/design-tokens\/web\/css-tokens-(light|dark)\.css$/;

/**
 * The style entries documented in the installation guide, in the order they must be loaded.
 * `'auto'` includes both token files, since `KbqThemeService` switches between them at runtime —
 * a static `'light'`/`'dark'` choice only needs its own.
 */
export function getKoobiqStyleEntries(theme: KoobiqTheme): string[] {
    const [icons, tokens, prebuiltTheme] = KOOBIQ_STATIC_STYLE_ENTRIES;
    const themeTokens = theme === 'auto' ? [
                  'node_modules/@koobiq/design-tokens/web/css-tokens-light.css',
                  'node_modules/@koobiq/design-tokens/web/css-tokens-dark.css'
              ] : [`node_modules/@koobiq/design-tokens/web/css-tokens-${theme}.css`];

    return [icons, tokens, ...themeTokens, prebuiltTheme];
}

/**
 * Prepends the Koobiq style entries ahead of whatever is already in `existingStyles`, matching the
 * order documented in installation.md, where the app's own stylesheet comes last. Re-running with
 * the same theme is a no-op; re-running with a different theme swaps the `css-tokens-*.css`
 * entries instead of accumulating duplicates. Non-string entries (style-budget objects) and any
 * unrelated entries are preserved, untouched, in their original order.
 */
export function mergeKoobiqStyles(existingStyles: JsonValue[], theme: KoobiqTheme): JsonValue[] {
    const desired = getKoobiqStyleEntries(theme);
    const rest = existingStyles.filter((entry) => {
        if (typeof entry !== 'string') return true;

        return (
            !desired.includes(entry) &&
            !KOOBIQ_STATIC_STYLE_ENTRIES.includes(entry) &&
            !THEME_TOKENS_PATTERN.test(entry)
        );
    });

    return [...desired, ...rest];
}

/**
 * Resolves the workspace-root-relative path of a project's index.html, mirroring the
 * `@angular/build:application` builder's own default (`<sourceRoot>/index.html`) when the
 * `index` option isn't set explicitly. `buildTarget` is `undefined` for a project with no `build`
 * target at all, in which case the default is the only option available.
 */
export function getIndexHtmlPath(
    project: workspaces.ProjectDefinition,
    buildTarget: workspaces.TargetDefinition | undefined
): string {
    const indexOption = buildTarget?.options?.index;

    if (typeof indexOption === 'string') {
        return indexOption;
    }

    if (indexOption && typeof indexOption === 'object' && !Array.isArray(indexOption)) {
        const input = (indexOption as Record<string, JsonValue>).input;

        if (typeof input === 'string') {
            return input;
        }
    }

    const sourceRoot = project.sourceRoot ?? `${project.root}/src`;

    return `${sourceRoot}/index.html`;
}

export interface WiredProject {
    projectName: string;
    projectRoot: string;
    indexHtmlPath: string;
    /** Whether the project's `build` target is configured for SSR (a `server` entry point or `ssr` option). */
    isSsr: boolean;
    /** Whether a `build` target was found and had the Koobiq style entries merged into it. */
    stylesWired: boolean;
}

/**
 * Whether a `build` target's `server`/`ssr` options indicate the project renders on the server —
 * `KbqThemeCookieStore` matters there, where `KbqThemeLocalStorageStore`'s default doesn't reach
 * the server render.
 */
function isSsrBuildTarget(buildTarget: workspaces.TargetDefinition): boolean {
    const { server, ssr } = buildTarget.options ?? {};

    return Boolean((typeof server === 'string' && server) || ssr === true || (ssr && typeof ssr === 'object'));
}

/**
 * Mutates `workspace` in place: for every application project (optionally scoped to
 * `projectName`), merges the Koobiq style entries for `theme` into its `build` target's `styles`
 * array, when it has one. Returns per-project wiring info the caller uses to edit index.html and
 * the project's bootstrap file afterward — for every application project, regardless of whether it
 * had a `build` target to wire styles into, since the bootstrap file (and thus the theme/animations
 * providers) is resolved independently of it.
 *
 * Only the target literally named `build` is touched — not `test` (Karma) or `serve` — keeping the
 * change's blast radius minimal.
 */
export function applyKoobiqWorkspaceStyles(
    workspace: workspaces.WorkspaceDefinition,
    theme: KoobiqTheme,
    projectName?: string
): WiredProject[] {
    const wired: WiredProject[] = [];

    for (const [name, project] of workspace.projects) {
        if (projectName && name !== projectName) continue;
        if (!isApplicationProject(project)) continue;

        const buildTarget = project.targets.get('build');
        let stylesWired = false;

        if (buildTarget) {
            const options = buildTarget.options ?? (buildTarget.options = {});
            const existingStyles = Array.isArray(options.styles) ? (options.styles as JsonValue[]) : [];

            options.styles = mergeKoobiqStyles(existingStyles, theme);
            stylesWired = true;
        }

        wired.push({
            projectName: name,
            projectRoot: project.root,
            indexHtmlPath: getIndexHtmlPath(project, buildTarget),
            isSsr: buildTarget ? isSsrBuildTarget(buildTarget) : false,
            stylesWired
        });
    }

    return wired;
}
