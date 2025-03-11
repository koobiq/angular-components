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
import { KbqIcon } from './icon.component';

@Component({
    standalone: true,
    selector: `[kbq-icon-item]`,
    template: '<ng-content />',
    styleUrls: ['icon-item.scss', 'icon-item-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        class: 'kbq kbq-icon-item kbq-icon-item_filled',
        '[class.kbq-icon-item_normal]': '!big',
        '[class.kbq-icon-item_big]': 'big',
        '[class.kbq-icon-item_fade-off]': '!fade',
        '[class.kbq-icon-item_fade-on]': 'fade'
    }
})
export class KbqIconItem extends KbqIcon implements CanColor {
    override name = 'KbqIconItem';

    @Input({ alias: 'kbq-icon-item' })
    set iconName(value: string) {
        this._iconName = value;
    }

    get iconName() {
        return this._iconName;
    }

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
