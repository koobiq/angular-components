import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Monospace input */
@Component({
    selector: 'input-monospace-example',
    imports: [KbqInputModule, KbqIconModule, ReactiveFormsModule],
    template: `
        <kbq-form-field style="width: 420px">
            <input kbqInput kbqInputMonospace [formControl]="control" />
            <i
                kbq-icon-button="kbq-square-multiple-o_16"
                kbqSuffix
                color="contrast"
                [attr.aria-label]="t().copyHash"
            ></i>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class InputMonospaceExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly control = new FormControl('9f3a7c1e2b4d6f8a0c9e5b7d3f1a6c2e8b4d0f9a');
}
