import { Component, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs underlined
 */
@Component({
    standalone: true,
    selector: 'tabs-underlined-example',
    styleUrls: ['tabs-underlined-example.css'],
    imports: [
        KbqTabsModule,
        KbqIconModule
    ],
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="tabs-underlined-example">
            <kbq-tab-group underlined>
                <kbq-tab [label]="'Bruteforce'" />
                <kbq-tab [label]="'Complex Attack'" />
                <kbq-tab [label]="'DDoS'" />
                <kbq-tab [label]="'DoS'" />
            </kbq-tab-group>

            <kbq-tab-group underlined>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        Spam Attack
                    </ng-template>
                </kbq-tab>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        Miscellaneous
                    </ng-template>
                </kbq-tab>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        DDoS
                    </ng-template>
                </kbq-tab>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                        IDS/IPS Alert
                    </ng-template>
                </kbq-tab>
            </kbq-tab-group>

            <kbq-tab-group underlined>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                    </ng-template>
                </kbq-tab>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                    </ng-template>
                </kbq-tab>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                    </ng-template>
                </kbq-tab>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bug_16"></i>
                    </ng-template>
                </kbq-tab>
            </kbq-tab-group>
        </div>
    `
})
export class TabsUnderlinedExample {}
