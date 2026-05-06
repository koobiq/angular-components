import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowsCollapseDiagonal24]',
    template: `
        <svg:g>
            <svg:path
                d="M17.096 8.599h4.376c.168 0 .303.135.303.303v1.685a.304.304 0 0 1-.303.303h-8.058a.304.304 0 0 1-.304-.303V2.529c0-.168.136-.303.304-.303h1.684c.168 0 .304.135.304.303v4.36l5.309-5.3a.304.304 0 0 1 .429 0l1.271 1.273a.303.303 0 0 1 0 .43zM8.598 17.11 3.29 22.411a.304.304 0 0 1-.429 0l-1.271-1.273a.304.304 0 0 1 0-.43l5.315-5.307H2.528a.304.304 0 0 1-.303-.303v-1.685c0-.167.135-.303.303-.303h8.058c.168 0 .304.136.304.303v8.058a.304.304 0 0 1-.304.303H8.902a.304.304 0 0 1-.304-.303z"
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
export class KbqArrowsCollapseDiagonal24 extends KbqSvgIcon {}
