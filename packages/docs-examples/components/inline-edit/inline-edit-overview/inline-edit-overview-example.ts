import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqCleaner } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqSelectModule } from '@koobiq/components/select';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Inline edit overview
 */
@Component({
    selector: 'inline-edit-overview-example',
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqSelectModule,
        KbqCleaner,
        KbqBadgeModule,
        KbqIconModule
    ],
    template: `
        <kbq-inline-edit showActions (saved)="update()">
            <kbq-label>{{ t().label }}</kbq-label>

            <div class="layout-row layout-gap-xxs" style="flex-wrap: wrap;" kbqInlineEditViewMode>
                @for (badge of displayValue(); track badge) {
                    <kbq-badge>{{ badge }}</kbq-badge>
                } @empty {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <kbq-select multiple [placeholder]="placeholder" [(ngModel)]="value">
                    @for (option of options(); track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                    <kbq-cleaner />
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    protected get placeholder(): string {
        return this.t().placeholder;
    }
    protected readonly options = computed(() => Array.from({ length: 10 }, (_, i) => 'Option #' + i));
    protected value: string[] = [this.options()[0]];
    protected readonly displayValue = signal(this.value);

    protected update(): void {
        this.displayValue.set(this.value);
    }

    constructor() {
        super(TRANSLATIONS);
    }
}
