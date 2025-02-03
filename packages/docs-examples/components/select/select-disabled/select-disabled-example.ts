import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select disabled
 */
@Component({
    standalone: true,
    selector: 'select-disabled-example',
    imports: [KbqFormFieldModule, KbqSelectModule],
    templateUrl: 'select-disabled-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
        .example-row {
            width: 440px;
            margin: 0 auto;
            padding: var(--kbq-size-l);
            align-items: center;
            gap: var(--kbq-size-xxl);
            justify-content: flex-end;
        }

        kbq-form-field {
            width: 320px;
        }

        .kbq-form__label {
            white-space: nowrap;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `
})
export class SelectDisabledExample {
    options = inject<Signal<string[]>>('LOCALIZED_SELECT_OPTIONS_EXAMPLE' as any);
}
