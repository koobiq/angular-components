import {
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Optional,
    ViewEncapsulation
} from '@angular/core';
import {
    CanColor,
    KBQ_FORM_FIELD_REF,
    KbqFormFieldRef
} from '@koobiq/components/core';

import { KbqIcon } from './icon.component';


@Component({
    selector: `[kbq-icon-item]`,
    template: '<ng-content></ng-content>',
    styleUrls: ['icon-item.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        class: 'mc kbq-icon kbq-icon-item'
    }
})
export class KbqIconItem extends KbqIcon implements CanColor {

    override name = 'KbqIconItem';
    constructor(
        elementRef: ElementRef,
        @Attribute('kbq-icon-item') iconName: string,
        @Optional() @Inject(KBQ_FORM_FIELD_REF) formField: KbqFormFieldRef,
        protected changeDetectorRef: ChangeDetectorRef
    ) {
        super(elementRef, iconName, formField, changeDetectorRef);
    }
}
