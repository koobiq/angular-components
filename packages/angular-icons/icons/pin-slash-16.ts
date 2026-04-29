import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-pin-slash-16,[kbqPinSlash16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M1.41.559a.2.2 0 0 1 .282 0L5.7 4.566c.613.032 1.2.177 1.713.455l1.91-3.406a1.204 1.204 0 0 1 1.9-.262l3.426 3.426c.564.564.434 1.51-.262 1.9L10.98 8.59c.28.513.423 1.1.454 1.713l4.006 4.006a.2.2 0 0 1 0 .283l-.85.85a.2.2 0 0 1-.283 0L.558 1.692a.2.2 0 0 1 0-.283zM10.67 13.502c-.23.421-.501.812-.813 1.15a.19.19 0 0 1-.276.003l-3.558-3.542-3.142 3.14a.2.2 0 0 1-.109.057l-1.157.189a.1.1 0 0 1-.113-.114l.188-1.158a.2.2 0 0 1 .056-.108L4.89 9.98 1.345 6.423a.19.19 0 0 1 .005-.277A5.8 5.8 0 0 1 2.5 5.333z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqPinSlash16 extends KbqSvgIcon {}
