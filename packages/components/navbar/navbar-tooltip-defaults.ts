import type { Provider } from '@angular/core';
import type { KbqTooltipDefaultOptions } from '@koobiq/components/tooltip';
import { KBQ_TOOLTIP_DEFAULT_OPTIONS } from '@koobiq/components/tooltip';

/**
 * Tooltip defaults every tooltip inside a navbar inherits, in either orientation: no offset, and the panel
 * class the navbar's stylesheet uses to place the panel against the bar. A bound `kbqTooltipOffset` still
 * wins over the offset, and binding it back to `undefined` restores this value.
 *
 * @docs-private
 */
export const kbqNavbarTooltipOptionsProvider: Provider = {
    provide: KBQ_TOOLTIP_DEFAULT_OPTIONS,
    useValue: { offset: 0, panelClass: 'kbq-tooltip-panel_horizontal-navbar' } satisfies KbqTooltipDefaultOptions
};
