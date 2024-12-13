import {
    Directive,
    ElementRef,
    inject,
    Input,
    ViewChild
} from '@angular/core';
import { KbqButton, KbqButtonStyles } from '../button';
import { KbqComponentColors } from '../core';
import { KbqFilter } from './filter-bar.types';

@Directive({
    standalone: true,
    selector: '[kbq-filter-bar-button]',
    host: {
        '[class]': 'computedStyles'
    }
})
export class KbqFilterBarButton {
    private readonly button = inject(KbqButton);

    protected computedStyles;

    @ViewChild('kbqTitleText', { static: false }) textElement: ElementRef;

    @Input()
    set filter(value: KbqFilter | null) {
        console.log('set filter: ');
        this._filter = value;

        if (this.filter) {
            this.computedStyles = {
                'kbq-button_changed-filter': this.filter.changed || this.filter.unsaved
            };

            if (this.filter.changed || this.filter.unsaved) {
                this.button.kbqStyle = 'changed-filter';
                this.button.color = KbqComponentColors.Empty;
            }
        } else {
            this.computedStyles = '';
            this.button.kbqStyle = KbqButtonStyles.Outline;
            this.button.color = KbqComponentColors.ContrastFade;
        }
    }

    get filter(): KbqFilter | null {
        return this._filter;
    }

    private _filter: KbqFilter | null = null;
}
