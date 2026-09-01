import { DefaultTreeAdapterTypes, parse } from 'parse5';
import { KoobiqTheme } from './workspace-styles';

const KNOWN_THEME_CLASSES = ['kbq-app-background', 'kbq-light', 'kbq-dark'];

export interface HtmlEditResult {
    content: string;
    changed: boolean;
}

/**
 * Depth-first search for the `<body>` element, walking the real parsed tree instead of matching
 * text — so a `<body` mentioned inside a comment (e.g. a Google Tag Manager snippet) or an
 * unrelated attribute (`data-class`) can never be mistaken for it.
 */
function findBody(node: DefaultTreeAdapterTypes.Node): DefaultTreeAdapterTypes.Element | null {
    if ('tagName' in node && node.tagName === 'body') return node;

    if ('childNodes' in node) {
        for (const child of node.childNodes) {
            const found = findBody(child);

            if (found) return found;
        }
    }

    return null;
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
 * Parses the document with `parse5` (the same library `@angular/cdk/schematics` uses for this)
 * rather than matching `<body>`/`class` with regular expressions, so quoting style (`'`, `"`, or
 * none), attribute order, and `$`-containing attribute values already on the tag can't corrupt the
 * result the way a regex-and-`String.replace` implementation would.
 */
export function setKoobiqThemeBodyClass(html: string, theme: KoobiqTheme): HtmlEditResult {
    const document = parse(html, { sourceCodeLocationInfo: true });
    const body = findBody(document);

    if (!body || !body.sourceCodeLocation) return { content: html, changed: false };

    const classAttr = body.attrs.find((attr) => attr.name === 'class');
    const existingClasses = classAttr ? classAttr.value.split(/\s+/).filter(Boolean) : [];
    const keptClasses = existingClasses.filter((cls) => !KNOWN_THEME_CLASSES.includes(cls));
    const newClasses =
        theme === 'auto'
            ? [...keptClasses, 'kbq-app-background']
            : [...keptClasses, 'kbq-app-background', `kbq-${theme}`];
    const newClassValue = newClasses.join(' ');

    if (classAttr) {
        if (classAttr.value === newClassValue) return { content: html, changed: false };

        const location = body.sourceCodeLocation.attrs?.['class'];

        if (!location) return { content: html, changed: false };

        const updated =
            html.slice(0, location.startOffset) + `class="${newClassValue}"` + html.slice(location.endOffset);

        return { content: updated, changed: true };
    }

    const insertOffset = body.sourceCodeLocation.startTag?.endOffset ?? body.sourceCodeLocation.endOffset;
    const updated = html.slice(0, insertOffset - 1) + ` class="${newClassValue}"` + html.slice(insertOffset - 1);

    return { content: updated, changed: true };
}
