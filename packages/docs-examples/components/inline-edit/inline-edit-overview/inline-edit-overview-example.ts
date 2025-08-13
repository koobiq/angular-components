import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqInlineEdit } from '@koobiq/components/inline-edit';

/**
 * @title Inline edit overview
 */
@Component({
    standalone: true,
    imports: [KbqInlineEdit],
    selector: 'inline-edit-overview-example',
    template: `
        <kbq-inline-edit />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditOverviewExample {}
