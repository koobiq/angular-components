import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    type AbstractControl,
    FormControl,
    ReactiveFormsModule,
    type ValidationErrors,
    type ValidatorFn
} from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

const graphemeSegmenter = new Intl.Segmenter();

/** Counts user-perceived characters so an emoji, including a compound one, counts as one. */
const passwordMinLength =
    (min: number): ValidatorFn =>
    ({ value }: AbstractControl): ValidationErrors | null => {
        if (typeof value !== 'string') return null;

        const actual = Array.from(graphemeSegmenter.segment(value)).length;

        return actual >= min ? null : { minLength: { min, actual } };
    };

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
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class InputPasswordOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly control = new FormControl('', [passwordMinLength(16)]);
}
