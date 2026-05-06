import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqCircleTelegram16]',
    template: `
        <svg:path
            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14M3.63 7.722s3.614-1.483 4.867-2.005c.48-.21 2.11-.878 2.11-.878s.751-.292.689.418c-.015.211-.107.804-.22 1.534l-.135.889c-.251 1.566-.523 3.28-.523 3.28s-.041.48-.396.563c-.356.084-.94-.292-1.045-.376l-.228-.15c-.455-.298-1.456-.952-1.881-1.312-.146-.125-.314-.376.02-.668.753-.69 1.65-1.546 2.194-2.089.25-.25.5-.835-.543-.125-1.483 1.023-2.945 1.984-2.945 1.984s-.335.209-.961.02c-.627-.187-1.358-.438-1.358-.438s-.501-.313.355-.647"
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
export class KbqCircleTelegram16 extends KbqSvgIcon {}
