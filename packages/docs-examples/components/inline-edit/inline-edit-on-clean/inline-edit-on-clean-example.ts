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
    standalone: true,
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqDlModule,
        KbqInputModule
    ],
    selector: 'inline-edit-on-clean-example',
    template: `
        <kbq-dl class="flex">
            <kbq-dt>Label</kbq-dt>
            <kbq-dd>
                <kbq-inline-edit (saved)="onSave()">
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
                            <input kbqInput [placeholder]="placeholder" [formControl]="control.control" />
                        </kbq-form-field>
                    </ng-container>
                </kbq-inline-edit>
            </kbq-dd>
        </kbq-dl>
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
export class InlineEditOnCleanExample {
    protected readonly placeholder = 'Placeholder';
    protected readonly control = { label: 'Label', control: new FormControl('Default value', { nonNullable: true }) };

    onSave() {
        if (!this.control.control.value) {
            this.control.control.setValue(this.control.control.defaultValue);
        }
    }
}
