import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';

/**
 * @title Divider
 */
@Component({
    selector: 'divider-overview-example',
    imports: [
        KbqDividerModule
    ],
    template: `
        <kbq-divider style="margin: 20px" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DividerOverviewExample {}
