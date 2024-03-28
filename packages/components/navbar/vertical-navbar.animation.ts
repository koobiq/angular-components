import { animate, AnimationTriggerMetadata, style, transition, trigger, state } from '@angular/animations';
import {
    VerticalNavbarSizeStatesCollapsedWidth as closedWidth,
    VerticalNavbarSizeStatesExpandedWidth as openedWidth
} from '@koobiq/design-tokens/web';


export function toggleVerticalNavbarAnimation(): AnimationTriggerMetadata {
    return trigger('toggle', [
        state('0', style({ width: `var(--kbq-vertical-navbar-size-states-collapsed-width, ${closedWidth})` })),
        state('1',  style({ width: `var(--kbq-vertical-navbar-size-states-expanded-width, ${openedWidth})` })),
        transition('0 <=> 1', animate('200ms cubic-bezier(0, 1, 0.5, 1)'))
    ]);
}
