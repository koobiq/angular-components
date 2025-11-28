import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    inject,
    Input,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOption, KbqOptionModule } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqFilterBar } from './filter-bar';
import { KbqFilter, KbqPipe, KbqPipeTemplate } from './filter-bar.types';
import { getId } from './pipes/base-pipe';

@Component({
    selector: 'kbq-pipe-add',
    imports: [
        KbqDropdownModule,
        KbqToolTipModule,
        KbqButtonModule,
        KbqIcon,
        KbqOptionModule,
        KbqSelectModule,
        NgClass
    ],
    template: `
        <kbq-select #select [tabIndex]="-1" [multiple]="true" [value]="addedPipes" [compareWith]="compareWith">
            <button
                kbqTooltip="{{ filterBar.configuration.add.tooltip }}"
                kbq-button
                kbq-select-matcher
                [color]="'contrast-fade'"
                [kbqStyle]="'outline'"
                [ngClass]="{ 'kbq-active': select.panelOpen }"
            >
                <i kbq-icon="kbq-plus_16"></i>
            </button>

            @for (template of filterBar.pipeTemplates; track template) {
                <kbq-option
                    #option
                    [userSelect]="true"
                    [value]="template"
                    [showCheckbox]="false"
                    (click)="addPipeFromTemplate(option)"
                >
                    {{ template.name }}
                </kbq-option>
            }
        </kbq-select>
    `,
    styleUrl: 'pipe-add.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-pipe-add'
    }
})
export class KbqPipeAdd {
    /** KbqFilterBar instance */
    protected readonly filterBar = inject(KbqFilterBar);

    /** @docs-private */
    @ViewChild(KbqSelect) select: KbqSelect;

    /** Event that is generated after add pipe. */
    @Output() readonly onAddPipe = new EventEmitter<KbqPipeTemplate>();

    /** template of filter */
    @Input() filterTemplate: KbqFilter = {
        name: '',
        pipes: [],

        readonly: false,
        disabled: false,
        changed: false,
        saved: false
    };

    /** already added pipes. Used to open an already added pipe. */
    addedPipes: (string | number)[] = [];

    constructor() {
        this.filterBar.changes.pipe(takeUntilDestroyed()).subscribe(() => {
            if (this.filterBar?.filter) {
                this.addedPipes = this.filterBar.filter.pipes.map((pipe: KbqPipe) => getId(pipe));
            }
        });
    }

    addPipeFromTemplate(option: KbqOption) {
        if (option.selected) {
            this.filterBar.openPipe.next(getId(option.value));
        } else {
            option.select();

            if (!this.filterBar.filter) {
                this.filterBar.filter = structuredClone(this.filterTemplate);
            }

            this.filterBar.filter.changed = true;
            this.filterBar.filter.pipes.push(
                Object.assign({}, option.value, { values: undefined, valueTemplate: undefined, openOnAdd: true })
            );

            this.onAddPipe.next(option.value);
            this.filterBar.filterChange.emit(this.filterBar.filter);
        }

        this.select.close();
    }

    /**
     * Function to compare the option values with the selected values. The first argument
     * is a value from an option. The second is a value from the selection. A boolean
     * should be returned.
     */
    compareWith(o1: KbqPipe, o2: string): boolean {
        return getId(o1) === o2;
    }
}
