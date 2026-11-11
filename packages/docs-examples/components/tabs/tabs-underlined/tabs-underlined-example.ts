import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { injectExampleText } from '../l10n';

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
export class TabsUnderlinedExample {
    protected readonly text = injectExampleText();

    readonly tabs = computed(() => [
        this.text().bruteforce,
        this.text().complexAttack,
        this.text().ddos,
        this.text().hipsAlert
    ]);
}
