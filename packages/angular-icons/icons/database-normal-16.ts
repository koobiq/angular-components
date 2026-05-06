import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDatabaseNormal16]',
    template: `
        <svg:g>
            <svg:path d="M14 3.5C14 2.12 11.314 1 8 1S2 2.12 2 3.5v1.01C2.013 5.886 4.694 7 8 7s5.987-1.114 6-2.49z" />
            <svg:path
                d="M8.332 8.197c1.65-.035 3.187-.328 4.372-.822A5.8 5.8 0 0 0 14 6.648V8.51q0 .121-.03.24H9.2a.2.2 0 0 0-.2.2v2.015a14.3 14.3 0 0 1-3.09-.12c-1.697-.264-3.03-.837-3.604-1.555-.196-.245-.303-.507-.306-.78V6.65c.382.292.827.531 1.296.726C4.56 7.902 6.224 8.2 8 8.2q.167 0 .332-.003M8 12.2l1-.034v2.8a14.3 14.3 0 0 1-3.063-.118l-.027-.004C3.627 14.491 2 13.574 2 12.5v-1.851a5.8 5.8 0 0 0 1.296.726c.986.411 2.214.683 3.549.782A16 16 0 0 0 8 12.2"
            />
            <svg:path
                d="M11.215 16a.2.2 0 0 0 .2-.2v-3.853l2.31 3.954a.2.2 0 0 0 .173.099h.902a.2.2 0 0 0 .2-.2v-5.646a.2.2 0 0 0-.2-.2h-.812a.2.2 0 0 0-.2.2v3.857l-2.315-3.958a.2.2 0 0 0-.173-.099h-.9a.2.2 0 0 0-.2.2V15.8c0 .11.09.2.2.2z"
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
export class KbqDatabaseNormal16 extends KbqSvgIcon {}
