import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqClampedText } from '@koobiq/components/clamped-text';

/**
 * @title Clamped-text overview
 */
@Component({
    selector: 'clamped-text-overview-example',
    standalone: true,
    imports: [KbqClampedText],
    template: `
        <kbq-clamped-text />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClampedTextOverviewExample {}
