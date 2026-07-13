import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';
import { KbqSearchExpandableModule } from '@koobiq/components/search-expandable';

/**
 * @title filter-bar-search-placement
 */
@Component({
    selector: 'filter-bar-search-placement-example',
    imports: [
        KbqButtonToggleModule,
        KbqFilterBarModule,
        KbqSearchExpandableModule,
        FormsModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-button-toggle-group
            class="layout-margin-bottom-l"
            [ngModel]="searchPlacement()"
            (ngModelChange)="searchPlacement.set($event)"
        >
            <kbq-button-toggle value="start">Leading (start)</kbq-button-toggle>
            <kbq-button-toggle value="end">Trailing (end)</kbq-button-toggle>
        </kbq-button-toggle-group>

        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [searchPlacement]="searchPlacement()">
            <kbq-pipe-add />

            <kbq-search-expandable [formControl]="searchControl" />
        </kbq-filter-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarSearchPlacementExample {
    /** Controls where the search sits inside the bar. */
    readonly searchPlacement = signal<'start' | 'end'>('end');

    readonly searchControl = new FormControl('');

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Select',
            type: KbqPipeTypes.Select,
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' }
            ],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Text',
            type: KbqPipeTypes.Text,
            cleanable: false,
            removable: true,
            disabled: false
        }
    ];
}
