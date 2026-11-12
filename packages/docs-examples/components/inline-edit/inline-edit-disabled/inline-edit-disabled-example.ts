import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconButton } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Inline edit disabled
 */
@Component({
    selector: 'inline-edit-disabled-example',
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqInputModule,
        KbqIconButton,
        KbqButtonModule,
        KbqDropdownModule
    ],
    template: `
        <kbq-dropdown #dropdown="kbqDropdown">
            <button kbq-dropdown-item (click)="clipboard.copy(value)">Copy text</button>
        </kbq-dropdown>

        <kbq-inline-edit disabled>
            <i
                kbqInlineEditMenu
                kbq-icon-button="kbq-ellipsis-vertical_16"
                [kbqDropdownTriggerFor]="dropdown"
                [color]="'contrast-fade'"
            ></i>
            <div kbqInlineEditViewMode>
                @if (value) {
                    <span>{{ value }}</span>
                } @else {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [placeholder]="placeholder" [(ngModel)]="value" />
            </kbq-form-field>
        </kbq-inline-edit>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditDisabledExample extends BaseLocalizedExample<ExampleTranslation> {
    protected readonly clipboard = inject(Clipboard);
    protected get placeholder(): string {
        return this.t().placeholder;
    }
    protected value =
        'Multi-factor authentication involves multiple identification forms before account access, reducing the risk of unauthorized access';

    constructor() {
        super(TRANSLATIONS);
    }
}
