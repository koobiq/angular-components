import { FocusTrapInertStrategy } from '@angular/cdk/a11y';

// Need replace EventListenerFocusTrapInertStrategy to EmptyFocusTrapStrategy for focus work correctly with open popover
export class EmptyFocusTrapStrategy implements FocusTrapInertStrategy {
    preventFocus(): void {}
    allowFocus(): void {}
}
