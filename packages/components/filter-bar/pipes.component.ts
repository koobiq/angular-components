import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '../icon';
import { KbqFilterBar } from './filter-bar.component';
import { KbqFilter } from './filter-bar.types';
import { KbqPipeMultiSelectComponent } from './pipes/pipe-multi-select.component';
import { KbqPipeMultiTreeSelectComponent } from './pipes/pipe-multi-tree-select.component';
import { KbqPipeSelectComponent } from './pipes/pipe-select.component';
import { KbqPipeTextComponent } from './pipes/pipe-text.component';
import { KbqPipeTreeSelectComponent } from './pipes/pipe-tree-select.component';

@Component({
    standalone: true,
    selector: 'kbq-pipes',
    template: `
        @for (pipe of activeFilter?.pipes; track pipe) {
            @if (pipe.type === 'text') {
                <kbq-pipe [data]="pipe" text />
            } @else if (pipe.type === 'select') {
                <kbq-pipe [data]="pipe" select />
            } @else if (pipe.type === 'multi-select') {
                <kbq-pipe [data]="pipe" multi-select />
            } @else if (pipe.type === 'tree-select') {
                <kbq-pipe [data]="pipe" tree-select />
            } @else if (pipe.type === 'multi-tree-select') {
                <kbq-pipe [data]="pipe" multi-tree-select />
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
        KbqPipeMultiTreeSelectComponent
    ]
})
export class KbqPipes implements OnInit {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    value: string;
    activeFilter: KbqFilter | null;

    constructor() {
        this.filterBar.activeFilterChanges.subscribe(this.updateActiveFilter);
    }

    ngOnInit(): void {
        this.updateActiveFilter(this.filterBar.activeFilter);
    }

    updateActiveFilter = (filter: KbqFilter | null) => {
        this.activeFilter = filter;

        this.changeDetectorRef.markForCheck();
    };
}
