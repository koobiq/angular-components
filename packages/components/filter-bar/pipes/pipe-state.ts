import { Directive, effect, inject, Input } from '@angular/core';
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

    /** calculates and updates styles of button from pipe state */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ alias: 'kbqPipeState' })
    get state(): T | null {
        return this._state;
    }

    set state(pipe: T | null) {
        this._state = pipe;

        this.updateState();
    }

    private _state: T | null = null;

    constructor() {
        // Re-derive the button style whenever the filter changes (a pipe's emptiness may change with it).
        // Passing the `filterBar.filter` read into `updateState` subscribes this effect to the signal-backed
        // accessor, replacing the retired `changes` bus.
        effect(() => this.updateState(this.filterBar.filter));
    }

    private updateState = (_filter?: unknown) => {
        this.button.kbqStyle = KbqButtonStyles.Outline;
        this.button.color = KbqComponentColors.ContrastFade;

        if (!this.pipe.isEmpty) {
            this.button.kbqStyle = KbqButtonStyles.Filled;
            this.button.color = KbqComponentColors.ContrastFade;
        }
    };
}
