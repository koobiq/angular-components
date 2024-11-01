import { Component } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';

/**
 * @title Divider
 */
@Component({
    standalone: true,
    selector: 'divider-overview-example',
    imports: [
        KbqDividerModule
    ],
    template: `
        <kbq-divider style="margin: 20px" />
    `
})
export class DividerOverviewExample {}
