import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqFormField } from './form-field';

/**
 * KbqCleaner to be placed in end of the form field.
 * Resets form control by click.
 */
@Component({
    selector: 'kbq-cleaner',
    imports: [KbqIconModule],
    template: `
        <i color="contrast-fade" kbq-icon-button="kbq-circle-xmark_16" [autoColor]="true"></i>
    `,
    styleUrl: './cleaner.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqCleaner',
    host: {
        class: 'kbq-cleaner___EXPERIMENTAL',
        '(click)': 'clean($event)',
        '[style.visibility]': 'visible ? "visible" : "hidden"',
        '[attr.aria-hidden]': '!visible'
    }
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
