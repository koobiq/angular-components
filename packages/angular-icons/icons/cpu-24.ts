import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-cpu-24,[kbqCpu24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path d="M9.27 9.57a.3.3 0 0 1 .3-.3h4.8a.3.3 0 0 1 .3.3v4.8a.3.3 0 0 1-.3.3h-4.8a.3.3 0 0 1-.3-.3z" />
                <path
                    d="M17.67 4.47a1.8 1.8 0 0 1 1.8 1.8V7.8h2.73a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3h-2.73v3.6h2.73a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3h-2.73v1.47a1.8 1.8 0 0 1-1.8 1.8H16.2v2.73a.3.3 0 0 1-.3.3h-1.8a.3.3 0 0 1-.3-.3v-2.73h-3.6v2.73a.3.3 0 0 1-.3.3H8.1a.3.3 0 0 1-.3-.3v-2.73H6.27a1.8 1.8 0 0 1-1.8-1.8V16.2H1.8a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3h2.67v-3.6H1.8a.3.3 0 0 1-.3-.3V8.1a.3.3 0 0 1 .3-.3h2.67V6.27a1.8 1.8 0 0 1 1.8-1.8H7.8V1.8a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v2.67h3.6V1.8a.3.3 0 0 1 .3-.3h1.8a.3.3 0 0 1 .3.3v2.67zm-10.2 3.3v8.4a.3.3 0 0 0 .3.3h8.4a.3.3 0 0 0 .3-.3v-8.4a.3.3 0 0 0-.3-.3h-8.4a.3.3 0 0 0-.3.3"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCpu24 extends KbqSvgIcon {}
