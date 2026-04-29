import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-layer-group-24,[kbqLayerGroup24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="m3.717 15.21-2.133 1.232a.146.146 0 0 0 0 .264l10.28 5.712a.31.31 0 0 0 .272 0l10.28-5.712a.146.146 0 0 0 0-.264l-2.13-1.233-8.15 4.528a.31.31 0 0 1-.272 0z"
                />
                <path
                    d="m3.718 10.726-2.134 1.233a.146.146 0 0 0 0 .264l10.28 5.712a.31.31 0 0 0 .272 0l10.28-5.712a.146.146 0 0 0 0-.264l-2.132-1.234-8.148 4.527a.31.31 0 0 1-.272 0z"
                />
                <path
                    d="M11.873 1.531a.31.31 0 0 1 .272 0l10.27 5.945a.146.146 0 0 1 0 .264l-10.279 5.712a.31.31 0 0 1-.272 0L1.584 7.74a.146.146 0 0 1 0-.264z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqLayerGroup24 extends KbqSvgIcon {}
