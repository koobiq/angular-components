import { Clipboard } from '@angular/cdk/clipboard';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconButton } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Inline edit menu
 */
@Component({
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconButton,
        KbqDropdownModule,
        KbqTextareaModule,
        KbqDlModule,
        KbqToolTipModule,
        NgTemplateOutlet
    ],
    selector: 'inline-edit-menu-example',
    template: `
        <div role="group" class="layout-flex layout-column flex" aria-label="vertical list">
            <span class="kbq-text-normal-strong">Vertical list</span>

            <div class="layout-flex layout-column layout-gap-xs example-content__container">
                <kbq-inline-edit #textareaInlineEditVertical showActions (saved)="update()">
                    <kbq-label>Style</kbq-label>
                    <i
                        kbqInlineEditMenu
                        kbq-icon-button="kbq-ellipsis-vertical_16"
                        [kbqDropdownTriggerFor]="dropdown"
                        [color]="'contrast-fade'"
                    ></i>
                    <div kbqInlineEditViewMode class="example-inline-text__textarea-view">
                        <ng-container *ngTemplateOutlet="view; context: { $implicit: displayValue() }" />
                    </div>

                    <div kbqInlineEditEditMode>
                        @if (textareaInlineEditVertical.modeAsReadonly() === 'edit') {
                            <kbq-form-field>
                                <textarea
                                    kbqTextarea
                                    [maxRows]="maxRows"
                                    [placeholder]="placeholder"
                                    [formControl]="form.controls.style"
                                ></textarea>
                            </kbq-form-field>
                        }
                    </div>
                </kbq-inline-edit>

                <kbq-inline-edit>
                    <i
                        kbqInlineEditMenu
                        kbq-icon-button="kbq-undo_16"
                        [kbqTooltip]="'Reset to default value: 1991'"
                        [kbqTooltipArrow]="false"
                        [color]="'contrast-fade'"
                        (click)="form.controls.foundDate.setValue('1991')"
                    ></i>
                    <kbq-label>Founded</kbq-label>
                    <div class="example-inline-text" kbqInlineEditViewMode>
                        <ng-container *ngTemplateOutlet="view; context: { $implicit: form.controls.foundDate.value }" />
                    </div>
                    <kbq-form-field kbqInlineEditEditMode>
                        <input kbqInput [placeholder]="placeholder" [formControl]="form.controls.foundDate" />
                    </kbq-form-field>
                </kbq-inline-edit>
            </div>
        </div>

        <div role="group" class="layout-flex layout-column layout-gap-xs" aria-label="horizontal list">
            <span class="kbq-text-normal-strong">Horizontal list</span>

            <kbq-dl [vertical]="false">
                <kbq-dt class="example-multiline-text__header">Style</kbq-dt>
                <kbq-dd>
                    <kbq-inline-edit #textareaInlineEditHorizontal showActions (saved)="update()">
                        <i
                            kbqInlineEditMenu
                            kbq-icon-button="kbq-ellipsis-vertical_16"
                            [kbqDropdownTriggerFor]="dropdown"
                            [color]="'contrast-fade'"
                        ></i>
                        <div kbqInlineEditViewMode class="example-inline-text__textarea-view">
                            <ng-container *ngTemplateOutlet="view; context: { $implicit: displayValue() }" />
                        </div>
                        <div kbqInlineEditEditMode>
                            @if (textareaInlineEditHorizontal.modeAsReadonly() === 'edit') {
                                <kbq-form-field>
                                    <textarea
                                        kbqTextarea
                                        [maxRows]="maxRows"
                                        [placeholder]="placeholder"
                                        [formControl]="form.controls.style"
                                    ></textarea>
                                </kbq-form-field>
                            }
                        </div>
                    </kbq-inline-edit>
                </kbq-dd>

                <kbq-dt>Founded</kbq-dt>
                <kbq-dd>
                    <kbq-inline-edit>
                        <i
                            kbqInlineEditMenu
                            kbq-icon-button="kbq-undo_16"
                            [kbqTooltip]="'Reset to default value: 1991'"
                            [kbqTooltipArrow]="false"
                            [color]="'contrast-fade'"
                            (click)="form.controls.foundDate.setValue('1991')"
                        ></i>
                        <div class="example-inline-text" kbqInlineEditViewMode>
                            <ng-container
                                *ngTemplateOutlet="view; context: { $implicit: form.controls.foundDate.value }"
                            />
                        </div>

                        <kbq-form-field kbqInlineEditEditMode>
                            <input kbqInput [placeholder]="placeholder" [formControl]="form.controls.foundDate" />
                        </kbq-form-field>
                    </kbq-inline-edit>
                </kbq-dd>
            </kbq-dl>
        </div>

        <ng-template #view let-templateValue>
            @if (!templateValue) {
                <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
            } @else {
                <span>{{ templateValue }}</span>
            }
        </ng-template>

        <kbq-dropdown #dropdown="kbqDropdown">
            <button kbq-dropdown-item (click)="clipboard.copy(form.controls.style.value)">Copy text</button>
            <button kbq-dropdown-item (click)="clipboard.copy(form.controls.style.value)">Acti</button>
        </kbq-dropdown>
    `,
    styles: `
        div[role='group'] {
            width: 100%;
        }

        .kbq-dl {
            grid-template-columns: unset;
            --kbq-description-list-size-horizontal-content-gap-horizontal: var(--kbq-size-xxs);
            --kbq-description-list-size-horizontal-gap-vertical: var(--kbq-size-3xs);
        }

        .kbq-dt {
            width: 68px;
            display: inline-flex;
            align-items: center;
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

        .example-multiline-text__header {
            padding-top: var(--kbq-size-xs);
            align-items: flex-start;
        }

        .example-content__container {
            margin-left: -8px;
        }
    `,
    host: {
        class: 'layout-flex layout-column layout-gap-m'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditMenuExample {
    protected readonly maxRows = 10;
    protected readonly clipboard = inject(Clipboard);
    protected readonly placeholder = 'Placeholder';

    protected readonly form = new FormGroup({
        style: new FormControl(
            'Spanish football is characterized by technical skill, tactical innovation, and fierce regional rivalries.',
            { nonNullable: true }
        ),
        foundDate: new FormControl('1929')
    });
    protected readonly displayValue = signal(this.form.controls.style.value);

    protected update(): void {
        this.displayValue.set(this.form.controls.style.value);
    }
}
