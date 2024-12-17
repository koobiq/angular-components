import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFilter, KbqFilterBarModule, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    filters: KbqFilter[] = [
        {
            name: 'Filter 0',
            readonly: false,
            disabled: false,
            changed: false,
            unsaved: false,
            pipes: [
                {
                    name: 'readonly',
                    value: '1',
                    type: KbqPipeTypes.Select,
                    readonly: true,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'empty',
                    value: '1',
                    type: KbqPipeTypes.Select,
                    readonly: false,
                    empty: true,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'disabled',
                    value: '1',
                    type: KbqPipeTypes.Select,
                    readonly: false,
                    empty: false,
                    disabled: true,
                    changed: false,
                    multiple: false
                }
            ]
        },
        {
            name: 'Filter 1',
            readonly: false,
            disabled: false,
            changed: false,
            unsaved: true,
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: KbqPipeTypes.Text,
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'pipe 3',
                    value: '3',
                    type: KbqPipeTypes.MultiSelect,
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'pipe 4',
                    value: '3',
                    type: KbqPipeTypes.TreeSelect,
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'pipe 5',
                    value: '3',
                    type: KbqPipeTypes.MultiTreeSelect,
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                }
            ]
        },
        {
            name: 'Filter 2',
            readonly: false,
            disabled: false,
            changed: true,
            unsaved: false,
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: KbqPipeTypes.Text,
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'pipe 3',
                    value: '3',
                    type: KbqPipeTypes.MultiSelect,
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                }
            ]
        }
    ];
    activeFilter: KbqFilter | null = this.filters[0];
    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Вердикт',
            type: KbqPipeTypes.Select,
            values: [
                { name: 'Не определен', value: '1' },
                { name: 'Легитимное действие', value: '2' },
                { name: 'Ложный', value: '3' },
                { name: 'Подтвержден', value: '4' }
            ],
            readonly: false,
            empty: true,
            disabled: false,
            changed: false,
            multiple: false
        },
        {
            name: 'Автор',
            type: KbqPipeTypes.Text,
            values: [],
            readonly: false,
            empty: false,
            disabled: false,
            changed: false,
            multiple: false
        },
        {
            name: 'name 3',
            type: KbqPipeTypes.MultiSelect,
            values: [
                { name: 'multiSelect element 1', value: '1' },
                { name: 'multiSelect element 2', value: '2' },
                { name: 'multiSelect element 3', value: '3' },
                { name: 'multiSelect element 4', value: '4' }
            ],
            readonly: false,
            empty: false,
            disabled: false,
            changed: false,
            multiple: false
        }
    ];

    onAddPipe(pipe) {
        if (this.activeFilter) {
            this.activeFilter = { ...this.activeFilter, pipes: [...this.activeFilter!.pipes, pipe] };
        }
        console.log('onAddPipe: ', pipe);
    }

    onSelectFilter(filter: KbqFilter) {
        this.activeFilter = filter;
    }

    resetActiveFilter(resetedFilter: KbqFilter | null) {
        this.activeFilter = this.filters.find((filter) => filter.name === resetedFilter?.name) || null;
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqIconModule,
        KbqFilterBarModule,
        KbqDividerModule,
        KbqButtonModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
