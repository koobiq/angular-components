import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCheckbox } from '@koobiq/components/checkbox';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconButton } from '@koobiq/components/icon';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Icon-button
 */
@Component({
    selector: 'icon-button-overview-example',
    imports: [KbqIconButton, KbqCheckbox, FormsModule],
    template: `
        <div class="layout-margin-bottom-l">
            <i
                kbq-icon-button="kbq-magnifying-glass_16"
                [attr.aria-label]="text().search"
                [color]="colors.Theme"
                [disabled]="disabled()"
            ></i>
        </div>

        <kbq-checkbox [(ngModel)]="disabled">disabled</kbq-checkbox>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconButtonOverviewExample extends BaseLocalizedExample<ExampleText> {
    readonly disabled = model(false);
    colors = KbqComponentColors;

    constructor() {
        super(TEXT);
    }
}
