import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { kbqDisableLegacyValidationDirectiveProvider, KbqLocaleServiceModule } from '@koobiq/components/core';
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
        FormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqDlModule,
        KbqInputModule,
        NgTemplateOutlet,
        ReactiveFormsModule,
        KbqDatepickerModule,
        LuxonDateModule,
        KbqLocaleServiceModule,
        KbqTextareaModule
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
                    <ng-container *kbqInlineEditViewMode>
                        <div style="flex-wrap: wrap;">
                            @if (!control.control.value) {
                                <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                            } @else {
                                <span>{{ control.control.value }}</span>
                            }
                        </div>
                    </ng-container>
                    <ng-container *kbqInlineEditEditMode>
                        <kbq-form-field>
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
                    </ng-container>
                </kbq-inline-edit>
            </ng-template>
        </div>
    `,
    styles: `
        .kbq-dt {
            display: inline-flex;
            align-items: center;
        }
    `,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditHorizontalListExample {
    protected readonly placeholder = 'Placeholder';

    controls = [
        { label: 'Incident', type: 'text', control: new FormControl(null) },
        { label: 'Comment', type: 'comment', control: new FormControl(null), withActions: true },
        { label: 'Date', type: 'date', control: new FormControl(null) }
    ];
}
