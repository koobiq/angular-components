import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Inline edit vertical list
 */
@Component({
    standalone: true,
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqInputModule
    ],
    selector: 'inline-edit-vertical-list-example',
    template: `
        <form [formGroup]="form">
            <kbq-inline-edit>
                <kbq-label>Country</kbq-label>

                <div class="example-inline-text" kbqInlineEditViewMode>
                    @if (!!form.controls.country.value) {
                        <span>{{ form.controls.country.value }}</span>
                    } @else {
                        <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                    }
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="placeholder" [formControl]="form.controls.country" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit>
                <kbq-label>Capital</kbq-label>

                <div class="example-inline-text" kbqInlineEditViewMode>
                    @if (!!form.controls.capital.value) {
                        <span>{{ form.controls.capital.value }}</span>
                    } @else {
                        <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                    }
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="placeholder" [formControl]="form.controls.capital" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit>
                <kbq-label>Currency</kbq-label>

                <div class="example-inline-text" kbqInlineEditViewMode>
                    @if (!!form.controls.currency.value) {
                        <span>{{ form.controls.currency.value }}</span>
                    } @else {
                        <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                    }
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="placeholder" [formControl]="form.controls.currency" />
                </kbq-form-field>
            </kbq-inline-edit>
        </form>
    `,
    styles: `
        form {
            width: 100%;
        }

        .example-inline-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditVerticalListExample {
    protected readonly placeholder = 'Placeholder';

    protected readonly form = new FormGroup({
        country: new FormControl('Spain'),
        capital: new FormControl('Madrid'),
        currency: new FormControl('Euro')
    });
}
