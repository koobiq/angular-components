import {
    Attribute,
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
import { KbqIcon } from './icon.component';

@Component({
    selector: `[kbq-icon-item]`,
    template: '<ng-content />',
    styleUrls: ['icon-item.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        class: 'kbq kbq-icon kbq-icon-item kbq-icon-item_filled',
        '[class.kbq-icon-item_normal]': '!big',
        '[class.kbq-icon-item_big]': 'big',
        '[class.kbq-icon-item_fade-off]': '!fade',
        '[class.kbq-icon-item_fade-on]': 'fade'
    }
})
export class KbqIconItem extends KbqIcon implements CanColor {
    override name = 'KbqIconItem';

    @Input() fade: boolean = false;
    @Input() big: boolean = false;

    constructor(
        elementRef: ElementRef,
        @Attribute('kbq-icon-item') iconName: string,
        @Optional() @Inject(KBQ_FORM_FIELD_REF) formField: KbqFormFieldRef,
        protected changeDetectorRef: ChangeDetectorRef
    ) {
        super(elementRef, iconName, formField, changeDetectorRef);
    }
}
