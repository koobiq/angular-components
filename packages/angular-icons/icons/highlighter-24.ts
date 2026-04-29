import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-highlighter-24,[kbqHighlighter24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m5.834 21.35-1.591 1.59L0 20.82l2.652-2.652zm4.773-1.592-.318-.318a1.8 1.8 0 0 0-2.545 0l-.637.636-3.182-3.182.637-.637a1.8 1.8 0 0 0-.001-2.545l-.318-.318 2.121-2.121 6.364 6.364zM21.974 3.971c.652.652.706 1.694.123 2.41l-8.308 10.195-6.364-6.364L17.62 1.904a1.8 1.8 0 0 1 2.41.123z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHighlighter24 extends KbqSvgIcon {}
