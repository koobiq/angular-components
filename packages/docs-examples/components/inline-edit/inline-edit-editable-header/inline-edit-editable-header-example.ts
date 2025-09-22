import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Inline edit editable header
 */
@Component({
    standalone: true,
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqTextareaModule
    ],
    selector: 'inline-edit-editable-header-example',
    template: `
        <kbq-inline-edit #inlineEdit (saved)="onSave()">
            <div kbqInlineEditViewMode>
                @if (!displayValue()) {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                } @else {
                    <span class="kbq-headline">{{ displayValue() }}</span>
                }
            </div>
            <div class="example-textarea_editable-header" kbqInlineEditEditMode>
                <!-- defer textarea render to calc inner styles correctly -->
                @if (inlineEdit.modeAsReadonly() === 'edit') {
                    <kbq-form-field>
                        <textarea
                            kbqTextarea
                            [rows]="1"
                            [freeRowsHeight]="0"
                            [maxRows]="maxRows"
                            [placeholder]="placeholder"
                            [formControl]="control"
                        ></textarea>
                    </kbq-form-field>
                }
            </div>
        </kbq-inline-edit>
        <div>{{ content }}</div>
    `,
    host: {
        class: 'layout-flex layout-column layout-gap-s'
    },
    styles: `
        :host .kbq-inline-edit {
            width: calc(100% + 12px);
            margin-left: -6px;
            --kbq-inline-edit-padding-vertical: 3px;
            --kbq-inline-edit-padding-horizontal: 5px;
        }

        .kbq-textarea {
            font-size: var(--kbq-typography-headline-font-size);
            font-weight: var(--kbq-typography-headline-font-weight);
            line-height: var(--kbq-typography-headline-line-height);
            font-family: var(--kbq-typography-headline-font-family);
            text-transform: var(--kbq-typography-headline-text-transform);
            font-feature-settings: var(--kbq-typography-headline-font-feature-settings);
            letter-spacing: var(--kbq-typography-headline-letter-spacing);
            --kbq-textarea-size-padding-vertical: 3px;
            --kbq-textarea-size-padding-horizontal: 5px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditEditableHeaderExample {
    protected readonly maxRows = 5;
    protected readonly placeholder = 'Placeholder';
    protected readonly control = new FormControl('Spain', { nonNullable: true });
    protected readonly displayValue = signal(this.control.value);
    protected readonly content =
        "Spanish football is characterized by technical skill, tactical innovation, and fierce regional rivalries. La Liga, founded in 1929, features some of the world's best clubs. Spain's national team dominated world football from 2008-2012, winning two European Championships and a World Cup with their 'tiki-taka' style.";

    protected onSave(): void {
        if (!this.control.value) {
            this.control.setValue(this.control.defaultValue);
        }

        this.displayValue.set(this.control.value);
    }
}
