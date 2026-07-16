import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { ElementRef } from '@angular/core';

/**
 * Default minimum width of an overlay panel, in pixels.
 *
 * Kept in sync by hand with `--kbq-dropdown-size-container-width-min` in `dropdown-tokens.scss`,
 * which expresses the same default for the dropdown's CSS-driven sizing.
 */
export const KBQ_PANEL_DEFAULT_MIN_WIDTH = 200;

/**
 * Default maximum width of an overlay panel, in pixels.
 *
 * Kept in sync by hand with the `--kbq-panel-size-width-max` fallback in the panel styles, which is
 * where the cap is actually applied.
 */
export const KBQ_PANEL_DEFAULT_MAX_WIDTH = 640;

/**
 * Width of an overlay panel.
 *
 * - `'auto'` — matches the trigger width, but never narrower than `panelMinWidth`.
 * - `number` — an explicit width in pixels. `panelMinWidth` is not applied.
 * - `null`/`''` — the panel sizes to its content, but never narrower than the trigger or `panelMinWidth`.
 */
export type KbqPanelWidth = 'auto' | number | null | '';

/** Minimum width of an overlay panel, in pixels. `null` applies no additional minimum. */
export type KbqPanelMinWidth = number | null;

/**
 * Maximum width of an overlay panel, in pixels. `null` falls back to the `--kbq-panel-size-width-max`
 * design token.
 *
 * The cap is soft: it limits how far a panel grows with its content, but never makes a panel narrower
 * than its trigger, and never overrides an explicit `panelWidth`.
 */
export type KbqPanelMaxWidth = number | null;

/**
 * Anything an overlay panel can be measured against.
 * @docs-private
 */
export type KbqPanelWidthOrigin = ElementRef<HTMLElement> | CdkOverlayOrigin | HTMLElement;

/**
 * Resolved size of an overlay pane.
 *
 * Both keys are always present so that the result can be passed straight to `OverlayRef.updateSize()`,
 * which shallow-merges into the existing config — an omitted key would leave a stale value applied.
 * @docs-private
 */
export interface KbqResolvedPanelWidth {
    width: number | string;
    minWidth: number | string;
}

/**
 * Measures the rendered width of a panel's trigger.
 *
 * Uses `getBoundingClientRect()` because `getComputedStyle().width` resolves to the used
 * content-box width regardless of `box-sizing`, so subtracting borders from it double-counts them.
 * @docs-private
 */
export function kbqGetPanelWidthOrigin(origin: KbqPanelWidthOrigin): number {
    const element =
        origin instanceof CdkOverlayOrigin
            ? origin.elementRef.nativeElement
            : origin instanceof ElementRef
              ? origin.nativeElement
              : origin;

    return element.getBoundingClientRect().width;
}

/**
 * Resolves `panelWidth` and `panelMinWidth` into the `width` and `minWidth` of the overlay pane.
 *
 * `panelWidth` selects the sizing policy. The "never narrower than the trigger" rule belongs to the
 * automatic policies (`null` and `'auto'`); an explicit width is taken at face value.
 * @docs-private
 */
export function kbqResolvePanelWidth(
    panelWidth: KbqPanelWidth | string | undefined,
    panelMinWidth: KbqPanelMinWidth | undefined,
    triggerWidth: number
): KbqResolvedPanelWidth {
    // `numberAttribute` coerces `null` and other invalid bindings to `NaN`, so guard on finiteness
    // rather than on `null`, which never reaches us from a template binding.
    const min = Number.isFinite(panelMinWidth) ? Math.max(panelMinWidth as number, 0) : 0;
    const floor = Math.max(min, Number.isFinite(triggerWidth) ? triggerWidth : 0);

    // Trigger-sized. The floor is resolved here rather than emitted as `minWidth` because
    // `KbqAbstractSelect.setOverlayPosition()` clears `minWidth` on viewport overflow, after having
    // derived the panel offset from the pre-clear width.
    if (panelWidth === 'auto') {
        return { width: floor, minWidth: '' };
    }

    // Content-sized. Only `null`/`undefined`/`''` opt in — `0` is an explicit width. A non-finite
    // `panelWidth` (e.g. `NaN` from an upstream computation) is treated the same way rather than
    // reaching the DOM unguarded, mirroring how `panelMinWidth`/`triggerWidth` are handled above.
    if (panelWidth == null || panelWidth === '' || (typeof panelWidth === 'number' && !Number.isFinite(panelWidth))) {
        return { width: '', minWidth: floor };
    }

    // Explicit width. `panelMinWidth` is not applied.
    return { width: panelWidth, minWidth: '' };
}
