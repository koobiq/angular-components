import { Directive, effect, inject } from '@angular/core';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KBQ_FILTER_BAR_HOST } from './filter-bar.types';
import { KbqFilters } from './filters';

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
    /** KbqFilters instance */
    protected readonly filters = inject(KbqFilters);

    constructor() {
        // Reflect the current filter's saved/changed state in the button style. Reading `filterBar.filter`
        // (a signal-backed accessor) subscribes this effect, replacing the retired `changes` bus.
        effect(() => {
            const filter = this.filterBar.filter();

            this.button.kbqStyle = KbqButtonStyles.Outline;
            this.button.color = KbqComponentColors.ContrastFade;

            if (filter?.changed || filter?.saved) {
                // `changed-filter` is a style of this package, not of the button, so it is not
                // covered by `kbq-button-theme()` and paints its own colors regardless of which
                // color class the button carries — the color set above is simply left in place.
                this.button.kbqStyle = 'changed-filter';
            }
        });
    }

    /** @docs-private */
    saveFocusedElement() {
        this.filters.saveFocusedElement(this.button);
    }
}
