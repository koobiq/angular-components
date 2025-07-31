import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';

/**
 * @title Divider vertical
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'divider-vertical-example',
    imports: [
        KbqDividerModule
    ],
    template: `
        <kbq-divider style="margin: 20px; height: 50px" [vertical]="true" />
    `
})
export class DividerVerticalExample {}
