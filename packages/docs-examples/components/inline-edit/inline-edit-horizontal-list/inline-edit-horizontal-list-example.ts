import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    kbqDisableLegacyValidationDirectiveProvider,
    KbqFormattersModule,
    KbqLocaleServiceModule
} from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Inline edit horizontal list
 */
@Component({
    standalone: true,
    imports: [
        NgTemplateOutlet,
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqDlModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqTextareaModule,
        LuxonDateModule,
        KbqDatepickerModule,
        KbqLocaleServiceModule,
        KbqFormattersModule
    ],
    selector: 'inline-edit-horizontal-list-example',
    template: `
        <div class="flex">
            <kbq-dl>
                @for (control of controls; track control.label) {
                    <kbq-dt>{{ control.label }}</kbq-dt>
                    <kbq-dd><ng-container *ngTemplateOutlet="edit; context: { $implicit: control }" /></kbq-dd>
                }
            </kbq-dl>

            <ng-template #edit let-control>
                <kbq-inline-edit [showActions]="!!control?.withActions">
                    <div class="example-inline-text" kbqInlineEditViewMode>
                        @if (!control.control.value) {
                            <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                        } @else {
                            @if (control.type === 'date') {
                                {{ control.control.value | absoluteShortDate }}
                            } @else {
                                {{ control.control.value }}
                            }
                        }
                    </div>
                    <kbq-form-field kbqInlineEditEditMode>
                        @switch (control.type) {
                            @case ('text') {
                                <ng-container>
                                    <input kbqInput [placeholder]="placeholder" [formControl]="control.control" />
                                </ng-container>
                            }
                            @case ('comment') {
                                <ng-container>
                                    <textarea
                                        kbqTextarea
                                        [placeholder]="placeholder"
                                        [formControl]="control.control"
                                    ></textarea>
                                </ng-container>
                            }
                            @case ('date') {
                                <ng-container>
                                    <input [kbqDatepicker]="datepicker" [formControl]="control.control" />
                                    <kbq-datepicker #datepicker />
                                </ng-container>
                            }
                        }
                    </kbq-form-field>
                </kbq-inline-edit>
            </ng-template>
        </div>
    `,
    styles: `
        .kbq-dt {
            display: inline-flex;
            align-items: center;
        }

        .example-inline-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        ::ng-deep .kbq-inline-edit__panel .kbq-form-field-type-datepicker {
            width: 100%;
        }
    `,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditHorizontalListExample {
    protected readonly placeholder = 'Placeholder';

    protected readonly controls = [
        { label: 'Incident', type: 'text', control: new FormControl(null) },
        { label: 'Comment', type: 'comment', control: new FormControl(''), withActions: true },
        { label: 'Date', type: 'date', control: new FormControl('') }
    ];
}
