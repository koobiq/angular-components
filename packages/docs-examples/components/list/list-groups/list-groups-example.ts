import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqListModule } from '@koobiq/components/list';
import { injectLocalizedText } from '@koobiq/docs-examples/i18n';
import { TEXT } from './l10n';

/**
 * @title List groups
 */
@Component({
    selector: 'list-groups-example',
    imports: [KbqListModule],
    template: `
        <kbq-list-selection [attr.aria-label]="text().securityControls">
            @for (category of securityCategories(); track category) {
                <kbq-optgroup [disabled]="category.disabled" [label]="category.categoryName">
                    @for (securityItem of category.securityItems; track securityItem.id) {
                        <kbq-list-option [value]="securityItem.id">
                            {{ securityItem.displayName }}
                        </kbq-list-option>
                    }
                </kbq-optgroup>
            }
            <kbq-list-option [value]="'rbac-11'">Role-Based Access Control (RBAC)</kbq-list-option>
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListGroupsExample {
    protected readonly text = injectLocalizedText(TEXT);

    private readonly groupsText = injectLocalizedText(TEXT);

    readonly securityCategories = computed(() => this.groupsText().categories);
}
