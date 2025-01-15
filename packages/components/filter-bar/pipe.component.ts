import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { KbqButtonModule, KbqButtonStyles } from '../button';
import { KbqComponentColors } from '../core';
import { KbqDividerModule } from '../divider';
import { KbqIcon } from '../icon';
import { KbqFilterBar } from './filter-bar.component';
import { KbqPipe, KbqPipeTemplate, KbqPipeTypes } from './filter-bar.types';
import { KbqPipeDateComponent } from './pipes/pipe-date.component';
import { KbqPipeMultiSelectComponent } from './pipes/pipe-multi-select.component';
import { KbqPipeMultiTreeSelectComponent } from './pipes/pipe-multi-tree-select.component';
import { KbqPipeSelectComponent } from './pipes/pipe-select.component';
import { KbqPipeStates } from './pipes/pipe-states.component';
import { KbqPipeTextComponent } from './pipes/pipe-text.component';
import { KbqPipeTreeSelectComponent } from './pipes/pipe-tree-select.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe',
    template: `
        @if (data.type === pipeTypes.Text) {
            <kbq-pipe-text />
        } @else if (data.type === pipeTypes.Select) {
            <kbq-pipe-select />
        } @else if (data.type === pipeTypes.MultiSelect) {
            <kbq-pipe-multi-select />
        } @else if (data.type === pipeTypes.TreeSelect) {
            <kbq-pipe-tree-select />
        } @else if (data.type === pipeTypes.MultiTreeSelect) {
            <kbq-pipe-multi-tree-select />
        } @else if (data.type === pipeTypes.Date) {
            <kbq-pipe-date />
        }

        @if (!data.required && !isEmpty) {
            <button
                class="kbq-pipe__delete"
                [disabled]="data.disabled"
                [kbq-pipe-states]="data"
                (click)="onDeleteOrClear()"
                kbq-button
            >
                <i kbq-icon="kbq-xmark-s_16"></i>
            </button>
        }
    `,
    styleUrls: ['pipe.component.scss', 'filter-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe',
        '[class]': '"kbq-pipe_" + data.type',
        '[class.kbq-pipe_empty]': 'isEmpty',
        '[class.kbq-pipe_readonly]': 'data.required',
        '[class.kbq-pipe_disabled]': 'data.disabled'
    },
    imports: [
        KbqButtonModule,
        KbqDividerModule,
        KbqIcon,
        KbqPipeTextComponent,
        KbqPipeSelectComponent,
        KbqPipeMultiSelectComponent,
        KbqPipeTreeSelectComponent,
        KbqPipeMultiTreeSelectComponent,
        KbqPipeDateComponent,
        KbqPipeStates
    ]
})
export class KbqPipeComponent implements AfterContentInit {
    readonly stateChanges = new Subject<void>();

    protected readonly pipeTypes = KbqPipeTypes;
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    values: KbqPipeTemplate[];

    @Input()
    get data(): KbqPipe {
        return this._data;
    }

    set data(value: KbqPipe) {
        this._data = value;
    }

    private _data!: KbqPipe;

    get isEmpty(): boolean {
        if (
            [this.pipeTypes.Text, this.pipeTypes.Select, this.pipeTypes.TreeSelect, this.pipeTypes.Date].includes(
                this.data.type
            )
        ) {
            return this.data.value === undefined;
        } else if ([this.pipeTypes.MultiSelect, this.pipeTypes.MultiTreeSelect].includes(this.data.type)) {
            if (Array.isArray(this.data.value)) {
                return this.data.value.length === 0;
            }

            return true;
        }

        throw new Error(`Unknown type: ${this.data.type}`);
    }

    ngAfterContentInit(): void {
        const template = this.filterBar.templates.find((template) => template.type === this.data?.type);

        if (template) {
            this.values = template.values as KbqPipeTemplate[];
        }
    }

    onDeleteOrClear() {
        // this.pipes.deletePipe(this.data);
    }

    // deletePipe(pipe: KbqPipe) {
    // this.pipes.splice(this.pipes.indexOf(pipe), 1);
    // }
}
