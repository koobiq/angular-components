import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-arrows-rotate-bolt-16,[kbqArrowsRotateBolt16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="m3.133 5.66.002.001a5.408 5.408 0 0 1 3.44-2.87 5.4 5.4 0 0 1 6.1 2.51l.001.002-1.156.667a.2.2 0 0 0 .006.35l3.564 1.895a.2.2 0 0 0 .293-.17l.142-4.034a.2.2 0 0 0-.3-.18l-.337.195-.823.475a7.003 7.003 0 0 0-12.557.88.196.196 0 0 0 .09.244l1.06.576c.11.06.247.005.291-.111q.082-.219.184-.43m6.294 7.55a5.4 5.4 0 0 1-6.101-2.51l1.156-.668a.2.2 0 0 0-.006-.35L.912 7.789a.2.2 0 0 0-.294.17l-.14 4.033a.2.2 0 0 0 .299.18l.337-.195.823-.475a7.003 7.003 0 0 0 12.556-.879.196.196 0 0 0-.09-.245l-1.06-.576a.207.207 0 0 0-.29.112 5 5 0 0 1-.183.427h-.002a5.409 5.409 0 0 1-3.44 2.871m-2.53-8.777a.1.1 0 0 1 .091-.067h2.67c.068 0 .114.068.09.131L8.714 7.271h2.307c.083 0 .127.1.071.162L7.196 11.8c-.068.076-.191.008-.163-.091l.845-2.986H5.613a.097.097 0 0 1-.091-.128z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqArrowsRotateBolt16 extends KbqSvgIcon {}
