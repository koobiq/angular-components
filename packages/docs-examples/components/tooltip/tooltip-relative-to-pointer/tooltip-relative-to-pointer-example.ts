import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip relative to pointer
 */
@Component({
    standalone: true,
    selector: 'tooltip-relative-to-pointer-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <button
            [kbqRelativeToPointer]="true"
            kbq-button
            kbqTooltip="relativeToPointer"
        >
            Button with a tooltip positioned relative to the cursor
        </button>
    `
})
export class TooltipRelativeToPointerExample {}
