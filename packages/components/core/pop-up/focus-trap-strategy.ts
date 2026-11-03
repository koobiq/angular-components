import { FocusTrapInertStrategy } from '@angular/cdk/a11y';

/**
 * Replaces `EventListenerFocusTrapInertStrategy`, so that focus works correctly while a popover is open.
 *
 * @docs-private
 */
export class EmptyFocusTrapStrategy implements FocusTrapInertStrategy {
    preventFocus(): void {}
    allowFocus(): void {}
}
