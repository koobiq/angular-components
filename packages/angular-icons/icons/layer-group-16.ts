import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-layer-group-16,[kbqLayerGroup16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="m2.478 10.14-1.422.821a.097.097 0 0 0 0 .177l6.853 3.808a.21.21 0 0 0 .182 0l6.853-3.808a.097.097 0 0 0 0-.177l-1.42-.822-5.433 3.019a.21.21 0 0 1-.182 0z"
                />
                <path
                    d="m2.479 7.15-1.423.823a.097.097 0 0 0 0 .176l6.853 3.808a.2.2 0 0 0 .182 0l6.853-3.808a.097.097 0 0 0 0-.176l-1.422-.823-5.431 3.018a.21.21 0 0 1-.182 0z"
                />
                <path
                    d="M7.915 1.02a.21.21 0 0 1 .182 0l6.847 3.964a.097.097 0 0 1 0 .176L8.09 8.968a.21.21 0 0 1-.182 0L1.056 5.16a.097.097 0 0 1 0-.176z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqLayerGroup16 extends KbqSvgIcon {}
