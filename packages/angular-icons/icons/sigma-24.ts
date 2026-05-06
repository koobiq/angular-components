import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqSigma24]',
    template: `
        <svg:path
            d="M18.75 19.385a.3.3 0 0 0-.3-.3H9.59l5.11-6.939a.3.3 0 0 0 .058-.178v-.07a.3.3 0 0 0-.06-.179l-5.07-6.79h8.362a.3.3 0 0 0 .3-.3V2.55a.3.3 0 0 0-.3-.3H5.55a.3.3 0 0 0-.3.3v1.552a.3.3 0 0 0 .063.185l5.965 7.646-5.966 7.78a.3.3 0 0 0-.062.183v1.554a.3.3 0 0 0 .3.3h12.9a.3.3 0 0 0 .3-.3z"
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
export class KbqSigma24 extends KbqSvgIcon {}
