import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqLinkedinAlt24]',
    template: `
        <svg:g>
            <svg:path
                d="M5.996 20.316H1.494V7.115h4.502zM17.448 6.804c2.887 0 5.052 1.888 5.052 5.943v7.569h-4.387v-7.062c0-1.775-.636-2.985-2.224-2.985-1.212 0-1.934.815-2.251 1.604-.116.282-.144.676-.144 1.07v7.373H9.105c0-.073.058-11.963 0-13.201h4.39v1.87c.582-.9 1.625-2.18 3.953-2.18M3.759.75c1.501 0 2.425.985 2.453 2.28 0 1.268-.952 2.282-2.483 2.282h-.027c-1.473 0-2.425-1.014-2.425-2.281 0-1.296.981-2.28 2.482-2.281"
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
export class KbqLinkedinAlt24 extends KbqSvgIcon {}
