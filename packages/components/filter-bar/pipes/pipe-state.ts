import { Directive, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KBQ_FILTER_BAR_HOST } from '../filter-bar.types';
import { KbqBasePipe } from './base-pipe';

@Directive({
    selector: '[kbqPipeState]'
})
export class KbqPipeState<T> {
    /** @docs-private */
    private readonly button = inject(KbqButton);
    /** @docs-private */
    private readonly pipe = inject(KbqBasePipe);
    /** KbqFilterBar instance
     * @docs-private */
    private readonly filterBar = inject(KBQ_FILTER_BAR_HOST);

    /** Pipe state used to calculate/update the button style. */
    readonly state = input<T | null>(null, { alias: 'kbqPipeState' });

    constructor() {
        // The trigger and the remove button are two buttons that have to carry one style. A pipe changes
        // its emptiness by writing `data.value` in place, which no signal observes — `stateChanges` is the
        // bus it fires on such a write.
        this.pipe.stateChanges.pipe(takeUntilDestroyed()).subscribe(() => this.updateState());

        // Re-derive the button style whenever the filter OR the pipe state changes (a pipe's emptiness may
        // change with either). Passing both reads into `updateState` subscribes this effect to both signals;
        // the style itself derives from `pipe.isEmpty`.
        effect(() => this.updateState(this.filterBar.filter(), this.state()));
    }

    private updateState = (_filter?: unknown, _state?: unknown) => {
        this.button.kbqStyle = KbqButtonStyles.Outline;
        this.button.color = KbqComponentColors.ContrastFade;

        if (!this.pipe.isEmpty) {
            this.button.kbqStyle = KbqButtonStyles.Filled;
            this.button.color = KbqComponentColors.ContrastFade;
        }
    };
}
