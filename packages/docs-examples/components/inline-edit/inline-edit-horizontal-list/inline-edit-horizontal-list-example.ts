import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Inline edit horizontal list
 */
@Component({
    selector: 'inline-edit-horizontal-list-example',
    imports: [
        NgTemplateOutlet,
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqDlModule,
        KbqFormFieldModule,
        KbqInputModule
    ],
    template: `
        <form [formGroup]="form">
            <kbq-dl [vertical]="false">
                <kbq-dt>Country</kbq-dt>
                <kbq-dd>
                    <kbq-inline-edit>
                        <div class="example-inline-text" kbqInlineEditViewMode>
                            <ng-container *ngTemplateOutlet="view; context: { $implicit: form.controls.country }" />
                        </div>
                        <kbq-form-field kbqInlineEditEditMode>
                            <input kbqInput [placeholder]="placeholder" [formControl]="form.controls.country" />
                        </kbq-form-field>
                    </kbq-inline-edit>
                </kbq-dd>

                <kbq-dt>Capital</kbq-dt>
                <kbq-dd>
                    <kbq-inline-edit>
                        <div class="example-inline-text" kbqInlineEditViewMode>
                            <ng-container *ngTemplateOutlet="view; context: { $implicit: form.controls.capital }" />
                        </div>
                        <kbq-form-field kbqInlineEditEditMode>
                            <input kbqInput [placeholder]="placeholder" [formControl]="form.controls.capital" />
                        </kbq-form-field>
                    </kbq-inline-edit>
                </kbq-dd>

                <kbq-dt>Currency</kbq-dt>
                <kbq-dd>
                    <kbq-inline-edit>
                        <div class="example-inline-text" kbqInlineEditViewMode>
                            <ng-container *ngTemplateOutlet="view; context: { $implicit: form.controls.currency }" />
                        </div>
                        <kbq-form-field kbqInlineEditEditMode>
                            <input kbqInput [placeholder]="placeholder" [formControl]="form.controls.currency" />
                        </kbq-form-field>
                    </kbq-inline-edit>
                </kbq-dd>
            </kbq-dl>
        </form>

        <ng-template #view let-control>
            @if (!control.value) {
                <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
            } @else {
                {{ control.value }}
            }
        </ng-template>
    `,
    styles: `
        form {
            width: 100%;
        }

        .kbq-dl {
            --kbq-description-list-size-horizontal-gap-vertical: 0;
        }

        .kbq-dt {
            display: inline-flex;
            align-items: center;
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
export class InlineEditHorizontalListExample {
    protected readonly placeholder = 'Placeholder';

    protected readonly form = new FormGroup({
        country: new FormControl('Spain'),
        capital: new FormControl('Madrid'),
        currency: new FormControl('Euro')
    });
}
