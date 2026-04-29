import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-play-rewind-24,[kbqPlayRewind24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="m22.133 5.674.495-.31a.3.3 0 0 1 .459.254v6.054a.3.3 0 0 1-.432.27l-5.442-2.653a.3.3 0 0 1-.027-.525l1.686-1.053A8.1 8.1 0 0 0 4.26 9.612a.153.153 0 0 1-.213.094L2.26 8.834a.295.295 0 0 1-.15-.362C3.87 3.513 9.11.556 14.361 1.769a10.47 10.47 0 0 1 6.545 4.67zM1.87 18.317l-.496.31a.3.3 0 0 1-.458-.254v-6.055a.3.3 0 0 1 .432-.27l5.441 2.654a.3.3 0 0 1 .028.524l-1.692 1.057a8.1 8.1 0 0 0 14.615-1.897.153.153 0 0 1 .213-.093l1.787.872c.135.065.2.221.15.362-1.761 4.959-7.001 7.916-12.252 6.703a10.47 10.47 0 0 1-6.548-4.675z"
                />
                <path
                    d="M10.14 7.846c-.165-.117-.39.003-.39.208v7.892c0 .205.225.325.39.208l5.505-3.947c.14-.1.14-.314 0-.415z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPlayRewind24 extends KbqSvgIcon {}
