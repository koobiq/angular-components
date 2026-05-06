import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPuzzlePiece16]',
    template: `
        <svg:path
            d="M6.152 3c.308 0 .507-.34.438-.64a1.8 1.8 0 0 1-.048-.402 1.458 1.458 0 0 1 2.916 0q0 .196-.048.403c-.069.3.13.639.438.639H12.8c.11 0 .2.09.2.2v2.952c0 .308.34.507.64.438q.205-.048.402-.048a1.458 1.458 0 0 1 0 2.916 1.8 1.8 0 0 1-.403-.048c-.3-.069-.639.13-.639.438V12.8a.2.2 0 0 1-.2.2H9.848c-.308 0-.507-.34-.438-.64q.048-.205.048-.402a1.458 1.458 0 0 0-2.916 0q0 .195.048.403c.069.3-.13.639-.438.639H3.2a.2.2 0 0 1-.2-.2V9.848c0-.308.34-.507.64-.438q.206.048.402.048a1.458 1.458 0 0 0 0-2.916q-.195 0-.403.048C3.34 6.659 3 6.46 3 6.152V3.2c0-.11.09-.2.2-.2h2.952"
        />
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
export class KbqPuzzlePiece16 extends KbqSvgIcon {}
