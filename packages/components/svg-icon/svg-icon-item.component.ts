import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Input,
    Optional,
    ViewEncapsulation
} from '@angular/core';
import { CanColor, KBQ_FORM_FIELD_REF, KbqFormFieldRef } from '@koobiq/components/core';
import { KbqSvgIcon } from './svg-icon.component';

@Component({
    standalone: true,
    selector: `[kbq-svg-icon-item]`,
    template: '<ng-content />',
    styleUrls: ['svg-icon-item.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        class: 'kbq-svg-icon kbq-svg-icon-item',
        '[class.kbq-svg-icon-item_normal]': '!big',
        '[class.kbq-svg-icon-item_big]': 'big',
        '[class.kbq-svg-icon-item_fade-off]': '!fade',
        '[class.kbq-svg-icon-item_fade-on]': 'fade'
    }
})
export class KbqSvgIconItem extends KbqSvgIcon implements CanColor {
    @Input() fade: boolean = false;
    @Input() big: boolean = false;

    constructor(
        elementRef: ElementRef,
        @Optional() @Inject(KBQ_FORM_FIELD_REF) formField: KbqFormFieldRef,
        protected changeDetectorRef: ChangeDetectorRef
    ) {
        super(elementRef, formField, changeDetectorRef);
    }
}
