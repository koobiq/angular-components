import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs underlined
 */
@Component({
    selector: 'tabs-underlined-example',
    imports: [KbqTabsModule, KbqIconModule],
    template: `
        <kbq-tab-group class="layout-margin-bottom-l" underlined>
            @for (tab of tabs; track tab) {
                <kbq-tab [label]="tab" />
            }
        </kbq-tab-group>

        <kbq-tab-group class="layout-margin-bottom-l" underlined>
            @for (tab of tabs; track tab) {
                <kbq-tab>
                    <ng-template kbqTabLabel>
                        <i kbq-icon="kbq-bug_16"></i>
                        {{ tab }}
                    </ng-template>
                </kbq-tab>
            }
        </kbq-tab-group>

        <kbq-tab-group underlined>
            @for (tab of tabs; track tab) {
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
    readonly tabs = ['BruteForce', 'Complex Attack', 'DDoS', 'HIPS alert'];
}
