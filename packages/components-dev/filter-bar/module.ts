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
                    name: 'pipe 1',
                    value: '1',
                    type: KbqPipeTypes.Select,
                    readonly: false,
                    empty: false,
                    disabled: false,
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
            name: 'name 1',
            type: KbqPipeTypes.Select,
            values: ['select element 1', 'select element 2', 'select element 3', 'select element 4'],
            readonly: false,
            empty: false,
            disabled: false,
            changed: false,
            multiple: false
        },
        {
            name: 'name 2',
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
            values: ['multiSelect element 1', 'multiSelect element 2', 'multiSelect element 3'],
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
