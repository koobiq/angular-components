import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { KBQ_FORM_FIELD_REF, KbqColorDirective } from '@koobiq/components/core';

@Component({
    selector: '[kbq-icon]',
    template: '<ng-content />',
    styleUrls: ['icon.scss', 'icon-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq kbq-icon',
        '[class]': 'iconName',
        '[class.kbq-error]': 'color === "error" || hasError'
    }
})
export class KbqIcon extends KbqColorDirective implements AfterContentInit {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true });
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    @Input() small = false;
    @Input() autoColor = false;

    hasError: boolean = false;

    /** Name of an icon within a @koobiq/icons. */
    @Input({ alias: 'kbq-icon' }) iconName: string;

    protected name = 'KbqIcon';

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
            this.formField?.control?.stateChanges.subscribe(this.updateState);

            this.updateState();
        }

        this.updateMaxHeight();
    }

    private updateState = () => {
        this.hasError = this.formField?.control?.errorState;

        this.changeDetectorRef.markForCheck();
    };
}
