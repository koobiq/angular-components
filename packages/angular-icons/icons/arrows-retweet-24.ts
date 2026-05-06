import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowsRetweet24]',
    template: `
        <svg:g>
            <svg:path
                d="M14.541 9.496a.3.3 0 0 0 .459-.25v-2.28h4.8c.166 0 .3.133.3.297v9.474a.3.3 0 0 1-.3.296h-2.962c-.165 0-.3.133-.3.296v1.777c0 .163.135.296.3.296H22.2c.166 0 .3-.133.3-.296V4.894a.3.3 0 0 0-.3-.296H15V2.172a.3.3 0 0 0-.459-.251L8.807 5.457a.294.294 0 0 0 0 .502zM6.556 4.598c.165 0 .3.133.3.296v1.777a.3.3 0 0 1-.3.296H4.2c-.166 0-.3.132-.3.296v9.474c0 .164.134.296.3.296h4.2v-2.278a.3.3 0 0 1 .459-.251l5.734 3.537a.294.294 0 0 1 0 .502L8.859 22.08a.3.3 0 0 1-.459-.252v-2.426H1.8a.3.3 0 0 1-.3-.296V4.894c0-.163.134-.296.3-.296z"
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
export class KbqArrowsRetweet24 extends KbqSvgIcon {}
