import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSelectModule } from '@koobiq/components/select';
import { FormsModule } from '@angular/forms';

/**
 * @title Select empty
 */
@Component({
    selector: 'select-empty-example',
    imports: [KbqSelectModule, FormsModule],
    template: `
        <kbq-form-field>
            <kbq-select />
        </kbq-form-field>
    `,
    styles: `
        .kbq-form-field {
            width: 320px;
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-column layout-align-center-center layout-gap-l'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectEmptyExample {}
