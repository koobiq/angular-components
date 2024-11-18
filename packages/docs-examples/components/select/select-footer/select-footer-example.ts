import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
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
    styles: `
        .layout-row {
            width: 400px;
            margin: 0 auto;
            padding: 16px;
            align-items: center;
            gap: 24px;
            justify-content: flex-end;
        }

        .kbq-form__label {
            white-space: nowrap;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `
})
export class SelectFooterExample {
    selected = '';
}
