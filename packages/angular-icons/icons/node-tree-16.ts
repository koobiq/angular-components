import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-node-tree-16,[kbqNodeTree16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M6.004.2a.2.2 0 0 0-.2-.2H1.2a.2.2 0 0 0-.2.2v4.6c0 .11.09.2.2.2h1.5v9.1c0 .11.09.2.2.2H10v1.5c0 .11.09.2.2.2h4.604a.2.2 0 0 0 .2-.2v-4.599a.2.2 0 0 0-.2-.2H10.2a.2.2 0 0 0-.2.2V12.7H4.3V8.06H10v1.4c0 .11.089.2.2.2h4.604a.2.2 0 0 0 .2-.2v-4.6a.2.2 0 0 0-.2-.2h-4.605a.2.2 0 0 0-.2.2v1.6H4.3V5h1.504a.2.2 0 0 0 .2-.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqNodeTree16 extends KbqSvgIcon {}
