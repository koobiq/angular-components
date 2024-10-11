import { Directive, inject } from '@angular/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';

@Directive({
    standalone: true,
    selector: `[kbq-button][kbqDropdownTriggerFor]`,
    host: {
        '[class.kbq-active]': 'dropdownTrigger.opened'
    }
})
export class KbqButtonDropdownTrigger {
    dropdownTrigger = inject(KbqDropdownTrigger);
}
