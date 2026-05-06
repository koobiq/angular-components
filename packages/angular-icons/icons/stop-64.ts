import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqStop64]',
    template: `
        <svg:path
            d="M12 15.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C13.52 12 14.08 12 15.2 12h33.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C52 13.52 52 14.08 52 15.2v33.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C50.48 52 49.92 52 48.8 52H15.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C12 50.48 12 49.92 12 48.8z"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 64 64',
        width: '64',
        height: '64'
    }
})
export class KbqStop64 extends KbqSvgIcon {}
