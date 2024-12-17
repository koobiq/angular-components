import { Directive, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { KbqButton, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqPipe } from '../filter-bar.types';

@Directive({
    standalone: true,
    selector: '[kbq-pipe-states]',
    host: {
        '[class]': 'computedStyles'
    }
})
export class KbqPipeStates {
    private readonly button = inject(KbqButton);

    protected computedStyles;

    @ViewChild('kbqTitleText', { static: false }) textElement: ElementRef;

    @Input()
    set pipe(pipe: KbqPipe | null) {
        this._pipe = pipe;

        console.log('set pipe(value: KbqPipe | null) {: ');

        this.computedStyles = '';
        this.button.kbqStyle = KbqButtonStyles.Outline;
        this.button.color = KbqComponentColors.ContrastFade;

        if (this.pipe) {
            if (this.pipe.readonly) {
                this.button.kbqStyle = KbqButtonStyles.Outline;
                this.button.color = KbqComponentColors.ContrastFade;
            } else if (!this.pipe.empty) {
                this.button.kbqStyle = KbqButtonStyles.Filled;
                this.button.color = KbqComponentColors.ContrastFade;
            }

            this.computedStyles = {
                'kbq-pipe_filled-pipe': this.pipe.changed
            };

            if (this.pipe.changed) {
                this.button.kbqStyle = 'changed-filter';
                this.button.color = KbqComponentColors.Empty;
            }
        }
    }

    get pipe(): KbqPipe | null {
        return this._pipe;
    }

    private _pipe: KbqPipe | null = null;
}
