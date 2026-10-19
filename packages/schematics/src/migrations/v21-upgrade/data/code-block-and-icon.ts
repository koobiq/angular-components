import { TAG_BODY, codeBlockTagWith, codeBlockTagWithout } from '../../../utils/tag-patterns';
import type { AreaData } from '../data';

// An opening `<kbq-code-block>` tag that binds `name` twice.
const codeBlockTagTwice = (name: string): string =>
    String.raw`<kbq-code-block(?![\w-])(?=${TAG_BODY}*[\s\[]${name}(?=[\]\s=/>])${TAG_BODY}*[\s\[]${name}[\]\s=/>])`;

// A file that names the component or reaches it through its `exportAs`.
const CODE_BLOCK_ANCHOR = String.raw`\bKbqCodeBlock\b|["']kbqCodeBlock["']`;

const ICON_BUTTON_ATTRIBUTE = String.raw`[\s\[]kbq-icon-button(?![\w-])`;

// The start of an attribute on an opening icon button tag that does not set `size` itself.
const ICON_BUTTON_TAG = String.raw`(<[a-zA-Z][\w-]*(?=${TAG_BODY}*${ICON_BUTTON_ATTRIBUTE})(?!${TAG_BODY}*[\s\[]size[\]\s=/>])${TAG_BODY}*?\s)`;

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
            anchor: String.raw`<kbq-code-block(?![\w-])`,
            pattern: `${codeBlockTagTwice('canDownload')}|${codeBlockTagTwice('files')}`,
            message:
                'A <kbq-code-block> that binds `canDownload` or `files` twice is what the 20.0.0 migration left of ' +
                '`canLoad` or `codeFiles` bound next to its replacement. Only the last binding takes effect: merge ' +
                'the two into one.'
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
                String.raw`<[a-zA-Z][\w-]*(?=${TAG_BODY}*${ICON_BUTTON_ATTRIBUTE})(?:` +
                String.raw`(?=${TAG_BODY}*[\s\[]size[\]\s=/>])${TAG_BODY}*[\s\[]small[\]\s=/>]|` +
                String.raw`${TAG_BODY}*\s(?:small(?!\s*=\s*"true")(?=[\s=/>])|\[small\]\s*=\s*'))`,
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
