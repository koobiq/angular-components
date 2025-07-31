import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Input
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'input-overview-example',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix [autoColor]="true"></i>

            <input kbqInput placeholder="Placeholder" [(ngModel)]="value" />

            <kbq-cleaner />
        </kbq-form-field>

        <br />
        <br />
        <br />

        <kbq-form-field kbqFormFieldWithoutBorders>
            <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix [autoColor]="true"></i>

            <input kbqInput placeholder="Placeholder" [(ngModel)]="value" />

            <kbq-cleaner />
        </kbq-form-field>
    `
})
export class InputOverviewExample {
    themePalette = ThemePalette;
    value = '';
}
