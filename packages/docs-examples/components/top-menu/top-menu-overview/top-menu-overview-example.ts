import { Component } from '@angular/core';
import { KbqTopMenuModule } from 'packages/components/top-menu';

/**
 * @title TopMenu
 */
@Component({
    standalone: true,
    selector: 'top-menu-overview-example',
    imports: [
        KbqTopMenuModule
    ],
    template: `
        <kbq-top-menu />
    `
})
export class TopMenuOverviewExample {}
