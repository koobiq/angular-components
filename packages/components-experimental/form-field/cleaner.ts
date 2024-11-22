import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqFormField } from './form-field';

/**
 * KbqCleaner to be placed in end of the form field.
 * Resets form control by click.
 */
@Component({
    standalone: true,
    imports: [KbqIconModule],
    selector: 'kbq-cleaner',
    exportAs: 'kbqCleaner',
    template: `
        <i [autoColor]="true" kbq-icon-button="kbq-xmark-circle_16"></i>
    `,
    styleUrl: './cleaner.scss',
    host: {
        class: 'kbq-cleaner___EXPERIMENTAL',
        '(click)': 'clean($event)',
        '[style.visibility]': 'visible ? "visible" : "hidden"',
        '[attr.aria-hidden]': '!visible'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCleaner {
    // @TODO fix types (#DS-2915)
    private readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true }) as unknown as KbqFormField | undefined;

    /** Whether to display the cleaner. */
    get visible(): boolean {
        return !this.formField?.disabled && !!this.formField?.control?.ngControl?.value;
    }

    /** Clean the form field control. */
    protected clean(event: MouseEvent): void {
        event.stopPropagation();

        this.formField?.control?.ngControl?.reset();
        this.formField?.control?.focus();
    }
}
