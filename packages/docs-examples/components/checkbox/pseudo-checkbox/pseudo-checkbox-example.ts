import { Component, ViewEncapsulation } from '@angular/core';
import { KbqPseudoCheckboxModule } from '@koobiq/components/core';

/**
 * @title Pseudo checkbox
 */
@Component({
    standalone: true,
    selector: 'pseudo-checkbox-example',
    styleUrl: 'pseudo-checkbox-example.css',
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqPseudoCheckboxModule
    ],
    template: `
        <div class="kbq-body">
            <kbq-pseudo-checkbox />
            <kbq-pseudo-checkbox [state]="'indeterminate'" />
            <kbq-pseudo-checkbox [state]="'checked'" />
        </div>
    `
})
export class PseudoCheckboxExample {}
