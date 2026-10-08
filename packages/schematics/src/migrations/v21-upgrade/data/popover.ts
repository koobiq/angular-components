import type { AreaData, Replacement } from '../data';

/** The removed unprefixed `KbqPopoverTrigger` inputs and the `kbqPopover…` inputs that replace them. */
const RENAMED_INPUTS: Record<string, string> = {
    hideIfNotInViewPort: 'kbqPopoverHideIfNotInViewPort',
    defaultPaddings: 'kbqPopoverDefaultPaddings',
    container: 'kbqPopoverContainer',
    hasBackdrop: 'kbqPopoverHasBackdrop',
    hasCloseButton: 'kbqPopoverHasCloseButton',
    closeOnScroll: 'kbqPopoverCloseOnScroll',
    backdropClass: 'kbqPopoverBackdropClass'
};

// One step inside an opening tag: a quoted value is taken whole, so neither `>` nor an attribute-like word
// inside it counts.
const TAG_BODY = `(?:[^<>"']|"[^"]*"|'[^']*')`;

/**
 * Renames `[name]=`, `name=` and a bare `name` on an element that carries `kbqPopover` or `kbqPopoverConfirm`,
 * wherever that attribute stands in the tag. Other components (sidepanel, dropdown, select, …) have inputs of
 * the same names, so an element without the trigger is left alone.
 */
function popoverInput(name: string, replacement: string): Replacement {
    return {
        from: `(<[a-zA-Z][\\w-]*(?=${TAG_BODY}*[\\s\\[]kbqPopover)${TAG_BODY}*?\\s\\[?)${name}(?=\\]?\\s*=|[\\s/>])`,
        to: `$1${replacement}`
    };
}

/** Removed in 21.0.0: the unprefixed KbqPopoverTrigger aliases and getKbqPopoverInvalidPositionError. */
export const popover: AreaData = {
    templateReplacements: Object.entries(RENAMED_INPUTS).map(([name, replacement]) => popoverInput(name, replacement)),
    warnPatterns: [
        {
            anchor: '@koobiq/components/popover',
            pattern: '\\bgetKbqPopoverInvalidPositionError\\b',
            message:
                '`getKbqPopoverInvalidPositionError` was removed: an invalid popover placement is not an error, ' +
                'it is reported with a console warning and falls back to `top`. Delete the call and its import.'
        },
        {
            anchor: '\\bKbqPopover(?:Confirm)?Trigger\\b|["\']kbqPopover(?:Confirm)?["\']',
            pattern: '\\.hideIfNotInViewPort\\b',
            message:
                '`KbqPopoverTrigger.hideIfNotInViewPort` was removed: read `popoverHideIfNotInViewPort()`, the ' +
                'signal of the `kbqPopoverHideIfNotInViewPort` input.'
        },
        {
            pattern:
                '\\bdirective:\\s*KbqPopover(?:Confirm)?Trigger\\b[^}]*\\binputs:\\s*\\[[^\\]]*["\'](?:' +
                Object.keys(RENAMED_INPUTS).join('|') +
                ')\\b',
            message:
                'A `hostDirectives` entry of `KbqPopoverTrigger` exposes an unprefixed input that was removed. ' +
                "Expose the `kbqPopover…` input instead: `'kbqPopoverHasBackdrop: hasBackdrop'` keeps the host's " +
                'binding name.'
        }
    ]
};
