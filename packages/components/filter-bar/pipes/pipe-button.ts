import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
            kbqTooltip="{{ pipe.data.cleanable ? localeData.clearButtonTooltip : localeData.removeButtonTooltip }}"
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

    get localeData() {
        return this.filterBar?.configuration.pipe;
    }

    constructor() {
        this.filterBar?.changes.pipe(takeUntilDestroyed()).subscribe(() => this.changeDetectorRef.markForCheck());
    }
}
