import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';

/**
 * @title split-button
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'split-button-overview-example',
    imports: [
        KbqSplitButtonModule
    ],
    template: `
        <kbq-split-button />
    `
})
export class SplitButtonOverviewExample {}
