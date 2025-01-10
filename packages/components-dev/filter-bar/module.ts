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
            name: 'Select',
            readonly: false,
            disabled: false,
            changed: false,
            unsaved: false,
            pipes: [
                {
                    name: 'required',
                    // required - не может быть пустым, всегда есть дефолтное значение
                    value: { name: 'Не определен', value: '1' },
                    type: KbqPipeTypes.Select,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: { name: 'Не определен', value: '1' },
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Не определен', value: '1' },
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Не определен', value: '1' },
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'MultiSelect',
            readonly: false,
            disabled: false,
            changed: false,
            unsaved: false,
            pipes: [
                {
                    name: 'required',
                    value: [
                        { name: 'Не определен', value: '1' },
                        { name: 'Легитимное действие', value: '2' }
                    ],
                    type: KbqPipeTypes.MultiSelect,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'required',
                    value: [{ name: 'Не определен', value: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: [{ name: 'Не определен', value: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: [{ name: 'Не определен', value: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: [{ name: 'Не определен', value: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'TreeSelect',
            readonly: false,
            disabled: false,
            changed: false,
            unsaved: false,
            pipes: [
                {
                    name: 'required',
                    // required - не может быть пустым, всегда есть дефолтное значение
                    value: 'Pictures',
                    type: KbqPipeTypes.TreeSelect,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.TreeSelect,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: { name: 'Не определен', value: '1' },
                    type: KbqPipeTypes.TreeSelect,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Не определен', value: '1' },
                    type: KbqPipeTypes.TreeSelect,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Не определен', value: '1' },
                    type: KbqPipeTypes.TreeSelect,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'MultiSelect',
            readonly: false,
            disabled: false,
            changed: false,
            unsaved: false,
            pipes: [
                {
                    name: 'required',
                    value: [
                        { name: 'Не определен', value: '1' },
                        { name: 'Легитимное действие', value: '2' }
                    ],
                    type: KbqPipeTypes.MultiTreeSelect,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'required',
                    value: [{ name: 'Не определен', value: '1' }],
                    type: KbqPipeTypes.MultiTreeSelect,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.MultiTreeSelect,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: [{ name: 'Не определен', value: '1' }],
                    type: KbqPipeTypes.MultiTreeSelect,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: [{ name: 'Не определен', value: '1' }],
                    type: KbqPipeTypes.MultiTreeSelect,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: [{ name: 'Не определен', value: '1' }],
                    type: KbqPipeTypes.MultiTreeSelect,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'Text',
            readonly: false,
            disabled: false,
            changed: false,
            unsaved: false,
            pipes: [
                {
                    name: 'required',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'required',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.Text,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'Date',
            readonly: false,
            disabled: false,
            changed: false,
            unsaved: false,
            pipes: [
                {
                    name: 'required',
                    value: 'value',
                    type: KbqPipeTypes.Date,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'required',
                    value: 'value',
                    type: KbqPipeTypes.Date,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.Date,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: 'value',
                    type: KbqPipeTypes.Date,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: 'value',
                    type: KbqPipeTypes.Date,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: 'value',
                    type: KbqPipeTypes.Date,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: true
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

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: '3',
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 4',
                    value: '3',
                    type: KbqPipeTypes.TreeSelect,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 5',
                    value: '3',
                    type: KbqPipeTypes.MultiTreeSelect,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
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

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: '3',
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        }
    ];
    activeFilter: KbqFilter | null = this.filters[5];
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

            required: false,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'Автор',
            type: KbqPipeTypes.Text,
            values: [],

            required: false,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'name 3',
            type: KbqPipeTypes.MultiSelect,
            values: [
                { name: 'Не определен', value: '1' },
                { name: 'Легитимное действие', value: '2' },
                { name: 'Ложный', value: '3' },
                { name: 'Подтвержден', value: '4' }
            ],

            required: false,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'name 3',
            type: KbqPipeTypes.TreeSelect,
            values: {
                rootNode_1: 'app',
                Pictures: {
                    Sun: 'png',
                    Woods: 'jpg',
                    PhotoBoothLibrary: {
                        Contents: 'dir',
                        Pictures_2: 'dir'
                    }
                },
                Documents: {
                    Pictures_3: 'Pictures',
                    angular: {
                        src1: {
                            core: 'ts',
                            compiler: 'ts'
                        }
                    },
                    material2: {
                        src2: {
                            button: 'ts',
                            checkbox: 'ts',
                            input: 'ts'
                        }
                    }
                },
                Downloads: {
                    Tutorial: 'html',
                    November: 'pdf',
                    October: 'pdf'
                },
                Applications: {
                    Chrome: 'app',
                    Calendar: 'app',
                    Webstorm: 'app'
                },
                rootNode_1_long_text_long_long_text_long_long_text_long_long_text_long_text_: 'app'
            },
            required: false,
            cleanable: false,
            removable: false,
            disabled: false
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
