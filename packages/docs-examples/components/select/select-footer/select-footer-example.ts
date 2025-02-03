import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select footer
 */
@Component({
    standalone: true,
    selector: 'select-footer-example',
    templateUrl: 'select-footer-example.html',
    imports: [KbqFormFieldModule, KbqSelectModule, KbqButtonModule, KbqIconModule, KbqLinkModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
        .example-row {
            width: 400px;
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
export class SelectFooterExample {
    options = inject<Signal<string[]>>('LOCALIZED_SELECT_OPTIONS_EXAMPLE' as any);

    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;
}
