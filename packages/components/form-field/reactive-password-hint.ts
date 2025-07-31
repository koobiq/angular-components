import { NgClass } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { KBQ_FORM_FIELD_REF, KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { EMPTY, merge } from 'rxjs';
import { KbqFormField } from './form-field';
import { KbqHint } from './hint';

/** Password hint to be shown below the password form field control. */
@Component({
    standalone: true,
    imports: [NgClass, KbqIconModule],
    selector: 'kbq-reactive-password-hint',
    exportAs: 'kbqReactivePasswordHint',
    template: `
        <i kbq-icon="" [ngClass]="icon()"></i>

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
    private readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true }) as unknown as KbqFormField | undefined;
    private readonly destroyRef = inject(DestroyRef);

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

        const hasError = toObservable(this.hasError);

        afterNextRender(() => {
            merge(this.formField?.control?.stateChanges || EMPTY, hasError)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => (this.color = this.makeColor()));
        });
    }

    private makeColor(): KbqComponentColors {
        const invalid = this.formField?.invalid;
        const hasError = this.hasError();

        if (invalid && hasError) return KbqComponentColors.Error;

        if ((!invalid && !hasError) || !hasError) return KbqComponentColors.Success;

        return KbqComponentColors.ContrastFade;
    }
}
