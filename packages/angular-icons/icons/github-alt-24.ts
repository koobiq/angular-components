import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqGithubAlt24]',
    template: `
        <svg:path
            d="M9.745 24a1.26 1.26 0 0 1-1.255-1.24 137 137 0 0 1-.01-1.562c-4.173.9-5.042-1.802-5.042-1.802-.67-1.75-1.664-2.2-1.664-2.2-1.365-.927.1-.927.1-.927 1.515.1 2.31 1.552 2.31 1.552 1.34 2.301 3.5 1.65 4.37 1.25.124-.975.522-1.65.944-2.026-3.328-.35-6.83-1.651-6.83-7.455 0-1.652.596-3.003 1.54-4.053-.149-.375-.67-1.927.15-4.003 0 0 1.266-.4 4.121 1.551a14.4 14.4 0 0 1 3.75-.5c1.267 0 2.558.175 3.75.5 2.856-1.951 4.123-1.551 4.123-1.551.82 2.076.297 3.628.148 4.003.969 1.05 1.54 2.401 1.54 4.053 0 5.804-3.501 7.08-6.854 7.455.547.475 1.018 1.376 1.018 2.802 0 1.14-.008 2.155-.014 2.912A1.253 1.253 0 0 1 14.69 24z"
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
export class KbqGithubAlt24 extends KbqSvgIcon {}
