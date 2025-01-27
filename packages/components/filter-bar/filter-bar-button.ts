import { Directive, ElementRef, inject, ViewChild } from '@angular/core';
import { KbqButton, KbqButtonStyles } from '../button';
import { KbqComponentColors } from '../core';
import { KbqFilterBar } from './filter-bar';

@Directive({
    standalone: true,
    selector: '[kbq-filter-bar-button]'
})
export class KbqFilterBarButton {
    private readonly button = inject(KbqButton);
    private readonly filterBar = inject(KbqFilterBar);

    @ViewChild('kbqTitleText', { static: false }) textElement: ElementRef;

    constructor() {
        this.filterBar.changes.subscribe(() => {
            this.button.kbqStyle = KbqButtonStyles.Outline;
            this.button.color = KbqComponentColors.ContrastFade;

            if (this.filterBar.activeFilter?.changed || this.filterBar.activeFilter?.saved) {
                this.button.kbqStyle = 'changed-filter';
                this.button.color = KbqComponentColors.Empty;
            }
        });
    }
}
