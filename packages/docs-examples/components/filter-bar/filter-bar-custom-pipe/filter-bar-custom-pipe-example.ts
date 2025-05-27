import { NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import {
    defaultFilterBarPipes,
    KBQ_FILTER_BAR_PIPES,
    KbqBasePipe,
    KbqFilter,
    KbqFilterBarModule,
    KbqPipeButton,
    KbqPipeMinWidth,
    KbqPipeState,
    KbqPipeTemplate,
    KbqPipeTitleDirective,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTitleModule } from '@koobiq/components/title';

@Component({
    standalone: true,
    selector: 'color-pipe',
    template: `
        <button
            [disabled]="data.disabled"
            [kbqPipeState]="data"
            [kbqPipeTitle]="pipeTooltip"
            [kbqPopoverArrow]="false"
            [kbqPopoverClass]="'kbq-pipe__popover'"
            [kbqPopoverContent]="content"
            [kbqPopoverOffset]="4"
            [kbqPopoverPlacement]="placements.BottomLeft"
            [ngClass]="{ 'kbq-active': popover?.isOpen }"
            kbq-button
            kbqPopover
        >
            <span class="kbq-pipe__name" #kbqTitleText kbqPipeMinWidth>{{ data.name }}</span>
            <span class="kbq-pipe__value" #kbqTitleText [class.kbq-pipe__value_empty]="!data.value" kbqPipeMinWidth>
                {{ data.value }}
            </span>
        </button>

        @if (showRemoveButton) {
            <kbq-pipe-button />
        }

        <ng-template #content>
            <input
                class="layout-margin-bottom-s"
                [(ngModel)]="data.value"
                (keydown.enter)="popover.hide()"
                type="color"
                style="width:100%;"
            />
        </ng-template>

        <ng-template #pipeTooltip>
            <div class="kbq-pipe-tooltip__name kbq-text-compact">{{ data.name }}</div>
            <div class="kbq-pipe-tooltip__value kbq-text-compact">{{ data.value }}</div>
        </ng-template>
    `,
    styleUrls: ['../../../../components/filter-bar/pipes/base-pipe.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    imports: [
        KbqButtonModule,
        KbqFormFieldModule,
        KbqPopoverModule,
        KbqInputModule,
        KbqDividerModule,
        FormsModule,
        KbqTextareaModule,
        NgClass,
        ReactiveFormsModule,
        KbqTitleModule,
        KbqPipeState,
        KbqPipeTitleDirective,
        KbqPipeMinWidth,
        KbqPipeButton
    ]
})
export class ColorPipeComponent extends KbqBasePipe<string | null> implements AfterViewInit, OnInit {
    readonly placements = PopUpPlacements;

    @ViewChild(KbqPopoverTrigger) popover: KbqPopoverTrigger;

    get isEmpty(): boolean {
        return this.data.value === null || this.data.value === undefined;
    }

    get showRemoveButton(): boolean {
        return !!(!this.data.required && (this.data.removable || (this.data.cleanable && !this.isEmpty)));
    }

    get disabled(): boolean {
        return !this.control.value;
    }

    control = new FormControl<typeof this.data.value>('');

    ngOnInit(): void {
        this.control.setValue(this.data.value);
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        this.control.valueChanges.subscribe(() => this.stateChanges.next());
        this.popover.visibleChange.subscribe(() => this.stateChanges.next());
    }

    override open() {
        this.popover?.show();
    }
}

/**
 * @title filter-bar-custom-pipe
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'filter-bar-custom-pipe-example',
    imports: [
        KbqFilterBarModule,
        LuxonDateModule
    ],
    template: `
        <kbq-filter-bar [(filter)]="filter" [pipeTemplates]="pipeTemplates">
            @for (pipe of filter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            @if (filter.pipes.length) {
                <kbq-filter-reset (onResetFilter)="filter.pipes = []" />
            }
        </kbq-filter-bar>
    `,
    providers: [
        {
            provide: KBQ_FILTER_BAR_PIPES,
            useValue: new Map([...defaultFilterBarPipes, ['colorPipe', ColorPipeComponent]])
        }
    ]
})
export class FilterBarCustomPipeExample {
    filters: KbqFilter[] = [];
    filter: KbqFilter = {
        name: '',
        readonly: false,
        disabled: false,
        changed: true,
        saved: false,
        pipes: [
            {
                name: 'colorPipe',
                type: 'colorPipe',
                value: '#112233',

                cleanable: false,
                removable: true,
                disabled: false
            }
        ]
    };

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'colorPipe',
            type: 'colorPipe',

            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Date',
            type: KbqPipeTypes.Date,
            values: [
                { name: 'Последний день', start: { days: -1 }, end: null },
                { name: 'Последние 3 дня', start: { days: -3 }, end: null },
                { name: 'Последние 7 дней', start: { days: -7 }, end: null },
                { name: 'Последние 30 дней', start: { days: -30 }, end: null },
                { name: 'Последние 90 дней', start: { days: -90 }, end: null },
                { name: 'Последний год', start: { years: -1 }, end: null }
            ],
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: [
                { name: 'Последний час', start: { hours: -1 }, end: null },
                { name: 'Последние 3 часа', start: { hours: -3 }, end: null },
                { name: 'Последние 24 часа', start: { hours: -24 }, end: null },
                { name: 'Последние 3 дня', start: { days: -3 }, end: null },
                { name: 'Последние 7 дней', start: { days: -7 }, end: null },
                { name: 'Последние 30 дней', start: { days: -30 }, end: null },
                { name: 'Последние 90 дней', start: { days: -90 }, end: null },
                { name: 'Последний год', start: { years: -1 }, end: null }
            ],
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
    ];
}
