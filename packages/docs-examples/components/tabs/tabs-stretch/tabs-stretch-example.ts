import { Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs stretch
 */
@Component({
    standalone: true,
    selector: 'tabs-stretch-example',
    templateUrl: 'tabs-stretch-example.html',
    imports: [
        KbqTabsModule
    ]
})
export class TabsStretchExample {}
