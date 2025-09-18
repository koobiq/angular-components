import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KbqAlertModule } from '@koobiq/components/alert';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Inline edit content alignment
 */
@Component({
    standalone: true,
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqInputModule,
        NgTemplateOutlet,
        KbqAlertModule
    ],
    selector: 'inline-edit-content-alignment-example',
    template: `
        <div class="example__hover-divider"></div>
        <kbq-alert
            class="layout-margin-bottom-xs"
            style="width: 100%"
            [alertColor]="'warning'"
            [alertStyle]="'colored'"
        >
            Parameters with inline editing are visually left-aligned with other elements on the screen
        </kbq-alert>

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
        :host {
            position: relative;
            display: block;
        }

        :host:hover .example__hover-divider {
            border-color: var(--kbq-line-error);
            opacity: var(--kbq-opacity-disabled);
        }

        .example__hover-divider {
            position: absolute;
            top: 0;
            border-right: 1px solid transparent;
            height: 100%;
        }

        form {
            width: calc(100% + 16px);
            margin-left: -8px;
        }

        .example-inline-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `,
    host: {
        class: 'layout-flex layout-column'
    },
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditContentAlignmentExample {
    protected readonly placeholder = 'Placeholder';

    protected readonly form = new FormGroup({
        country: new FormControl('Spain'),
        capital: new FormControl('Madrid'),
        currency: new FormControl('Euro')
    });
}
