import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-lines-o-32,[kbqFileLinesO32]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <g>
                <path d="M10 19h6v2h-6zM22 14H10v2h12zM10 9h12v2H10z" />
                <path
                    d="M8.3 29h12.1l6.6-6.5V6.25C26.993 4.46 25.518 3 23.7 3H8.3C6.478 3 5.001 4.456 5.001 6.25L5 25.75C5 27.545 6.477 29 8.3 29M20 26.389V22h4.489zM18 27H8.5A1.5 1.5 0 0 1 7 25.5V6.492a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5V20h-5a2 2 0 0 0-2 2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileLinesO32 extends KbqSvgIcon {}
