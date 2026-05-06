import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqArrowsRotateReverseSlash24]',
    template: `
        <svg:g>
            <svg:path
                d="M13.5 19.964v-.003a8 8 0 0 0 1.697-.516l1.797 1.797a10.5 10.5 0 0 1-3.718 1.184.294.294 0 0 1-.32-.225l-.423-1.76a.31.31 0 0 1 .274-.377q.348-.035.693-.1M20.74 22.437c.118.092.29.083.399-.026l1.272-1.272a.303.303 0 0 0 0-.429l-2.184-2.184q.468-.588.839-1.224c2.356-4.022 1.809-9.277-1.642-12.727l1.008-1.008.414-.413a.3.3 0 0 0-.145-.504l-5.9-1.361a.3.3 0 0 0-.36.36l1.362 5.899a.3.3 0 0 0 .505.144l1.416-1.417.001.001a8.1 8.1 0 0 1 .79 10.538L7.187 5.486A8.05 8.05 0 0 1 10.5 4.043v-.004q.344-.065.69-.099a.31.31 0 0 0 .275-.377l-.423-1.76a.294.294 0 0 0-.32-.225c-1.872.228-3.695.96-5.248 2.195l-2.19-2.19a.303.303 0 0 0-.429 0L1.583 2.855a.303.303 0 0 0-.026.4zM2.76 7.008c-2.155 3.98-1.55 9.058 1.813 12.421l-1.007 1.008-.414.412a.3.3 0 0 0 .145.505l5.899 1.361a.3.3 0 0 0 .36-.36l-1.362-5.899a.3.3 0 0 0-.504-.144l-1.417 1.416a8.1 8.1 0 0 1-1.718-8.925z"
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
export class KbqArrowsRotateReverseSlash24 extends KbqSvgIcon {}
