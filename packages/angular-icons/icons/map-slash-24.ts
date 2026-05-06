import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqMapSlash24]',
    template: `
        <svg:g>
            <svg:path
                d="M16.723 3.097a.15.15 0 0 0-.213.136v11.576l-1.805-1.804V3.25a.15.15 0 0 0-.219-.134L9.455 5.724a.3.3 0 0 0-.162.267v1.601L3.284 1.583a.303.303 0 0 0-.429 0L1.583 2.856a.303.303 0 0 0 0 .428L20.71 22.411c.119.119.31.119.429 0l1.272-1.272a.303.303 0 0 0 0-.429l-1.388-1.387V5.293a.3.3 0 0 0-.173-.271zM7.489 20.763a.15.15 0 0 1-.214.136l-4.127-1.924a.3.3 0 0 1-.173-.272V7.238l4.514 4.514zM9.293 13.56l4.896 4.895-4.677 2.424a.15.15 0 0 1-.22-.133z"
            />
        </svg:g>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqMapSlash24 extends KbqSvgIcon {}
