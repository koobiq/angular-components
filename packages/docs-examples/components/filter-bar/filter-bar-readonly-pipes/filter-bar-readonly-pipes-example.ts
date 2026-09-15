import { ChangeDetectionStrategy, Component, computed, linkedSignal } from '@angular/core';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateFormatter } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFilter, KbqFilterBarModule, KbqPipe, KbqPipeTemplate, KbqPipeTypes } from '@koobiq/components/filter-bar';
import { KbqLinkModule } from '@koobiq/components/link';
import { injectLocalizedPeriods, injectLocalizedText } from '../localized-data';

/** Text search is the first pipe in every filter: always present, never removable. */
const createSearchPipe = (name: string): KbqPipe => ({
    name,
    type: KbqPipeTypes.Input,
    value: null,

    cleanable: true,
    removable: false,
    disabled: false
});

/**
 * @title filter-bar-readonly-pipes
 */
@Component({
    selector: 'filter-bar-readonly-pipes-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule,
        KbqDlModule,
        KbqLinkModule
    ],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates()" [(filter)]="activeFilter">
            @for (pipe of activeFilter().pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            @if (filterHasChanges()) {
                <kbq-filter-reset (onResetFilter)="onResetFilter()" />
            }
        </kbq-filter-bar>

        <br />

        <kbq-dl [verticalBreakpoint]="590">
            <kbq-dt>{{ text().user }}</kbq-dt>
            <kbq-dd><span kbq-link pseudo (click)="setUser(text().user, 'rturov')">rturov</span></kbq-dd>

            @for (item of text().readonlyPipes; track item) {
                <kbq-dt>{{ item.name }}</kbq-dt>
                <kbq-dd>
                    <span kbq-link pseudo (click)="addPipe(item.name, item.value)">{{ item.value }}</span>
                </kbq-dd>
            }
        </kbq-dl>
    `,
    providers: [DateFormatter],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarReadonlyPipesExample {
    /** Text the example owns: it has no counterpart in the library's locale data. */
    protected readonly text = injectLocalizedText({
        'ru-RU': {
            search: 'Поиск',
            user: 'Пользователь',
            readonlyPipes: [
                { name: 'Домен', value: 'Управление системой' },
                { name: 'Тип объекта', value: 'PaxMatrol IEMS' },
                { name: 'Действие', value: 'Изменение' },
                { name: 'Объект', value: 'Resolver' }
            ]
        },
        default: {
            search: 'Search',
            user: 'User',
            readonlyPipes: [
                { name: 'Domain', value: 'System management' },
                { name: 'Object type', value: 'PaxMatrol IEMS' },
                { name: 'Action', value: 'Modification' },
                { name: 'Object', value: 'Resolver' }
            ]
        }
    });

    /** Period labels follow the active locale, so everything built out of them is rebuilt with it. */
    protected readonly periods = injectLocalizedPeriods();

    // Rebuilt whenever the locale changes: `*kbqPipe` builds a pipe component once from the object it is
    // given and ignores later changes to that binding, so relabelled pipes only reach the screen as new
    // objects.
    readonly activeFilter = linkedSignal(() => this.getDefaultFilter());

    private readonly defaultFilter = computed(() => this.getDefaultFilter());

    /** `addPipe` only ever appends, so the default pipes stay index-aligned at the front. */
    protected readonly filterHasChanges = computed(() => {
        const defaultPipes = this.defaultFilter().pipes;
        const pipes = this.activeFilter().pipes;

        return (
            pipes.length > defaultPipes.length || pipes.some((pipe, index) => pipe.value !== defaultPipes[index].value)
        );
    });

    readonly pipeTemplates = computed<KbqPipeTemplate[]>(() => [
        {
            name: 'Date',
            type: KbqPipeTypes.Date,
            values: this.periods.date(),
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: this.periods.datetime(),
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'MultiSelect',
            type: KbqPipeTypes.MultiSelect,
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' },
                { name: 'Option 4', id: '4' },
                { name: 'Option 5', id: '5' },
                { name: 'Option 6', id: '6' },
                { name: 'Option 7', id: '7' }
            ],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Select',
            type: KbqPipeTypes.Select,
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' },
                { name: 'Option 4', id: '4' },
                { name: 'Option 5', id: '5' },
                { name: 'Option 6', id: '6' },
                { name: 'Option 7', id: '7' }
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
    ]);

    onResetFilter() {
        console.log('onResetFilter: ');
        this.activeFilter.set(this.getDefaultFilter());
    }

    getDefaultFilter(): KbqFilter {
        return {
            name: '',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                createSearchPipe(this.text().search),
                {
                    name: this.text().user,
                    value: null,
                    type: KbqPipeTypes.ReadOnly,

                    cleanable: true,
                    removable: false,
                    disabled: false
                }
            ]
        };
    }

    setUser(name: string, value: string) {
        this.activeFilter.update((filter) =>
            filter.pipes.some((pipe) => pipe.name === name)
                ? {
                      ...filter,
                      changed: true,
                      pipes: filter.pipes.map((pipe) => (pipe.name === name ? { ...pipe, value } : pipe))
                  }
                : filter
        );
    }

    addPipe(name: string, value: string) {
        this.activeFilter.update((filter) =>
            filter.pipes.some((pipe) => pipe.name === name)
                ? filter
                : {
                      ...filter,
                      changed: true,
                      pipes: [
                          ...filter.pipes,
                          {
                              name,
                              value,
                              type: KbqPipeTypes.ReadOnly,

                              cleanable: false,
                              removable: true,
                              disabled: false
                          }
                      ]
                  }
        );
    }
}
