import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqApple16]',
    template: `
        <svg:path
            d="M12.038 8.402c0-1.128.516-1.958 1.52-2.608a.09.09 0 0 0 .022-.126c-.606-.795-1.482-1.209-2.629-1.3-1.15-.094-2.397.625-2.845.625-.48 0-1.566-.594-2.43-.594C3.886 4.431 2 5.775 2 8.558c0 .813.128 1.657.448 2.533.415 1.157 1.886 3.97 3.42 3.908.8 0 1.375-.563 2.43-.563 1.023 0 1.534.563 2.43.563 1.534 0 2.853-2.459 3.267-3.647a.09.09 0 0 0-.046-.108c-2.005-.977-1.91-2.78-1.91-2.842m-1.79-5.128c.794-.92.777-1.787.769-2.188A.085.085 0 0 0 10.923 1c-.746.09-1.59.544-2.082 1.085-.558.606-.876 1.36-.836 2.176a.083.083 0 0 0 .079.08c.803.033 1.544-.37 2.164-1.068"
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
export class KbqApple16 extends KbqSvgIcon {}
