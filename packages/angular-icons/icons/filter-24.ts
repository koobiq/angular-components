import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFilter24]',
    template: `
        <svg:path
            d="M20.7 3H3.3a.3.3 0 0 0-.3.3v1.8c0 .567.267 1.1.72 1.44L9 10.5v7.887a1.8 1.8 0 0 0 .995 1.61l4.57 2.286a.3.3 0 0 0 .435-.268V10.5l5.28-3.96A1.8 1.8 0 0 0 21 5.1V3.3a.3.3 0 0 0-.3-.3"
        />
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
export class KbqFilter24 extends KbqSvgIcon {}
