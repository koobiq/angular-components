import type { AreaData } from '../data';

// The start of an attribute on an opening `<kbq-code-block>` tag that does not bind `name` itself.
const codeBlockTagWithout = (name: string): string =>
    String.raw`(<kbq-code-block(?![\w-])(?![^>]*[\s\[]${name}[\]\s=/>])[^>]*?\s\[?)`;

// Either attribute of a pair on one `<kbq-code-block>` tag.
const codeBlockTagWith = (first: string, second: string): string =>
    String.raw`<kbq-code-block(?![\w-])(?=[^>]*[\s\[]${first}[\]\s=/>])(?=[^>]*[\s\[]${second}[\]\s=/>])`;

// A file that names the component or reaches it through its `exportAs`.
const CODE_BLOCK_ANCHOR = String.raw`\bKbqCodeBlock\b|["']kbqCodeBlock["']`;

const ICON_BUTTON_ATTRIBUTE = String.raw`[\s\[]kbq-icon-button(?![\w-])`;

// The start of an attribute on an opening icon button tag that does not set `size` itself.
const ICON_BUTTON_TAG = String.raw`(<[a-zA-Z][\w-]*(?=[^>]*${ICON_BUTTON_ATTRIBUTE})(?![^>]*[\s\[]size[\]\s=/>])[^>]*?\s)`;

// A property path such as `isSmall`, `options.small` or `small()`, which needs no parentheses in a ternary.
const PATH = String.raw`[A-Za-z_$][\w$]*(?:\(\))?(?:\??\.[A-Za-z_$][\w$]*(?:\(\))?)*`;

/** Removed in 21.0.0: KbqCodeBlock (canLoad, codeFiles, scrollableCodeContent) and KbqIconButton (small). */
export const codeBlockAndIcon: AreaData = {
    templateReplacements: [
        // `[canLoad]="…"`, `canLoad="…"` and a valueless `canLoad`.
        { from: String.raw`${codeBlockTagWithout('canDownload')}canLoad(?=\]?[\s=/>])`, to: '$1canDownload' },
        { from: String.raw`${codeBlockTagWithout('files')}codeFiles(?=\]?[\s=/>])`, to: '$1files' },
        { from: String.raw`${ICON_BUTTON_TAG}\[small\]\s*=\s*"true"`, to: '$1size="compact"' },
        { from: String.raw`${ICON_BUTTON_TAG}\[small\]\s*=\s*"false"`, to: '$1size="normal"' },
        { from: String.raw`${ICON_BUTTON_TAG}\[small\]\s*=\s*"(${PATH})"`, to: `$1[size]="$2 ? 'compact' : 'normal'"` },
        { from: String.raw`${ICON_BUTTON_TAG}\[small\]\s*=\s*"([^"]*)"`, to: `$1[size]="($2) ? 'compact' : 'normal'"` },
        { from: String.raw`${ICON_BUTTON_TAG}small\s*=\s*"true"`, to: '$1size="compact"' },
        // The class also appears in queries and inline styles.
        { from: String.raw`\bkbq-icon-button_small\b`, to: 'kbq-icon-button_compact' }
    ],
    scssReplacements: [{ from: String.raw`\bkbq-icon-button_small\b`, to: 'kbq-icon-button_compact' }],
    warnPatterns: [
        {
            anchor: String.raw`<kbq-code-block(?![\w-])`,
            pattern: `${codeBlockTagWith('canLoad', 'canDownload')}|${codeBlockTagWith('codeFiles', 'files')}`,
            message:
                'KbqCodeBlock `canLoad` and `codeFiles` were removed: use `canDownload` and `files`. A ' +
                '<kbq-code-block> that binds `canLoad` next to `canDownload`, or `codeFiles` next to `files`, was ' +
                'left untouched: merge each pair into one binding. The download button showed when either was ' +
                'true, and `codeFiles` applied while `files` was empty.'
        },
        {
            anchor: CODE_BLOCK_ANCHOR,
            pattern: String.raw`\.(?:canLoad|codeFiles)(?:Input)?\b`,
            message:
                'KbqCodeBlock `canLoad`, `codeFiles` and their backing inputs `canLoadInput` and `codeFilesInput` ' +
                'were removed: read `canDownload()` and `files()`, write `canDownload.set(…)` and `files.set(…)`. ' +
                'Manual migration required.'
        },
        {
            anchor: CODE_BLOCK_ANCHOR,
            pattern: String.raw`\.scrollableCodeContent\b`,
            message:
                'KbqCodeBlock.scrollableCodeContent was removed: scroll the code with ' +
                '`scrollTo(options)` on the code block. Manual migration required.'
        },
        {
            anchor: ICON_BUTTON_ATTRIBUTE,
            pattern:
                String.raw`<[a-zA-Z][\w-]*(?=[^>]*${ICON_BUTTON_ATTRIBUTE})(?:` +
                String.raw`(?=[^>]*[\s\[]size[\]\s=/>])[^>]*[\s\[]small[\]\s=/>]|` +
                String.raw`[^>]*\s(?:small(?!\s*=\s*"true")(?=[\s=/>])|\[small\]\s*=\s*'))`,
            message:
                'KbqIconButton `small` was removed: set `size="compact"`. Left untouched: an icon button that ' +
                'sets both `small` and `size`, a single-quoted `[small]` binding, and a static `small` other ' +
                'than `small="true"`. A valueless `small` never took effect, so drop it; any other static ' +
                'value made the button compact.'
        },
        {
            anchor: String.raw`\bKbqIconButton\b`,
            pattern: String.raw`\.small\b`,
            message:
                "KbqIconButton.small was removed: read or set `size` ('compact' | 'normal') instead. " +
                'Manual migration required.'
        }
    ]
};
