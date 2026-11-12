import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Tabs underlined
 */
@Component({
    selector: 'tabs-underlined-example',
    imports: [KbqTabsModule, KbqIconModule],
    template: `
        <kbq-tab-group class="layout-margin-bottom-l" underlined>
            @for (tab of tabs(); track tab) {
                <kbq-tab [label]="tab" />
            }
        </kbq-tab-group>

        <kbq-tab-group class="layout-margin-bottom-l" underlined>
            @for (tab of tabs(); track tab) {
                <kbq-tab>
                    <ng-template kbqTabLabel>
                        <i kbq-icon="kbq-bug_16"></i>
                        {{ tab }}
                    </ng-template>
                </kbq-tab>
            }
        </kbq-tab-group>

        <kbq-tab-group underlined>
            @for (tab of tabs(); track tab) {
                <kbq-tab>
                    <ng-template kbqTabLabel iconOnly>
                        <i kbq-icon="kbq-bug_16"></i>
                    </ng-template>
                </kbq-tab>
            }
        </kbq-tab-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsUnderlinedExample extends BaseLocalizedExample<ExampleTranslation> {
    readonly tabs = computed(() => [
        this.t().bruteforce,
        this.t().complexAttack,
        this.t().ddos,
        this.t().hipsAlert
    ]);

    constructor() {
        super(TRANSLATIONS);
    }
}
