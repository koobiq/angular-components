import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-user-viewfinder-16,[kbqUserViewfinder16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M1.2 5a.2.2 0 0 1-.2-.2V1.2c0-.11.09-.2.2-.2h3.6c.11 0 .2.09.2.2v1.2a.2.2 0 0 1-.2.2H2.6v2.2a.2.2 0 0 1-.2.2zm13.6 0a.2.2 0 0 0 .2-.2V1.2a.2.2 0 0 0-.2-.2h-3.6a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h2.2v2.2c0 .11.09.2.2.2zm.2 6.2a.2.2 0 0 0-.2-.2h-1.2a.2.2 0 0 0-.2.2v2.2h-2.2a.2.2 0 0 0-.2.2v1.2c0 .11.09.2.2.2h3.6a.2.2 0 0 0 .2-.2zM4.8 15a.2.2 0 0 0 .2-.2v-1.2a.2.2 0 0 0-.2-.2H2.6v-2.2a.2.2 0 0 0-.2-.2H1.2a.2.2 0 0 0-.2.2v3.6c0 .11.09.2.2.2zm4.935-9.476c0 1.118-.777 2.313-1.735 2.313S6.265 6.642 6.265 5.524 7.042 3.5 8 3.5s1.735.906 1.735 2.024M8 9.037c.877 0 1.564-.472 2.02-1.006l1.2.672a1.2 1.2 0 0 1 .567 1.377l-.507 1.775a.2.2 0 0 1-.193.145H4.694a.2.2 0 0 1-.196-.16l-.37-1.815a1.2 1.2 0 0 1 .59-1.287l1.262-.707c.456.534 1.143 1.006 2.02 1.006"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUserViewfinder16 extends KbqSvgIcon {}
