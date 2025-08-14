import { NgClass } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_FORM_FIELD_REF, KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { EMPTY } from 'rxjs';
import { delay } from 'rxjs/operators';
import { KbqFormField } from './form-field';
import { KbqHint } from './hint';

/** Password hint to be shown below the password form field control. */
@Component({
    standalone: true,
    imports: [NgClass, KbqIconModule],
    selector: 'kbq-reactive-password-hint',
    exportAs: 'kbqReactivePasswordHint',
    template: `
        <i kbq-icon="" [ngClass]="icon()" [color]="color"></i>

        <span class="kbq-hint__text">
            <ng-content />
        </span>
    `,
    styleUrls: [
        './hint.scss',
        './hint-tokens.scss'
    ],
    host: {
        class: 'kbq-reactive-password-hint'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqReactivePasswordHint extends KbqHint {
    // @TODO fix types (#DS-2915)
    private readonly formField = inject<KbqFormField>(KBQ_FORM_FIELD_REF, { optional: true });
    private readonly destroyRef = inject(DestroyRef);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    /** Whether the form field control has an error. */
    readonly hasError = input(false, { transform: booleanAttribute });

    /**
     * The form field hint icon.
     *
     * @docs-private
     */
    protected readonly icon = computed(() => (this.hasError() ? 'kbq-xmark-s_16' : 'kbq-check-s_16'));

    constructor() {
        super();

        this.fillTextOff = true;
        this.compact = false;
        this.color = KbqComponentColors.ContrastFade;

        afterNextRender(() => {
            (this.formField?.control?.stateChanges || EMPTY)
                .pipe(delay(0), takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                    this.color = this.makeColor();

                    this.changeDetectorRef.markForCheck();
                });
        });
    }

    private makeColor(): KbqComponentColors {
        if (this.formField?.control.ngControl?.untouched && this.formField.control.ngControl.pristine) {
            return KbqComponentColors.ContrastFade;
        }

        return this.hasError() ? KbqComponentColors.Error : KbqComponentColors.Success;
    }
}
