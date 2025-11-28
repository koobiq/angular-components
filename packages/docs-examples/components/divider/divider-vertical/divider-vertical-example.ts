import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';

/**
 * @title Divider vertical
 */
@Component({
    selector: 'divider-vertical-example',
    imports: [
        KbqDividerModule
    ],
    template: `
        <kbq-divider style="margin: 20px; height: 50px" [vertical]="true" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DividerVerticalExample {}
