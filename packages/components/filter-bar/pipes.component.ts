import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '../button';
import { KbqComponentColors } from '../core';
import { KbqDividerModule } from '../divider';
import { KbqIcon } from '../icon';
import { KbqFilterBar } from './filter-bar.component';
import { KbqPipe, KbqPipeTypes } from './filter-bar.types';
import { KbqPipeDateComponent } from './pipes/pipe-date.component';
import { KbqPipeMultiSelectComponent } from './pipes/pipe-multi-select.component';
import { KbqPipeMultiTreeSelectComponent } from './pipes/pipe-multi-tree-select.component';
import { KbqPipeSelectComponent } from './pipes/pipe-select.component';
import { KbqPipeTextComponent } from './pipes/pipe-text.component';
import { KbqPipeTreeSelectComponent } from './pipes/pipe-tree-select.component';

@Component({
    standalone: true,
    selector: 'kbq-pipes',
    template: `
        @for (pipe of pipes; track pipe) {
            @if (pipe.type === pipeTypes.Text) {
                <kbq-pipe [data]="pipe" text />
            } @else if (pipe.type === pipeTypes.Select) {
                <kbq-pipe [data]="pipe" select />
            } @else if (pipe.type === pipeTypes.MultiSelect) {
                <kbq-pipe [data]="pipe" multi-select />
            } @else if (pipe.type === pipeTypes.TreeSelect) {
                <kbq-pipe [data]="pipe" tree-select />
            } @else if (pipe.type === pipeTypes.MultiTreeSelect) {
                <kbq-pipe [data]="pipe" multi-tree-select />
            } @else if (pipe.type === pipeTypes.Date) {
                <kbq-pipe [data]="pipe" date />
            }
        }
    `,
    styleUrls: ['pipes.component.scss', 'filter-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipes'
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
        KbqPipeDateComponent
    ]
})
export class KbqPipesComponent {
    protected readonly pipeTypes = KbqPipeTypes;
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    @Input()
    get pipes(): KbqPipe[] {
        return this._pipes;
    }

    set pipes(value: KbqPipe[]) {
        this._pipes = value;
    }

    private _pipes!: KbqPipe[];

    deletePipe(pipe: KbqPipe) {
        this.pipes.splice(this.pipes.indexOf(pipe), 1);
    }
}
