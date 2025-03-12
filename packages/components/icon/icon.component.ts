import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Inject,
    Input,
    Optional,
    ViewEncapsulation
} from '@angular/core';
import { CanColor, CanColorCtor, KBQ_FORM_FIELD_REF, KbqFormFieldRef, mixinColor } from '@koobiq/components/core';

/** @docs-private */
export class KbqIconBase {
    constructor(public elementRef: ElementRef) {}
}

/** @docs-private */
export const KbqIconMixinBase: CanColorCtor & typeof KbqIconBase = mixinColor(KbqIconBase);

@Component({
    standalone: true,
    selector: '[kbq-icon]',
    template: '<ng-content />',
    styleUrls: ['icon.scss', 'icon-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        class: 'kbq kbq-icon',
        '[class]': 'iconName',
        '[class.kbq-error]': 'color === "error" || hasError'
    }
})
export class KbqIcon extends KbqIconMixinBase implements CanColor, AfterContentInit {
    @Input() small = false;
    @Input() autoColor = false;

    hasError: boolean = false;

    /** Name of an icon within a @koobiq/icons. */
    @Input({ alias: 'kbq-icon' }) iconName: string;

    protected name = 'KbqIcon';

    constructor(
        elementRef: ElementRef,
        @Optional() @Inject(KBQ_FORM_FIELD_REF) protected formField: KbqFormFieldRef,
        protected changeDetectorRef: ChangeDetectorRef
    ) {
        super(elementRef);
    }

    getHostElement() {
        return this.elementRef.nativeElement;
    }

    updateMaxHeight() {
        if (this.name !== 'KbqIcon') {
            return;
        }

        const size = parseInt(this.iconName?.split('_')[1]);

        if (size) {
            this.getHostElement().style.maxHeight = `${size}px`;
        }
    }

    ngAfterContentInit(): void {
        if (this.autoColor) {
            this.formField.control?.stateChanges.subscribe(this.updateState);

            this.updateState();
        }

        this.updateMaxHeight();
    }

    private updateState = () => {
        this.hasError = this.formField.control?.errorState;

        this.changeDetectorRef.markForCheck();
    };
}
