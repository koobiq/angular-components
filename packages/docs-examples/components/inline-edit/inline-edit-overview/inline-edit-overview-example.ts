import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqCleaner, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Inline edit overview
 */
@Component({
    selector: 'inline-edit-overview-example',
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqCleaner,
        KbqBadgeModule,
        KbqIconModule
    ],
    template: `
        <kbq-inline-edit showActions (saved)="update()">
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ]
})
export class InlineEditOverviewExample {
    protected readonly placeholder = 'Placeholder';
    protected readonly options = Array.from({ length: 10 }).map((_, i) => `Option #${i}`);
    protected value: string[] = [this.options[0]];
    protected readonly displayValue = signal(this.value);

    protected update(): void {
        this.displayValue.set(this.value);
    }
}
