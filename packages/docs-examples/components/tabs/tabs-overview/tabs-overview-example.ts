import { Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs overview
 */
@Component({
    standalone: true,
    selector: 'tabs-overview-example',
    templateUrl: 'tabs-overview-example.html',
    imports: [
        KbqTabsModule
    ]
})
export class TabsOverviewExample {}
