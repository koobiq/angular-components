import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-widget-plus-24,[kbqWidgetPlus24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M1.5 6.237A4.734 4.734 0 0 1 6.232 1.5a4.734 4.734 0 0 1 4.731 4.737 4.734 4.734 0 0 1-4.731 4.737A4.734 4.734 0 0 1 1.5 6.237M13.037 6.237A4.734 4.734 0 0 1 17.768 1.5 4.734 4.734 0 0 1 22.5 6.237a4.734 4.734 0 0 1-4.732 4.737 4.734 4.734 0 0 1-4.731-4.737M1.5 17.763a4.734 4.734 0 0 1 4.732-4.737 4.734 4.734 0 0 1 4.731 4.737A4.734 4.734 0 0 1 6.232 22.5 4.734 4.734 0 0 1 1.5 17.763M16.546 16.563v-3.237a.3.3 0 0 1 .3-.3h1.797a.3.3 0 0 1 .3.3v3.237h3.233a.3.3 0 0 1 .3.3v1.8a.3.3 0 0 1-.3.3h-3.232V22.2a.3.3 0 0 1-.3.3h-1.798a.3.3 0 0 1-.3-.3v-3.237h-3.233a.3.3 0 0 1-.3-.3v-1.8a.3.3 0 0 1 .3-.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqWidgetPlus24 extends KbqSvgIcon {}
