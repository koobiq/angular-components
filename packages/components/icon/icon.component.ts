import {
    AfterContentInit,
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
import {
    CanColor,
    CanColorCtor,
    KBQ_FORM_FIELD_REF,
    KbqComponentColors,
    KbqFormFieldRef,
    mixinColor
} from '@koobiq/components/core';

/** @docs-private */
export class KbqIconBase {
    constructor(public elementRef: ElementRef) {}
}

/** @docs-private */
export const KbqIconMixinBase: CanColorCtor & typeof KbqIconBase = mixinColor(
    KbqIconBase,
    KbqComponentColors.ContrastFade
);

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
        '[class.kbq-error]': 'color === "error" || hasError'
    }
})
export class KbqIcon extends KbqIconMixinBase implements CanColor, AfterContentInit {
    @Input() small = false;
    @Input() autoColor = false;

    hasError: boolean = false;

    protected name = 'KbqIcon';

    constructor(
        elementRef: ElementRef,
        @Attribute('kbq-icon') protected iconName: string,
        @Optional() @Inject(KBQ_FORM_FIELD_REF) protected formField: KbqFormFieldRef,
        protected changeDetectorRef: ChangeDetectorRef
    ) {
        super(elementRef);

        if (iconName) {
            this.getHostElement().classList.add(iconName);
        }
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
