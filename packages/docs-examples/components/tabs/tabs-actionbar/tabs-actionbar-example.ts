import { Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs actionbar
 */
@Component({
    standalone: true,
    selector: 'tabs-actionbar-example',
    styleUrl: 'tabs-actionbar-example.css',
    imports: [
        KbqTabsModule,
        KbqButtonModule,
        KbqIcon
    ],
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="tabs-actionbar-example">
            <kbq-tab-group underlined>
                <kbq-tab [label]="'BitDefender'" />
                <kbq-tab [label]="'Fortinet'" />
                <kbq-tab [label]="'Kaspersky'" />
            </kbq-tab-group>
            <div class="tabs-actionbar-example__center"></div>
            <div class="tabs-actionbar-example__controls">
                <button
                    class="kbq-button_transparent"
                    [color]="'contrast'"
                    kbq-button
                >
                    <i
                        [color]="'theme'"
                        kbq-icon="kbq-list_16"
                    ></i>
                </button>
                <button
                    class="kbq-button_transparent"
                    [color]="'contrast'"
                    kbq-button
                >
                    <i
                        [color]="'theme'"
                        kbq-icon="kbq-filter_16"
                    ></i>
                </button>
                <button
                    [color]="'contrast'"
                    kbq-button
                >
                    <i kbq-icon="kbq-plus_16"></i>
                    Создать дашборд
                </button>
            </div>
        </div>
    `
})
export class TabsActionbarExample {}
