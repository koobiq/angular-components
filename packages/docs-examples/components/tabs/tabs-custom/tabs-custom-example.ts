import { Component } from '@angular/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs custom
 */
@Component({
    standalone: true,
    selector: 'tabs-custom-example',
    styleUrl: 'tabs-custom-example.css',
    imports: [
        KbqTabsModule,
        KbqIcon
    ],
    template: `
        <div class="tabs-custom-example">
            <kbq-tab-group underlined>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-apple_24"></i>
                        <div>macOS</div>
                        <div class="tabs-custom-example__subtitle">14.5+</div>
                    </ng-template>
                </kbq-tab>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-windows_24"></i>
                        <div>Windows</div>
                        <div class="tabs-custom-example__subtitle">XP+</div>
                    </ng-template>
                </kbq-tab>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-linux_24"></i>
                        <div>Linux</div>
                        <div class="tabs-custom-example__subtitle">Ununtu 10+</div>
                    </ng-template>
                </kbq-tab>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i kbq-icon="kbq-bsd_24"></i>
                        <div>FreeBSD</div>
                        <div class="tabs-custom-example__subtitle">14.1+</div>
                    </ng-template>
                </kbq-tab>
            </kbq-tab-group>
        </div>
    `
})
export class TabsCustomExample {}
