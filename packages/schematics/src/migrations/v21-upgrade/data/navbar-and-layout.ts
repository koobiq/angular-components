import type { AreaData } from '../data';

// An opening tag that carries the brand directive, as an element or an attribute, wherever it sits in the tag.
const BRAND_TAG = '<(?=[^>]*?\\bkbq-navbar-brand(?![\\w-]))[^>]*?';
// An opening `<kbq-dl>` tag that does not set `verticalBreakpoint` as well, which would end up bound twice.
const DL_TAG_WITHOUT_BREAKPOINT = '<kbq-dl(?![\\w-])(?![^>]*\\bverticalBreakpoint\\b)[^>]*?\\s';
const QUOTED_VALUE = '(?:"[^"]*"|\'[^\']*\')';

/**
 * Removed in 21.0.0: KbqNavbarBrand.longTitle, KbqNavbarItem.getTitleWidth (with KbqNavbarTitle.outerElementWidth,
 * which only fed it), the ellipsis center resizeStream and KbqDlComponent.minWidth.
 */
export const navbarAndLayout: AreaData = {
    templateReplacements: [
        // `longTitle` on the brand: the two-line title is detected automatically, so the binding is dropped.
        { from: `(${BRAND_TAG})\\s+\\[longTitle\\]\\s*=\\s*${QUOTED_VALUE}`, to: '$1' },
        { from: `(${BRAND_TAG})\\s+longTitle\\s*=\\s*${QUOTED_VALUE}`, to: '$1' },
        { from: `(${BRAND_TAG})\\s+longTitle(?=[\\s/>])(?!\\s*=)`, to: '$1' },

        // `minWidth` on `kbq-dl` was an alias of `verticalBreakpoint`.
        { from: `(${DL_TAG_WITHOUT_BREAKPOINT})\\[minWidth\\](?=\\s*=)`, to: '$1[verticalBreakpoint]' },
        { from: `(${DL_TAG_WITHOUT_BREAKPOINT})minWidth(?=\\s*=\\s*["'])`, to: '$1verticalBreakpoint' }
    ],
    warnPatterns: [
        {
            anchor: '\\bkbq-navbar-brand\\b',
            pattern: `${BRAND_TAG}\\s(?:\\[longTitle\\]|longTitle)(?![\\w-])`,
            message:
                '`KbqNavbarBrand.longTitle` was removed and its binding dropped: the brand switches to the ' +
                'two-line title by itself when the title does not fit on one line. A forced `true` or `false` ' +
                'has no replacement.'
        },
        {
            anchor: '\\bKbqNavbarBrand\\b|["\']kbqNavbarBrand["\']',
            pattern: '\\.longTitle\\s*\\(|setInput\\(\\s*["\']longTitle["\']',
            message:
                '`KbqNavbarBrand.longTitle` was removed: the two-line title is detected automatically. Drop the ' +
                'read or write; nothing replaces it.'
        },
        {
            anchor: '\\bKbqNavbarItem\\b|["\']kbqNavbarItem["\']',
            pattern: '\\.getTitleWidth\\s*\\(',
            message:
                '`KbqNavbarItem.getTitleWidth()` was removed: the navbar collapses items by ' +
                '`getCollapsibleWidth()`. To measure the title, call `getOuterElementWidth()` on its `KbqNavbarTitle`.'
        },
        {
            anchor: '\\bKbqNavbarTitle\\b',
            pattern: '\\.outerElementWidth\\b',
            message:
                '`KbqNavbarTitle.outerElementWidth` was removed: call `getOuterElementWidth()`, which measures ' +
                'the title when called instead of once on init.'
        },
        {
            anchor: '\\bKbqEllipsisCenterDirective\\b',
            pattern: '\\.resizeStream\\b',
            message:
                '`KbqEllipsisCenterDirective.resizeStream` was removed: nothing read it. Drop the call; the ' +
                'shared `ResizeObserver` re-measures the host, container-only resizes included.'
        },
        {
            anchor: '<kbq-dl(?![\\w-])',
            pattern: '<kbq-dl(?![\\w-])(?=[^>]*\\bverticalBreakpoint\\b)[^>]*\\s\\[?minWidth\\b',
            message:
                '`minWidth` was removed from `<kbq-dl>` and is left as is where `verticalBreakpoint` is set too. ' +
                'It took precedence, so move its value into `verticalBreakpoint` and delete it.'
        },
        {
            anchor: '\\bKbqDlComponent\\b',
            pattern: '\\.minWidth\\s*\\(|setInput\\(\\s*["\']minWidth["\']',
            message:
                '`KbqDlComponent.minWidth` was removed: read and set `verticalBreakpoint` instead. It defaults ' +
                'to 400, where an unset `minWidth` read `undefined`.'
        }
    ]
};
