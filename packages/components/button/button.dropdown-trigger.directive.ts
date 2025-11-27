import { Directive, inject } from '@angular/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';

/**
 * This directive enhances `kbq-button` elements acting as dropdown triggers,
 * visually indicating the active state with the `kbq-active` class,
 * following Koobiq Design System.
 *
 * The directive relies on a separate `KbqDropdownTrigger` directive to get dropdown's state.
 */
@Directive({
    selector: `[kbq-button][kbqDropdownTriggerFor]`,
    host: {
        '[class.kbq-active]': 'dropdownTrigger.opened'
    }
})
export class KbqButtonDropdownTrigger {
    dropdownTrigger = inject(KbqDropdownTrigger);
}
