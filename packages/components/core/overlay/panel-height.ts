import { coerceCssPixelValue } from '@angular/cdk/coercion';

/**
 * Maximum height of an overlay panel's scrollable content, in pixels. `null` falls back to the
 * `--kbq-select-panel-size-max-height` design token.
 *
 * The cap covers the scrollable list only — a search field or a footer rendered beside it adds to the
 * panel's total height. With a `cdk-virtual-scroll-viewport` the value is an exact height rather than a
 * cap, because the viewport pins both its `min-height` and its `max-height` to the token.
 */
export type KbqPanelMaxHeight = number | null;

/**
 * Renders `panelMaxHeight` as a CSS length for the `--kbq-select-panel-size-max-height` token.
 *
 * A non-finite value yields `null` so that Angular removes the inline custom property and the stylesheet
 * default applies again. A negative value is clamped to `0` because `max-height` rejects negative lengths
 * at computed-value time, which would drop the declaration and leave the list unbounded rather than at
 * its default height.
 * @docs-private
 */
export function kbqResolvePanelMaxHeightToken(panelMaxHeight: KbqPanelMaxHeight | undefined): string | null {
    // `numberAttribute` coerces `null` and other invalid bindings to `NaN`, so guard on finiteness
    // rather than on `null`, which never reaches us from a template binding.
    return Number.isFinite(panelMaxHeight) ? coerceCssPixelValue(Math.max(panelMaxHeight as number, 0)) : null;
}
