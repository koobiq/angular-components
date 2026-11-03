import { ChangeDetectionStrategy, Component, computed, TemplateRef, viewChild } from '@angular/core';
import { KbqHighlightModule } from '@koobiq/components/core';
import {
    KbqFilter,
    KbqFilterBarModule,
    KbqMultiTreeSelectValueTemplateContext,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqTreeSelectNode
} from '@koobiq/components/filter-bar';
import { KbqIcon } from '@koobiq/components/icon';
import { injectLocalizedText } from '../localized-data';

interface AgentStateNode extends Omit<KbqTreeSelectNode, 'children'> {
    children: AgentStateNode[] | null;
    icon?: string;
    color?: 'success' | 'error' | 'warning';
    count?: number;
}

/**
 * @title filter-bar-multi-tree-select-value-template
 */
@Component({
    selector: 'filter-bar-multi-tree-select-value-template-example',
    imports: [KbqFilterBarModule, KbqHighlightModule, KbqIcon],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates()" [(filter)]="activeFilter">
            @for (pipe of activeFilter.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>

        <ng-template #optionTemplate let-option="option" let-search="search">
            <div class="example-tree-node">
                @if (option.icon) {
                    <i
                        class="example-tree-node__icon"
                        aria-hidden="true"
                        [kbq-icon]="option.icon"
                        [color]="option.color"
                    ></i>
                }
                <span class="example-tree-node__name" [innerHTML]="option.name | kbqHighlightBackground: search"></span>
                @if (option.count !== undefined) {
                    <span class="example-tree-node__count">{{ option.count }}</span>
                }
            </div>
        </ng-template>
    `,
    styleUrls: ['filter-bar-multi-tree-select-value-template-example.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarMultiTreeSelectValueTemplateExample {
    private readonly text = injectLocalizedText({
        'ru-RU': {
            installed: 'Установлен',
            error: 'Ошибка',
            incompatible: 'Операционная система активного узла несовместима с текущей версией агента',
            unknown: 'Ошибки неопределенного характера'
        },
        default: {
            installed: 'Installed',
            error: 'Error',
            incompatible: 'The active node operating system is incompatible with the current agent version',
            unknown: 'Unspecified errors'
        }
    });

    private readonly values = computed<AgentStateNode[]>(() => {
        const text = this.text();

        return [
            {
                name: text.installed,
                value: 'installed',
                icon: 'kbq-check_16',
                color: 'success',
                children: [
                    { name: '4.3.0.269', value: '4.3.0.269', count: 0, children: null },
                    { name: '5.0.0.0', value: '5.0.0.0', count: 210, children: null }
                ]
            },
            {
                name: text.error,
                value: 'error',
                icon: 'kbq-triangle-exclamation_16',
                color: 'error',
                children: [
                    { name: text.incompatible, value: 'incompatible-os', count: 789, children: null },
                    { name: text.unknown, value: 'unknown-error', count: 12345, children: null }
                ]
            }
        ];
    });

    readonly optionTemplate =
        viewChild<TemplateRef<KbqMultiTreeSelectValueTemplateContext<AgentStateNode>>>('optionTemplate');

    readonly pipeTemplates = computed<KbqPipeTemplate[]>(() => [
        {
            name: 'State',
            id: 'State',
            type: KbqPipeTypes.MultiTreeSelect,
            values: this.values(),
            valueTemplate: this.optionTemplate(),
            panelMaxHeight: 480,

            cleanable: false,
            removable: false,
            disabled: false
        }
    ]);

    activeFilter: KbqFilter = {
        name: '',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: [
            {
                name: 'State',
                id: 'State',
                type: KbqPipeTypes.MultiTreeSelect,
                value: null,
                search: true,
                selectAll: true,

                cleanable: false,
                removable: false,
                disabled: false
            }
        ]
    };
}
