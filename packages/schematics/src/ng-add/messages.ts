import { KoobiqTheme } from '../utils/workspace-styles';

export function noProject(project: string) {
    return `Unable to find project '${project}' in the workspace`;
}

export function noModuleFile(moduleFilePath: string) {
    return `File '${moduleFilePath}' does not exist.`;
}

export function workspaceReadFailed(): string {
    return "Could not read the workspace configuration ('angular.json').";
}

export function noWiredProjects(): string[] {
    return [
        'No application project was found — styles, the theme class and the root providers were',
        'not configured automatically. Follow the installation guide to add them by hand:',
        'https://koobiq.io/en/main/installation'
    ];
}

export function noStylesTarget(projectName: string): string[] {
    return [
        `Project '${projectName}' has no 'build' target — its styles and index.html theme class`,
        'were not configured automatically. Follow the installation guide to add them by hand:',
        'https://koobiq.io/en/main/installation'
    ];
}

export function themeProviderFallback(projectName: string, theme: KoobiqTheme): string[] {
    return [
        `Could not automatically register 'kbqThemeProvider({ mode: '${theme}' })' for project '${projectName}'.`,
        "Add it to that project's providers yourself — see the theming guide:",
        'https://koobiq.io/en/main/theming'
    ];
}

export function themeServiceFallback(projectName: string): string[] {
    return [
        `Could not automatically start 'KbqThemeService' for project '${projectName}'.`,
        'Inject it once yourself (e.g. `inject(KbqThemeService)` in a root provider or component) —',
        "otherwise the 'auto' theme is configured but never applied. See the theming guide:",
        'https://koobiq.io/en/main/theming'
    ];
}

export function animationsManualSetup(projectName?: string): string[] {
    return [
        projectName
            ? `Could not automatically register 'provideAnimations()' for project '${projectName}'.`
            : 'Angular animations have to be provided by the application.',
        "Add `provideAnimations()` from '@angular/platform-browser/animations' to the providers",
        'of `bootstrapApplication`, otherwise every component that animates (dropdown, select,',
        'tooltip, toast, datepicker) fails with NG05105 as soon as it opens.'
    ];
}

export function ssrSuggestion(): string[] {
    return [
        'This project renders on the server — the default `KbqThemeLocalStorageStore` only',
        "persists in the browser, so the server's first render can briefly use the wrong",
        'theme. Consider providing `KbqThemeCookieStore` through `KBQ_THEME_STORE` instead.',
        'See the theming guide: https://koobiq.io/en/main/theming'
    ];
}

export function fontsSuggestion(): string[] {
    return [
        'Koobiq recommends the Inter and JetBrains Mono fonts.',
        'See https://koobiq.io/en/main/typography for installation options (Fontsource or Google Fonts CDN).'
    ];
}
