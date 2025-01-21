import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    inject,
    Input,
    ViewContainerRef,
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

        @if (!data.required) {
            <kbq-divider class="kbq-pipe__separator" [vertical]="true" [paddings]="false" />

            @if (data.removable) {
                <button
                    class="kbq-pipe__delete"
                    [disabled]="data.disabled"
                    [kbq-pipe-states]="data"
                    (click)="onDelete()"
                    kbq-button
                >
                    <i kbq-icon="kbq-xmark-s_16"></i>
                </button>
            }

            @if (data.cleanable && !isEmpty) {
                <button
                    class="kbq-pipe__delete"
                    [disabled]="data.disabled"
                    [kbq-pipe-states]="data"
                    (click)="onClear()"
                    kbq-button
                >
                    <i kbq-icon="kbq-xmark-s_16"></i>
                </button>
            }
        }
    `,
    styleUrls: ['pipe.component.scss', 'filter-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe',
        '[class]': '"kbq-pipe__" + data.type',
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
    protected readonly viewContainerRef = inject(ViewContainerRef);

    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    values: KbqPipeTemplate[];
    pipeInstance;

    @Input()
    get data(): KbqPipe {
        return this._data;
    }

    set data(value: KbqPipe) {
        this._data = value;
    }

    private _data!: KbqPipe;

    get isEmpty(): boolean {
        return !!this.pipeInstance?.isEmpty;
    }

    ngAfterContentInit(): void {
        const template = this.filterBar.templates.find((template) => template.type === this.data?.type);

        if (template) {
            this.values = template.values as KbqPipeTemplate[];
        }
    }

    onDelete() {
        this.filterBar.deletePipe(this.data);

        this.stateChanges.next();
    }

    onClear() {
        this.data.value = null;

        this.stateChanges.next();
    }
}
