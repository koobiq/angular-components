import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqMessageDot16]',
    template: `
        <svg:path fill="currentColor" d="M12.093 1.396A2.01 2.01 0 0 1 14 0a2 2 0 1 1-1.907 1.396" />
        <svg:path
            d="M3.4 2h7.4A3.2 3.2 0 0 0 15 5.04v5.56a2.4 2.4 0 0 1-2.4 2.4H7.75l-3.425 2.74A.2.2 0 0 1 4 15.584V13h-.6A2.4 2.4 0 0 1 1 10.6V4.4A2.4 2.4 0 0 1 3.4 2M8 8.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2m4-1a1 1 0 1 0-2 0 1 1 0 0 0 2 0m-7 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
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
export class KbqMessageDot16 extends KbqSvgIcon {}
