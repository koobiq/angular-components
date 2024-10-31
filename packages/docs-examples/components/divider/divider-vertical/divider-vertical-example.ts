import { Component } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';

/**
 * @title Divider vertical
 */
@Component({
    standalone: true,
    selector: 'divider-vertical-example',
    imports: [
        KbqDividerModule
    ],
    template: `
        <div
            class="docs-divider-container"
            style="margin: 20px; height: 50px"
        >
            <kbq-divider [vertical]="true" />
        </div>
    `
})
export class DividerVerticalExample {}
