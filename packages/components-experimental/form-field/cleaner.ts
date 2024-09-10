import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * KbqCleaner to be placed in end of the form field.
 * Resets form control by click.
 */
@Component({
    standalone: true,
    selector: 'kbq-cleaner',
    exportAs: 'kbqCleaner',
    template: `
        <i
            [autoColor]="true"
            kbq-icon-button="mc-close-circle_16"
        ></i>
    `,
    styleUrl: './cleaner.scss',
    host: {
        class: 'kbq-cleaner',
        '(click)': '_click($event)'
    },
    imports: [KbqIconModule],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCleaner {
    readonly #formField = inject(KBQ_FORM_FIELD_REF, { optional: true });

    /** @docs-private */
    _click(event: MouseEvent): void {
        event.stopPropagation();

        this.#formField?.control?.ngControl?.reset();
        this.#formField?.control?.focus();
    }
}
