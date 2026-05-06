import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqQuestion16]',
    template: `
        <svg:g>
            <svg:path
                d="M8.807 10.45a.207.207 0 0 1-.204.197H6.928a.197.197 0 0 1-.198-.202q.022-.68.144-1.16.14-.56.465-1.014.335-.454.884-.961.428-.384.772-.725.345-.35.55-.734a1.9 1.9 0 0 0 .204-.9q0-.55-.196-.935a1.33 1.33 0 0 0-.576-.585q-.373-.201-.93-.201-.465 0-.875.175a1.46 1.46 0 0 0-.66.524 1.5 1.5 0 0 0-.257.733.213.213 0 0 1-.207.193H4.203a.193.193 0 0 1-.195-.203q.06-.968.55-1.65.54-.75 1.451-1.126.912-.375 2.037-.376 1.246 0 2.13.402.885.393 1.35 1.153.474.752.474 1.817 0 .77-.326 1.398-.326.62-.846 1.162-.522.532-1.126 1.066-.52.445-.707.97-.158.437-.188.982M9.35 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqQuestion16 extends KbqSvgIcon {}
