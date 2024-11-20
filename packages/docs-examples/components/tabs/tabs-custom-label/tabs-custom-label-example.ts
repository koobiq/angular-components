import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs custom label
 */
@Component({
    standalone: true,
    selector: 'tabs-custom-label-example',
    styleUrls: ['tabs-custom-label-example.css'],
    imports: [
        KbqTabsModule,
        KbqIconModule
    ],
    template: `
        <div class="tabs-custom-label-example">
            <kbq-tab-group underlined>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i
                            class="tabs-custom-label-example__icon"
                            kbq-icon="kbq-apple_24"
                        ></i>
                        <div>macOS</div>
                        <div class="tabs-custom-label-example__subtitle">14.5+</div>
                    </ng-template>
                </kbq-tab>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i
                            class="tabs-custom-label-example__icon"
                            kbq-icon="kbq-windows_24"
                        ></i>
                        <div>Windows</div>
                        <div class="tabs-custom-label-example__subtitle">XP+</div>
                    </ng-template>
                </kbq-tab>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i
                            class="tabs-custom-label-example__icon"
                            kbq-icon="kbq-linux_24"
                        ></i>
                        <div>Linux</div>
                        <div class="tabs-custom-label-example__subtitle">Ubuntu 10+</div>
                    </ng-template>
                </kbq-tab>
                <kbq-tab>
                    <ng-template kbq-tab-label>
                        <i
                            class="tabs-custom-label-example__icon"
                            kbq-icon="kbq-bsd_24"
                        ></i>
                        <div>FreeBSD</div>
                        <div class="tabs-custom-label-example__subtitle">14.1+</div>
                    </ng-template>
                </kbq-tab>
            </kbq-tab-group>
        </div>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsCustomLabelExample {}
