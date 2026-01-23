import { Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFilterBar } from './filter-bar';
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
    /** KbqFilterBar instance */
    private readonly filterBar = inject(KbqFilterBar);
    /** KbqFilters instance */
    protected readonly filters = inject(KbqFilters);

    constructor() {
        this.filterBar.changes.pipe(takeUntilDestroyed()).subscribe(() => {
            this.button.kbqStyle = KbqButtonStyles.Outline;
            this.button.color = KbqComponentColors.ContrastFade;

            if (this.filterBar.filter?.changed || this.filterBar.filter?.saved) {
                this.button.kbqStyle = 'changed-filter';
                this.button.color = KbqComponentColors.Empty;
            }
        });
    }

    /** @docs-private */
    saveFocusedElement() {
        this.filters.saveFocusedElement(this.button);
    }
}
