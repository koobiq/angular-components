import { KoobiqTheme } from './workspace-styles';

const KNOWN_THEME_CLASSES = ['kbq-app-background', 'kbq-light', 'kbq-dark'];
const BODY_TAG = /<body\b([^>]*)>/i;
const CLASS_ATTR = /class\s*=\s*"([^"]*)"/i;

export interface HtmlEditResult {
    content: string;
    changed: boolean;
}

/**
 * Sets the Koobiq theme classes on the app's `<body>` tag.
 *
 * `'light'`/`'dark'` get the full `kbq-app-background kbq-{theme}` pair from the theming guide —
 * `kbq-app-background` paints the page's own background/text color, `kbq-{theme}` picks the theme.
 * `'auto'` only gets `kbq-app-background`: `KbqThemeService` applies `kbq-light`/`kbq-dark` to
 * `document.body` itself at runtime, so a static class here would just go stale before the app
 * bootstraps, or fight the service once it does.
 *
 * Re-running is idempotent: any class this function manages is stripped from the existing `class`
 * value first, so switching `theme` between runs doesn't leave a stale `kbq-light` sitting next to
 * a newly added `kbq-dark`. Any other existing classes, and their relative order, are preserved.
 */
export function setKoobiqThemeBodyClass(html: string, theme: KoobiqTheme): HtmlEditResult {
    const bodyMatch = BODY_TAG.exec(html);

    if (!bodyMatch) return { content: html, changed: false };

    const [fullTag, attrs] = bodyMatch;
    const classMatch = CLASS_ATTR.exec(attrs);
    const existingClasses = classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [];
    const keptClasses = existingClasses.filter((cls) => !KNOWN_THEME_CLASSES.includes(cls));
    const newClasses =
        theme === 'auto'
            ? [...keptClasses, 'kbq-app-background']
            : [...keptClasses, 'kbq-app-background', `kbq-${theme}`];
    const newClassValue = newClasses.join(' ');

    const newAttrs = classMatch
        ? attrs.replace(CLASS_ATTR, `class="${newClassValue}"`)
        : `${attrs} class="${newClassValue}"`;
    const newTag = `<body${newAttrs}>`;

    if (newTag === fullTag) return { content: html, changed: false };

    return { content: html.replace(BODY_TAG, newTag), changed: true };
}
