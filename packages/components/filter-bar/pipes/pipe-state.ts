import { DestroyRef, Directive, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFilterBar } from '../filter-bar';
import { KbqBasePipe } from './base-pipe';

@Directive({
    standalone: true,
    selector: '[kbqPipeState]'
})
export class KbqPipeState<T> implements OnInit {
    /** @docs-private */
    private readonly destroyRef = inject(DestroyRef);
    /** @docs-private */
    private readonly button = inject(KbqButton);
    /** @docs-private */
    private readonly pipe = inject(KbqBasePipe);
    /** KbqFilterBar instance
     * @docs-private */
    private readonly filterBar = inject(KbqFilterBar);

    /** calculates and updates styles of button from pipe state */
    @Input({ alias: 'kbqPipeState' })
    get state(): T | null {
        return this._state;
    }

    set state(pipe: T | null) {
        this._state = pipe;

        this.updateState();
    }

    private _state: T | null = null;

    ngOnInit(): void {
        this.filterBar.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.updateState);
    }

    private updateState = () => {
        this.button.kbqStyle = KbqButtonStyles.Outline;
        this.button.color = KbqComponentColors.ContrastFade;

        if (!this.pipe.isEmpty) {
            this.button.kbqStyle = KbqButtonStyles.Filled;
            this.button.color = KbqComponentColors.ContrastFade;
        }
    };
}
