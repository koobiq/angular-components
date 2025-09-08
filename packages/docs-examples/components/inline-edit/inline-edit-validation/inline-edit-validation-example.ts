import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqCleaner, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Inline edit validation
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
        ReactiveFormsModule,
        KbqTextareaModule
    ],
    selector: 'inline-edit-validation-example',
    template: `
        <kbq-inline-edit showActions [validationTooltip]="'Value required'">
            <kbq-label>Label</kbq-label>

            <ng-container *kbqInlineEditViewMode>
                <div class="layout-row layout-gap-xxs" style="flex-wrap: wrap;">
                    @if (control.value.length > 0) {
                        @for (badge of control.value; track badge) {
                            <kbq-badge>{{ badge }}</kbq-badge>
                        }
                    } @else {
                        <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                    }
                </div>
            </ng-container>
            <ng-container *kbqInlineEditEditMode>
                <kbq-form-field>
                    <kbq-select multiple multiline [placeholder]="placeholder" [formControl]="control">
                        @for (option of options; track option) {
                            <kbq-option [value]="option">{{ option }}</kbq-option>
                        }
                        <kbq-cleaner #kbqSelectCleaner />
                    </kbq-select>
                </kbq-form-field>
            </ng-container>
        </kbq-inline-edit>

        <kbq-inline-edit showActions [validationTooltip]="'Value required'" (saved)="update()">
            <kbq-label>Label</kbq-label>

            <ng-container *kbqInlineEditViewMode>
                <div style="flex-wrap: wrap;">
                    @if (displayValue().length > 0) {
                        {{ displayValue() }}
                    } @else {
                        <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                    }
                </div>
            </ng-container>
            <ng-container *kbqInlineEditEditMode>
                <kbq-form-field>
                    <textarea kbqTextarea placeholder="Placeholder" [formControl]="textareaControl"></textarea>
                </kbq-form-field>
            </ng-container>
        </kbq-inline-edit>
    `,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ],
    styles: `
        :host {
            .kbq-inline-edit {
                --kbq-inline-edit-pop-up-height: var(--kbq-size-xxl);
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditValidationExample {
    protected readonly placeholder = 'Placeholder';
    protected readonly options = Array.from({ length: 10 }).map((_, i) => `Option #${i}`);
    protected readonly control = new FormControl<string[]>([], {
        nonNullable: true,
        validators: [Validators.required]
    });
    protected readonly textareaControl = new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required]
    });

    protected readonly displayValue = signal(this.textareaControl.value);

    protected update(): void {
        this.displayValue.set(this.textareaControl.value);
    }
}
