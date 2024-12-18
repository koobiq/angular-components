import { Directive, inject, Input, OnInit } from '@angular/core';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqPipe } from '../filter-bar.types';
import { KbqPipeBase } from './pipe.component';

@Directive({
    standalone: true,
    selector: '[kbq-pipe-states]'
})
export class KbqPipeStates implements OnInit {
    private readonly button = inject(KbqButton);
    private readonly basePipe = inject(KbqPipeBase);

    @Input({ alias: 'kbq-pipe-states' })
    set pipe(pipe: KbqPipe | null) {
        this._pipe = pipe;

        this.updateState();
    }

    get pipe(): KbqPipe | null {
        return this._pipe;
    }

    private _pipe: KbqPipe | null = null;

    ngOnInit(): void {
        this.basePipe.stateChanges.subscribe(this.updateState);
    }

    updateState = () => {
        this.button.kbqStyle = KbqButtonStyles.Outline;
        this.button.color = KbqComponentColors.ContrastFade;

        if (!this.basePipe.isEmpty) {
            this.button.kbqStyle = KbqButtonStyles.Filled;
            this.button.color = KbqComponentColors.ContrastFade;
        }
    };
}
