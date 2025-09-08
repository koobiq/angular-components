import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFileItem, KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqCleaner, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Inline edit custom handler
 */
@Component({
    standalone: true,
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqCleaner,
        KbqBadgeModule,
        KbqIconModule,
        KbqFileUploadModule,
        ReactiveFormsModule
    ],
    selector: 'inline-edit-custom-handler-example',
    template: `
        <kbq-inline-edit
            showActions
            [getValueHandler]="getValueHandler"
            [setValueHandler]="setValueHandler"
            (saved)="update()"
        >
            <kbq-label>Label</kbq-label>

            <div class="layout-row layout-gap-xxs" style="flex-wrap: wrap;" kbqInlineEditViewMode>
                @let value = displayValue();
                @if (value && value.file) {
                    {{ value.file.name }}
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <div kbqInlineEditEditMode>
                <kbq-file-upload class="kbq-form__control flex-80" [formControl]="control">
                    <i kbq-icon="kbq-file-o_16"></i>
                </kbq-file-upload>
            </div>
        </kbq-inline-edit>
    `,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditCustomHandlerExample {
    protected readonly control = new FormControl<KbqFileItem | null>(null);
    protected readonly placeholder = 'Placeholder';
    protected readonly displayValue = signal(this.control.value);

    protected getValueHandler = () => this.control.value;
    protected setValueHandler = (value: KbqFileItem | null) => this.control.setValue(value);

    protected update(): void {
        this.displayValue.set(this.control.value);
    }
}
