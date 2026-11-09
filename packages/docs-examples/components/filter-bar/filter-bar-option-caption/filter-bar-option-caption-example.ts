import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import {
    type KbqFilter,
    KbqFilterBarModule,
    type KbqPipeTemplate,
    KbqPipeTypes,
    type KbqSelectValue,
    type KbqTreeSelectNode
} from '@koobiq/components/filter-bar';

const EVENTS: KbqSelectValue[] = [
    { name: 'Event: Action', id: 'action', value: 'action', caption: 'action' },
    {
        name: 'Warning: additional information about the event that is far too long to be shown on a single line of the dropdown panel',
        id: 'warning',
        value: 'warning',
        caption:
            'A caption long enough to need a second line of its own once the panel stops growing, so it demonstrates wrapping when the available width of the dropdown panel is exceeded'
    },
    { name: 'Event: Threat type', id: 'threat', value: 'threat', caption: 'category.generic' },
    { name: 'Event: Source', id: 'source', value: 'source', caption: 'event.source' }
];

const TREE_EVENTS: KbqTreeSelectNode[] = [
    {
        name: 'Event fields',
        value: 'event',
        caption: 'event',
        children: [
            { name: 'Event: Action', value: 'action', caption: 'action', children: null },
            { name: 'Event: Threat type', value: 'threat', caption: 'category.generic', children: null },
            { name: 'Event: Source', value: 'source', caption: 'event.source', children: null }
        ]
    }
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
        <kbq-filter-bar [pipeTemplates]="pipeTemplates()" [(filter)]="activeFilter">
            @for (pipe of activeFilter.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarOptionCaptionExample {
    activeFilter: KbqFilter = this.getDefaultFilter();

    readonly pipeTemplates = computed<KbqPipeTemplate[]>(() => [
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
            search: true,
            multilineOptions: true,

            cleanable: true,
            removable: false,
            disabled: false
        },
        {
            name: 'Tree',
            id: 'Tree',
            type: KbqPipeTypes.TreeSelect,
            values: TREE_EVENTS,
            search: true,
            multilineOptions: true,

            cleanable: true,
            removable: false,
            disabled: false
        },
        {
            name: 'Multi tree',
            id: 'MultiTree',
            type: KbqPipeTypes.MultiTreeSelect,
            values: TREE_EVENTS,
            search: true,
            multilineOptions: true,

            cleanable: true,
            removable: false,
            disabled: false
        }
    ]);

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
                    search: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Tree',
                    id: 'Tree',
                    type: KbqPipeTypes.TreeSelect,
                    search: true,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'Multi tree',
                    id: 'MultiTree',
                    type: KbqPipeTypes.MultiTreeSelect,
                    value: null,
                    search: true,

                    cleanable: true,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }
}
