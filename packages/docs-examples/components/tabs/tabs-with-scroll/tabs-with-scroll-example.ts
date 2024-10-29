import { Component } from '@angular/core';
import { KbqTabsModule } from '@koobiq/components/tabs';

/**
 * @title Tabs with scroll
 */
@Component({
    standalone: true,
    selector: 'tabs-with-scroll-example',
    templateUrl: 'tabs-with-scroll-example.html',
    imports: [
        KbqTabsModule
    ]
})
export class TabsWithScrollExample {}
