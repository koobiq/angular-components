import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Input
 */
@Component({
    standalone: true,
    selector: 'input-overview-example',
    imports: [
        KbqFormFieldModule,
        KbqIconModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <i
                [autoColor]="true"
                kbq-icon="kbq-magnifying-glass_16"
                kbqPrefix
            ></i>

            <input
                [(ngModel)]="value"
                kbqInput
                placeholder="Placeholder"
            />

            <kbq-cleaner />
        </kbq-form-field>

        <br />
        <br />
        <br />

        <kbq-form-field kbqFormFieldWithoutBorders>
            <i
                [autoColor]="true"
                kbq-icon="kbq-magnifying-glass_16"
                kbqPrefix
            ></i>

            <input
                [(ngModel)]="value"
                kbqInput
                placeholder="Placeholder"
            />

            <kbq-cleaner />
        </kbq-form-field>
    `
})
export class InputOverviewExample {
    themePalette = ThemePalette;
    value = '';
}
