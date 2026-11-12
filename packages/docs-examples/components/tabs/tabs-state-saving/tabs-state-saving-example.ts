import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqTabGroup, KbqTabsModule } from '@koobiq/components/tabs';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
                    <ng-template kbq-tab-label>{{ text().delivery }}</ng-template>
                    {{ text().tabContent }}
                </kbq-tab>
                <kbq-tab tabId="payment">
                    <ng-template kbq-tab-label>{{ text().payment }}</ng-template>
                    {{ text().tabContent }}
                </kbq-tab>
                <kbq-tab tabId="refund">
                    <ng-template kbq-tab-label>{{ text().refund }}</ng-template>
                    {{ text().tabContent }}
                </kbq-tab>
            </kbq-tab-group>

            <button kbq-button class="layout-margin-top-l" type="button" (click)="group().clearSavedState()">
                Reset saved state
            </button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsStateSavingExample extends BaseLocalizedExample<ExampleText> {
    protected readonly group = viewChild.required(KbqTabGroup);

    constructor() {
        super(TEXT);
    }
}
