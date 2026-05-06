import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqRectangleIp624]',
    template: `
        <svg:g>
            <svg:path
                d="M17.298 15.096c-.87 0-1.467-.66-1.467-1.589 0-.919.597-1.571 1.467-1.571.846 0 1.453.652 1.453 1.58 0 .92-.598 1.58-1.453 1.58M8.645 11.922h1.33c1.124 0 1.671-.633 1.671-1.553 0-.923-.548-1.539-1.68-1.539H8.646z"
            />
            <svg:path
                d="M0 4.8A1.8 1.8 0 0 1 1.8 3h20.4A1.8 1.8 0 0 1 24 4.8v14.4a1.8 1.8 0 0 1-1.8 1.8H1.8A1.8 1.8 0 0 1 0 19.2zm15.102 5.606c-.806 1.186-1.182 2.105-1.187 3.083-.009 1.983 1.54 3.138 3.392 3.138 1.924 0 3.328-1.273 3.328-3.179 0-1.784-1.228-3.02-2.934-3.02-.254 0-.503.045-.73.095l2.144-3.14a.1.1 0 0 0-.082-.156h-1.679a.2.2 0 0 0-.166.088zM6.684 16.3c0 .11.09.2.2.2h1.56a.2.2 0 0 0 .2-.2v-2.807h1.649c2.132 0 3.373-1.272 3.373-3.124 0-1.842-1.218-3.142-3.324-3.142H6.884a.2.2 0 0 0-.2.2zm-1.558.2a.2.2 0 0 0 .2-.2V7.427a.2.2 0 0 0-.2-.2h-1.56a.2.2 0 0 0-.2.2V16.3c0 .11.09.2.2.2z"
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
export class KbqRectangleIp624 extends KbqSvgIcon {}
