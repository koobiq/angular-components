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

    /**
     * Pipe state the styled button belongs to.
     *
     * Carries the binding this directive's selector matches. Every binding passes the pipe's own `data`,
     * which is mutated in place, so this value is a constant for the life of the pipe and the style is
     * derived from `pipe.isEmpty` instead.
     */
    readonly state = input<T | null>(null, { alias: 'kbqPipeState' });

    constructor() {
        // The trigger and the remove button are two buttons that have to carry one style. A pipe changes
        // its emptiness by writing `data.value` in place, which no signal observes — `stateChanges` is the
        // bus it fires on such a write.
        this.pipe.stateChanges.pipe(takeUntilDestroyed()).subscribe(() => this.updateState());

        // A filter replaced from the outside can change a pipe's emptiness without any of its handlers
        // running. The read is what subscribes this effect; the style derives from `pipe.isEmpty`.
        effect(() => {
            this.filterBar.filter();

            this.updateState();
        });
    }

    private updateState = () => {
        // Both styles resolve to the same default color, so it is written once, outside the branch.
        this.button.color = KbqComponentColors.ContrastFade;
        this.button.kbqStyle = KbqButtonStyles.Outline;

        if (!this.pipe.isEmpty) {
            this.button.kbqStyle = KbqButtonStyles.Filled;
        }
    };
}
