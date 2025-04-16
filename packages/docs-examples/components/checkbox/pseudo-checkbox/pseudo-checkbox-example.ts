import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqPseudoCheckboxModule } from '@koobiq/components/core';

/**
 * @title Pseudo checkbox
 */
@Component({
    standalone: true,
    selector: 'pseudo-checkbox-example',
    imports: [
        KbqPseudoCheckboxModule
    ],
    template: `
        <div class="layout-column">
            <kbq-pseudo-checkbox />
            <kbq-pseudo-checkbox class="layout-margin-top-l" [state]="'indeterminate'" />
            <kbq-pseudo-checkbox class="layout-margin-top-l" [state]="'checked'" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PseudoCheckboxExample {}
