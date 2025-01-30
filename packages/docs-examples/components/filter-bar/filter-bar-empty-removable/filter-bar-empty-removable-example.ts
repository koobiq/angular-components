import { Component } from '@angular/core';
import { KbqBasePipe, KbqFilterBarModule, KbqPipeTypes } from '@koobiq/components/filter-bar';

/**
 * @title filter-bar-empty-removable
 */
@Component({
    standalone: true,
    selector: 'filter-bar-empty-removable-example',
    imports: [
        KbqFilterBarModule
    ],
    template: `
        <ng-container *kbq-pipe="emptyRemovable" />
    `,
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ]
})
export class FilterBarEmptyRemovableExample {
    base = {
        name: 'Filter',
        type: KbqPipeTypes.Text,

        required: false,
        cleanable: false,
        removable: false,
        disabled: false
    };

    emptyRemovable = { ...this.base, cleanable: true };
}
