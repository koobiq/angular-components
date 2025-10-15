import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { kbqDisableLegacyValidationDirectiveProvider, KbqOptionModule } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Inline edit controls
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
        KbqOptionModule,
        KbqSelectModule,
        KbqBadgeModule,
        KbqTagsModule
    ],
    selector: 'inline-edit-controls-example',
    template: `
        <form style="width: 100%" [formGroup]="form">
            <kbq-dl>
                <kbq-dt>Text Field</kbq-dt>
                <kbq-dd>
                    <kbq-inline-edit>
                        <div class="example-inline-text" kbqInlineEditViewMode>
                            <ng-container *ngTemplateOutlet="view; context: { $implicit: form.controls.input }" />
                        </div>
                        <kbq-form-field kbqInlineEditEditMode>
                            <input kbqInput [placeholder]="placeholder" [formControl]="form.controls.input" />
                        </kbq-form-field>
                    </kbq-inline-edit>
                </kbq-dd>

                <kbq-dt class="example-multiline-text__header">Textarea</kbq-dt>
                <kbq-dd>
                    <kbq-inline-edit #textareaInlineEdit showActions (saved)="update()">
                        <div kbqInlineEditViewMode class="example-inline-text__textarea-view">
                            @if (!textareaDisplayValue()) {
                                <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                            } @else {
                                <span>{{ textareaDisplayValue() }}</span>
                            }
                        </div>
                        <div kbqInlineEditEditMode>
                            @if (textareaInlineEdit.modeAsReadonly() === 'edit') {
                                <kbq-form-field>
                                    <textarea
                                        kbqTextarea
                                        [maxRows]="maxRows"
                                        [placeholder]="placeholder"
                                        [formControl]="form.controls.textarea"
                                    ></textarea>
                                </kbq-form-field>
                            }
                        </div>
                    </kbq-inline-edit>
                </kbq-dd>

                <kbq-dt class="example-multiline-text__header">Select Multiple</kbq-dt>
                <kbq-dd>
                    <kbq-inline-edit>
                        <div
                            kbqInlineEditViewMode
                            class="layout-flex layout-row layout-gap-xxs"
                            style="flex-wrap: wrap"
                        >
                            @if (form.controls.selectMultiple.value!.length > 0) {
                                <kbq-tag-list>
                                    @for (tag of form.controls.selectMultiple.value; track tag) {
                                        <kbq-tag [value]="tag">
                                            {{ tag }}
                                        </kbq-tag>
                                    }
                                </kbq-tag-list>
                            } @else {
                                <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                            }
                        </div>
                        <kbq-form-field kbqInlineEditEditMode>
                            <kbq-select
                                multiple
                                multiline
                                [placeholder]="placeholder"
                                [formControl]="form.controls.selectMultiple"
                            >
                                @for (option of options; track option) {
                                    <kbq-option [value]="option">{{ option }}</kbq-option>
                                }
                                <kbq-cleaner #kbqSelectCleaner />
                            </kbq-select>
                        </kbq-form-field>
                    </kbq-inline-edit>
                </kbq-dd>

                <kbq-dt>Select</kbq-dt>
                <kbq-dd>
                    <kbq-inline-edit>
                        <div class="example-inline-text" kbqInlineEditViewMode>
                            <ng-container *ngTemplateOutlet="view; context: { $implicit: form.controls.select }" />
                        </div>
                        <kbq-form-field kbqInlineEditEditMode>
                            <kbq-select [placeholder]="placeholder" [formControl]="form.controls.select">
                                @for (option of options; track option) {
                                    <kbq-option [value]="option">{{ option }}</kbq-option>
                                }
                            </kbq-select>
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
        .kbq-dt {
            width: 104px;
            display: inline-flex;
            align-items: center;
        }

        .kbq-dl {
            grid-template-columns: 104px minmax(0, 1fr);
            --kbq-description-list-size-horizontal-content-gap-horizontal: var(--kbq-size-xxs);
            --kbq-description-list-size-horizontal-gap-vertical: var(--kbq-size-3xs);
        }

        .example-multiline-text__header {
            padding-top: var(--kbq-size-xs);
            align-items: flex-start;
        }

        .example-inline-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .example-inline-text__textarea-view {
            overflow: hidden;
            white-space: pre-wrap;
        }
    `,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditControlsExample {
    protected readonly maxRows = 20;
    protected readonly placeholder = 'Placeholder';
    protected readonly options = Array.from({ length: 10 }).map((_, i) => `Option #${i + 1}`);

    protected readonly form = new FormGroup({
        input: new FormControl('Spain'),
        textarea: new FormControl(
            'Spanish football is characterized by technical skill, tactical innovation, and fierce regional rivalries.'
        ),
        selectMultiple: new FormControl(this.options.slice(0, 5)),
        select: new FormControl(this.options[0])
    });

    protected readonly textareaDisplayValue = signal(this.form.controls.textarea.value);

    protected update() {
        this.textareaDisplayValue.set(this.form.controls.textarea.value);
    }
}
