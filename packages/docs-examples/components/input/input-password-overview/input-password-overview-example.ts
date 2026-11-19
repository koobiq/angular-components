import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Input password */
@Component({
    selector: 'input-password-overview-example',
    imports: [KbqInputModule, ReactiveFormsModule],
    template: `
        <kbq-form-field style="width: 250px">
            <kbq-label>{{ t().password }}</kbq-label>
            <input kbqInputPassword [formControl]="control" />
            <kbq-password-toggle [kbqTooltipHidden]="t().showPassword" [kbqTooltipNotHidden]="t().hidePassword" />
            <kbq-hint>{{ t().minLength }}</kbq-hint>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputPasswordOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly control = new FormControl('');
}
