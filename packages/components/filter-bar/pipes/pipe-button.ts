import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqFilterBar } from '../filter-bar';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeState } from './pipe-state';

@Component({
    standalone: true,
    selector: 'kbq-pipe-button',
    template: `
        <button
            class="kbq-pipe__remove-button"
            [disabled]="pipe.data.disabled"
            [kbqPipeState]="pipe.data"
            (click)="pipe.data.cleanable ? pipe.onClear() : pipe.onRemove()"
            kbq-button
            kbqTooltip="{{ pipe.data.cleanable ? 'Очистить' : 'Удалить' }}"
        >
            <i kbq-icon="kbq-xmark-s_16"></i>
        </button>
    `,
    styleUrl: 'pipe-button.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe-button'
    },
    imports: [
        KbqIcon,
        KbqDividerModule,
        KbqButtonModule,
        KbqPipeState,
        KbqTooltipTrigger
    ]
})
export class KbqPipeButton {
    protected readonly pipe = inject(KbqBasePipe);
    protected readonly filterBar = inject(KbqFilterBar, { optional: true });
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    constructor() {
        this.filterBar?.changes.subscribe(() => this.changeDetectorRef.markForCheck());
    }
}
