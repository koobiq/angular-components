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
        <ng-container class="ssss" *kbq-pipe="emptyRemovable" />
        <ng-container *kbq-pipe="emptyRemovable" />
        <ng-container *kbq-pipe="emptyRemovable" />
        <ng-container *kbq-pipe="emptyRemovable" />
        <ng-container *kbq-pipe="emptyRemovable" />
    `,
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: {
                name: 'Filter',
                type: KbqPipeTypes.Text,

                required: false,
                cleanable: false,
                removable: false,
                disabled: false
            }
        }
    ]
})
export class FilterBarEmptyRemovableExample {}
