import { Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs disabled
 */
@Component({
    standalone: true,
    selector: 'tabs-disabled-example',
    styleUrl: 'tabs-disabled-example.css',
    templateUrl: 'tabs-disabled-example.html',
    imports: [
        KbqTabsModule
    ]
})
export class TabsDisabledExample {}
