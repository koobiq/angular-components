import { Directive, effect, inject } from '@angular/core';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KBQ_FILTER_BAR_HOST, KBQ_FILTERS } from './filter-bar.types';

@Directive({
    selector: '[kbqFilterBarButton]',
    host: {
        '(click)': 'saveFocusedElement()',
        '(keydown)': 'saveFocusedElement()'
    }
})
export class KbqFilterBarButton {
    private readonly button = inject(KbqButton);
    /** KbqFilterBar host seam */
    private readonly filterBar = inject(KBQ_FILTER_BAR_HOST);
    /** KbqFilters host seam */
    private readonly filters = inject(KBQ_FILTERS);

    constructor() {
        // Reflect the current filter's saved/changed state in the button style. Reading `filterBar.filter`
        // (a signal-backed accessor) subscribes this effect, replacing the retired `changes` bus.
        effect(() => {
            const filter = this.filterBar.filter();

            this.button.kbqStyle = KbqButtonStyles.Outline;

            if (filter?.changed || filter?.saved) {
                // `changed-filter` is a style of this package, not of the button, so it is not
                // covered by `kbq-button-theme()` and paints its own colors regardless of which
                // color class the button carries — the color set below is simply left in place.
                this.button.kbqStyle = 'changed-filter';
            }

            // Set after the style: a style change resets the color of the button to the style's default.
            this.button.color.set(KbqComponentColors.ContrastFade);
        });
    }

    /** @docs-private */
    saveFocusedElement() {
        this.filters.saveFocusedElement(this.button);
    }
}
