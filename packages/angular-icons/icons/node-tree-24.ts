import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-node-tree-24,[kbqNodeTree24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M9.007.3a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3v6.9a.3.3 0 0 0 .3.3h2.25v13.65a.3.3 0 0 0 .3.3H15v2.25a.3.3 0 0 0 .3.3h6.905a.3.3 0 0 0 .3-.3V16.8a.3.3 0 0 0-.3-.3H15.3a.3.3 0 0 0-.3.3v2.249H6.45v-6.96h8.549v2.1a.3.3 0 0 0 .3.3h6.906a.3.3 0 0 0 .3-.3v-6.9a.3.3 0 0 0-.3-.3H15.3a.3.3 0 0 0-.3.3v2.4H6.45V7.5h2.257a.3.3 0 0 0 .3-.3z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqNodeTree24 extends KbqSvgIcon {}
