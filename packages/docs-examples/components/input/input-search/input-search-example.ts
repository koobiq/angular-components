import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Search input */
@Component({
    selector: 'input-search-example',
    imports: [KbqInputModule, KbqIconModule],
    template: `
        <kbq-form-field style="width: 320px">
            <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix [autoColor]="true"></i>
            <input kbqInput [placeholder]="t().search" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class InputSearchExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
