import { NgTemplateOutlet } from '@angular/common';
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
    selector: 'inline-edit-vertical-list-example',
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqInputModule,
        NgTemplateOutlet
    ],
    template: `
        <form [formGroup]="form">
            <kbq-inline-edit>
                <kbq-label>Country</kbq-label>

                <div class="example-inline-text" kbqInlineEditViewMode>
                    <ng-container *ngTemplateOutlet="view; context: { $implicit: form.controls.country.value }" />
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="placeholder" [formControl]="form.controls.country" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit>
                <kbq-label>Capital</kbq-label>

                <div class="example-inline-text" kbqInlineEditViewMode>
                    <ng-container *ngTemplateOutlet="view; context: { $implicit: form.controls.capital.value }" />
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="placeholder" [formControl]="form.controls.capital" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit>
                <kbq-label>Currency</kbq-label>

                <div class="example-inline-text" kbqInlineEditViewMode>
                    <ng-container *ngTemplateOutlet="view; context: { $implicit: form.controls.currency.value }" />
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="placeholder" [formControl]="form.controls.currency" />
                </kbq-form-field>
            </kbq-inline-edit>
        </form>

        <ng-template #view let-value>
            @if (!value) {
                <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
            } @else {
                <span>{{ value }}</span>
            }
        </ng-template>
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ]
})
export class InlineEditVerticalListExample {
    protected readonly placeholder = 'Placeholder';

    protected readonly form = new FormGroup({
        country: new FormControl('Spain'),
        capital: new FormControl('Madrid'),
        currency: new FormControl('Euro')
    });
}
