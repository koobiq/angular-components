import { Directive, inject, Input, OnInit } from '@angular/core';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqPipe } from '../filter-bar.types';
import { KbqBasePipe } from './base-pipe';

@Directive({
    standalone: true,
    selector: '[kbq-pipe-state]'
})
export class KbqPipeState implements OnInit {
    private readonly button = inject(KbqButton);
    private readonly pipe = inject(KbqBasePipe);

    @Input({ alias: 'kbq-pipe-state' })
    set state(pipe: KbqPipe | null) {
        this._state = pipe;

        this.updateState();
    }

    get state(): KbqPipe | null {
        return this._state;
    }

    private _state: KbqPipe | null = null;

    ngOnInit(): void {
        this.pipe.stateChanges.subscribe(this.updateState);
    }

    updateState = () => {
        this.button.kbqStyle = KbqButtonStyles.Outline;
        this.button.color = KbqComponentColors.ContrastFade;

        if (!this.pipe.isEmpty) {
            this.button.kbqStyle = KbqButtonStyles.Filled;
            this.button.color = KbqComponentColors.ContrastFade;
        }
    };
}
