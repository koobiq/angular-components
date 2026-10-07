import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    DestroyRef,
    effect,
    inject,
    Injector,
    input,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { delay } from 'rxjs/operators';
import { KBQ_FORM_FIELD } from './form-field';
import { KbqHint } from './hint';

/** Password hint to be shown below the password form field control. */
@Component({
    selector: 'kbq-reactive-password-hint',
    imports: [KbqIconModule],
    template: `
        <i [kbq-icon]="icon()" [color]="color"></i>

        <span class="kbq-hint__text">
            <ng-content />
        </span>
    `,
    styleUrls: [
        './hint.scss',
        './hint-tokens.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-reactive-password-hint'
    },
    exportAs: 'kbqReactivePasswordHint'
})
export class KbqReactivePasswordHint extends KbqHint {
    private readonly formField = inject(KBQ_FORM_FIELD, { optional: true });
    private readonly destroyRef = inject(DestroyRef);
    private readonly injector = inject(Injector);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    /** Whether the form field control has an error. */
    readonly hasError = input(false, { transform: booleanAttribute });

    /** Disables `color` for the hint text. */
    override readonly fillTextOff = input(true, { transform: booleanAttribute });

    /**
     * The form field hint icon.
     *
     * @docs-private
     */
    protected readonly icon = computed(() => (this.hasError() ? 'kbq-xmark-s_16' : 'kbq-check-s_16'));

    constructor() {
        super();

        this.color = KbqComponentColors.ContrastFade;

        // `hasError` also drives `icon`, so the color has to follow it in the same pass, otherwise the icon and
        // its color disagree for a tick.
        effect(() => {
            this.hasError();

            this.updateColor();
        });

        afterNextRender(() => {
            const control = this.formField?.control();

            if (!control) return;

            // The color follows `touched` and `pristine`, which the forms API updates in the same events that
            // change the focus and the value, so it is read once those events are over.
            toObservable(
                computed(() => [control.focused(), control.value()]),
                { injector: this.injector }
            )
                .pipe(delay(0), takeUntilDestroyed(this.destroyRef))
                .subscribe(() => this.updateColor());
        });
    }

    private updateColor(): void {
        this.color = this.makeColor();

        this.changeDetectorRef.markForCheck();
    }

    private makeColor(): KbqComponentColors {
        const control = this.formField?.control();

        if (control?.ngControl?.untouched && control.ngControl.pristine) {
            return KbqComponentColors.ContrastFade;
        }

        return this.hasError() ? KbqComponentColors.Error : KbqComponentColors.Success;
    }
}
