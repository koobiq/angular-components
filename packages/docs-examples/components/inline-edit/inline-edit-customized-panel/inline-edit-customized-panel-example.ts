import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Inline edit customized panel
 */
@Component({
    selector: 'inline-edit-customized-panel-example',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqBadgeModule
    ],
    template: `
        <kbq-inline-edit showActions overlayPanelClass="example-custom-inline-edit-panel" (saved)="update()">
            <kbq-label>Label</kbq-label>

            <div class="layout-row layout-gap-xxs" style="flex-wrap: wrap;" kbqInlineEditViewMode>
                @for (badge of displayValue(); track badge) {
                    <kbq-badge>{{ badge }}</kbq-badge>
                } @empty {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <kbq-select multiple [placeholder]="placeholder" [(ngModel)]="value">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                    <kbq-cleaner #kbqSelectCleaner />
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>
    `,
    styles: `
        ::ng-deep .example-custom-inline-edit-panel {
            width: 150px !important;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ],
    host: {
        class: 'layout-flex layout-column layout-gap-m'
    }
})
export class InlineEditCustomizedPanelExample {
    protected readonly placeholder = 'Placeholder';
    protected readonly options = Array.from({ length: 10 }).map((_, i) => `Option #${i}`);
    protected value: string[] = [this.options[0]];
    protected readonly displayValue = signal(this.value);

    protected update(): void {
        this.displayValue.set(this.value);
    }
}
