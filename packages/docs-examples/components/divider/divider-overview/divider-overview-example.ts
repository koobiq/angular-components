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
        <div
            class="docs-divider-container"
            style="margin: 20px"
        >
            <kbq-divider />
        </div>
    `
})
export class DividerOverviewExample {}
