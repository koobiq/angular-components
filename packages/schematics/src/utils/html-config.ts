import { KoobiqTheme } from './workspace-styles';

const KNOWN_THEME_CLASSES = ['kbq-app-background', 'kbq-light', 'kbq-dark'];
const COMMENT_START = '<!--';
const COMMENT_END = '-->';

export interface HtmlEditResult {
    content: string;
    changed: boolean;
}

interface Attr {
    name: string;
    /** `[start, end)` of the whole attribute — `name="value"`, not just the value — for in-place replacement. */
    start: number;
    end: number;
    value: string;
}

/**
 * Index of the `<` starting a real `<body` tag — one that isn't inside an HTML comment (e.g. a
 * pasted Google Tag Manager snippet mentioning `<body>` in its install instructions) — or `-1`.
 * Walks the string once rather than matching `<body` with a regex, so a comment can't be mistaken
 * for the element.
 */
function findBodyTagStart(html: string): number {
    const lower = html.toLowerCase();
    let i = 0;

    while (i < html.length) {
        if (lower.startsWith(COMMENT_START, i)) {
            const end = lower.indexOf(COMMENT_END, i + COMMENT_START.length);

            i = end === -1 ? html.length : end + COMMENT_END.length;
            continue;
        }

        if (lower.startsWith('<body', i) && (html[i + 5] === undefined || /[\s/>]/.test(html[i + 5]))) {
            return i;
        }

        i++;
    }

    return -1;
}

/**
 * Index of the `>` that closes the tag starting at `tagStart`, tracking open quotes so a `>`
 * inside a quoted attribute value (`<body data-x="a>b">`) doesn't end the tag early. `-1` if the
 * tag is never closed.
 */
function findTagEnd(html: string, tagStart: number): number {
    let quote: string | null = null;

    for (let i = tagStart + 1; i < html.length; i++) {
        const char = html[i];

        if (quote) {
            if (char === quote) quote = null;
        } else if (char === '"' || char === "'") {
            quote = char;
        } else if (char === '>') {
            return i;
        }
    }

    return -1;
}

/**
 * Parses the attributes of the tag whose content spans `[start, end)` (between `<body` and the
 * closing `>`), handling double-quoted, single-quoted and unquoted values — so a single-quoted
 * `class` attribute is found exactly like a double-quoted one, instead of only the latter matching.
 */
function parseAttrs(html: string, start: number, end: number): Attr[] {
    const attrs: Attr[] = [];
    const isSpace = (char: string) => /\s/.test(char);
    let i = start;

    while (i < end) {
        while (i < end && (isSpace(html[i]) || html[i] === '/')) i++;
        if (i >= end) break;

        const nameStart = i;

        while (i < end && !isSpace(html[i]) && html[i] !== '=' && html[i] !== '/' && html[i] !== '>') i++;

        if (i === nameStart) {
            i++;
            continue;
        }

        const name = html.slice(nameStart, i);

        while (i < end && isSpace(html[i])) i++;

        let value = '';
        let attrEnd = i;

        if (html[i] === '=') {
            i++;
            while (i < end && isSpace(html[i])) i++;

            const quote = html[i] === '"' || html[i] === "'" ? html[i] : null;

            if (quote) {
                i++;
                const valueStart = i;

                while (i < end && html[i] !== quote) i++;

                value = html.slice(valueStart, i);
                if (i < end) i++;
            } else {
                const valueStart = i;

                while (i < end && !isSpace(html[i]) && html[i] !== '>') i++;

                value = html.slice(valueStart, i);
            }

            attrEnd = i;
        }

        attrs.push({ name, start: nameStart, end: attrEnd, value });
    }

    return attrs;
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
 *
 * Locates the `<body>` tag and its `class` attribute with a small hand-written scanner rather than
 * a `<body>`/`class` regex-and-`String.replace`, so quoting style (`'`, `"`, or none), a `>` inside
 * an unrelated attribute's value, an attribute merely named `data-class`, a `<body` mentioned inside
 * a comment, and `$`-containing values already on the tag can't corrupt the result. Deliberately
 * doesn't pull in a full HTML parser (e.g. `parse5`) for this: it's the only thing in this package
 * that would need one, and this package is distributed as a dependency of `@koobiq/components`,
 * where an extra runtime `dependencies` entry isn't worth it for one small, well-tested edit.
 */
export function setKoobiqThemeBodyClass(html: string, theme: KoobiqTheme): HtmlEditResult {
    const tagStart = findBodyTagStart(html);

    if (tagStart === -1) return { content: html, changed: false };

    const tagEnd = findTagEnd(html, tagStart);

    if (tagEnd === -1) return { content: html, changed: false };

    const attrs = parseAttrs(html, tagStart + '<body'.length, tagEnd);
    const classAttr = attrs.find((attr) => attr.name.toLowerCase() === 'class');
    const existingClasses = classAttr ? classAttr.value.split(/\s+/).filter(Boolean) : [];
    const keptClasses = existingClasses.filter((cls) => !KNOWN_THEME_CLASSES.includes(cls));
    const newClasses =
        theme === 'auto'
            ? [...keptClasses, 'kbq-app-background']
            : [...keptClasses, 'kbq-app-background', `kbq-${theme}`];
    const newClassValue = newClasses.join(' ');

    if (classAttr) {
        if (classAttr.value === newClassValue) return { content: html, changed: false };

        const updated = html.slice(0, classAttr.start) + `class="${newClassValue}"` + html.slice(classAttr.end);

        return { content: updated, changed: true };
    }

    const updated = html.slice(0, tagEnd) + ` class="${newClassValue}"` + html.slice(tagEnd);

    return { content: updated, changed: true };
}
