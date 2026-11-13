import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqTabGroup, KbqTabsModule } from '@koobiq/components/tabs';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Tabs state saving
 */
@Component({
    selector: 'tabs-state-saving-example',
    imports: [KbqTabsModule, KbqButtonModule],
    template: `
        <div class="layout-column layout-align-center-center docs-example-vertical-margin">
            <kbq-tab-group stateSavingKey="tabs-state-saving-example" style="width: 100%">
                <!-- A tabId is what makes the selection survive the tabs being reordered. -->
                <kbq-tab tabId="delivery">
                    <ng-template kbq-tab-label>{{ t().delivery }}</ng-template>
                    {{ t().tabContent }}
                </kbq-tab>
                <kbq-tab tabId="payment">
                    <ng-template kbq-tab-label>{{ t().payment }}</ng-template>
                    {{ t().tabContent }}
                </kbq-tab>
                <kbq-tab tabId="refund">
                    <ng-template kbq-tab-label>{{ t().refund }}</ng-template>
                    {{ t().tabContent }}
                </kbq-tab>
            </kbq-tab-group>

            <button kbq-button class="layout-margin-top-l" type="button" (click)="group().clearSavedState()">
                Reset saved state
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsStateSavingExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly group = viewChild.required(KbqTabGroup);
}
