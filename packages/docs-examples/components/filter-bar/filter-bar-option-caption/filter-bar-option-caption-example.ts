import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KbqFilter,
    KbqFilterBarModule,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSelectValue
} from '@koobiq/components/filter-bar';

const EVENTS: KbqSelectValue[] = [
    { name: 'Event: Action', id: 'action', value: 'action', caption: 'action' },
    {
        // Long enough to reach the panel's maximum width, which is where the two modes start to differ:
        // below it the content-sized panel simply grows and nothing is wrapped or clipped.
        name: 'Warning: additional information about the event that is far too long to be shown on a single line of the dropdown panel',
        id: 'warning',
        value: 'warning',
        caption:
            'A caption long enough to need a second line of its own once the panel stops growing, so it demonstrates wrapping when the available width of the dropdown panel is exceeded'
    },
    { name: 'Event: Threat type', id: 'threat', value: 'threat', caption: 'category.generic' },
    { name: 'Event: Source', id: 'source', value: 'source', caption: 'event.source' }
];

/**
 * @title filter-bar-option-caption
 */
@Component({
    selector: 'filter-bar-option-caption-example',
    imports: [
        KbqFilterBarModule
    ],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [(filter)]="activeFilter">
            @for (pipe of activeFilter.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarOptionCaptionExample {
    activeFilter: KbqFilter = this.getDefaultFilter();

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Single line',
            id: 'SingleLine',
            type: KbqPipeTypes.MultiSelect,
            values: EVENTS,
            search: true,

            cleanable: true,
            removable: false,
            disabled: false
        },
        {
            name: 'Multiline',
            id: 'Multiline',
            type: KbqPipeTypes.MultiSelect,
            values: EVENTS,
            multilineOptions: true,
            search: true,

            cleanable: true,
            removable: false,
            disabled: false
        },
        {
            name: 'Select',
            id: 'Select',
            type: KbqPipeTypes.Select,
            values: EVENTS,
            multilineOptions: true,

            cleanable: true,
            removable: false,
            disabled: false
        }
    ];

    getDefaultFilter(): KbqFilter {
        return {
            name: '',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'Single line',
                    id: 'SingleLine',
                    type: KbqPipeTypes.MultiSelect,
                    value: null,
                    search: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Multiline',
                    id: 'Multiline',
                    type: KbqPipeTypes.MultiSelect,
                    value: null,
                    search: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Select',
                    id: 'Select',
                    type: KbqPipeTypes.Select,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }
}
