import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Tooltip relative to pointer
 */
@Component({
    selector: 'tooltip-relative-to-pointer-example',
    imports: [
        KbqButtonModule,
        KbqToolTipModule
    ],
    template: `
        <button kbq-button kbqTooltip="relativeToPointer" [kbqRelativeToPointer]="true">
            Button with a tooltip positioned relative to the cursor
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipRelativeToPointerExample {}
