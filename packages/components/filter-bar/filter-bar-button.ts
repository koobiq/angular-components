import { Directive, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFilterBar } from './filter-bar';

@Directive({
    standalone: true,
    selector: '[kbqFilterBarButton]'
})
export class KbqFilterBarButton {
    private readonly button = inject(KbqButton);
    /** KbqFilterBar instance */
    private readonly filterBar = inject(KbqFilterBar);

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
}
