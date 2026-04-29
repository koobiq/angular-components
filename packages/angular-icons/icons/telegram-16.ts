import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-telegram-16,[kbqTelegram16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M.97 7.863q5.685-2.477 7.582-3.266c3.61-1.501 4.36-1.762 4.85-1.77.107-.003.347.024.503.15.132.107.168.251.185.352.017.102.039.332.022.512-.196 2.056-1.042 7.044-1.473 9.346-.182.975-.541 1.301-.888 1.333-.755.07-1.329-.499-2.06-.978-1.144-.75-1.79-1.217-2.901-1.949-1.284-.846-.452-1.31.28-2.07.191-.199 3.518-3.224 3.582-3.499.008-.034.016-.162-.06-.23-.077-.067-.189-.044-.27-.026q-.171.039-5.483 3.625-.779.534-1.41.52c-.464-.01-1.357-.262-2.02-.478C.593 9.17-.054 9.03.002 8.581q.044-.35.968-.718"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTelegram16 extends KbqSvgIcon {}
