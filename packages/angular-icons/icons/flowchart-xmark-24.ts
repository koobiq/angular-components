import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-flowchart-xmark-24,[kbqFlowchartXmark24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M15.735 2.457a.3.3 0 0 1 0-.424L17.008.76a.3.3 0 0 1 .424 0l2.043 2.043L21.519.759a.3.3 0 0 1 .424 0l1.273 1.272a.3.3 0 0 1 0 .425L21.172 4.5l2.042 2.042a.3.3 0 0 1 0 .424L21.941 8.24a.3.3 0 0 1-.424 0l-2.042-2.042-2.04 2.04a.303.303 0 0 1-.427.002l-1.273-1.273a.303.303 0 0 1 .003-.427l2.04-2.04z"
                />
                <path
                    d="M14.776 3.3H10.8a.3.3 0 0 0-.3.3v7.2h-3v-3a.3.3 0 0 0-.3-.3H1.8a.3.3 0 0 0-.3.3v8.4a.3.3 0 0 0 .3.3h5.4a.3.3 0 0 0 .3-.3v-3h3v7.2a.3.3 0 0 0 .3.3h5.7v1.5a.3.3 0 0 0 .3.3h5.4a.3.3 0 0 0 .3-.3v-5.4a.3.3 0 0 0-.3-.3h-5.4a.3.3 0 0 0-.3.3v1.5h-3.6V5.7h1.875l1.2-1.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFlowchartXmark24 extends KbqSvgIcon {}
