import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Inline edit on clean
 */
@Component({
    selector: 'inline-edit-on-clean-example',
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqDlModule,
        KbqInputModule
    ],
    template: `
        <kbq-dl class="flex">
            <kbq-dt>Label</kbq-dt>
            <kbq-dd>
                <kbq-inline-edit (saved)="onSave()">
                    <div class="example-inline-text" kbqInlineEditViewMode>
                        @if (!control.control.value) {
                            <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                        } @else {
                            <span>{{ control.control.value }}</span>
                        }
                    </div>
                    <kbq-form-field kbqInlineEditEditMode>
                        <input kbqInput [placeholder]="placeholder" [formControl]="control.control" />
                    </kbq-form-field>
                </kbq-inline-edit>
            </kbq-dd>
        </kbq-dl>
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ]
})
export class InlineEditOnCleanExample {
    protected readonly placeholder = 'Placeholder';
    protected readonly control = { label: 'Label', control: new FormControl('Default value', { nonNullable: true }) };

    protected onSave(): void {
        if (this.control.control.value) return;

        this.control.control.setValue(this.control.control.defaultValue);
    }
}
