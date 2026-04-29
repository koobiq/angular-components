import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-cloud-badge-globe-24,[kbqCloudBadgeGlobe24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M5.414 16.5a5.414 5.414 0 0 1-.138-10.827 7.503 7.503 0 0 1 13.838.945 4.94 4.94 0 0 1 4.447 6.979A7.053 7.053 0 0 0 12.066 16.5zm18.58 3.017a.147.147 0 0 0-.146-.166H21.63a.15.15 0 0 0-.151.141 10.5 10.5 0 0 1-1.3 4.406 5.31 5.31 0 0 0 3.816-4.381m.001-1.493a5.32 5.32 0 0 0-3.812-4.38 10.56 10.56 0 0 1 1.296 4.404c.005.08.071.142.15.142h2.22c.089 0 .158-.078.146-.166m-10.464 0a5.32 5.32 0 0 1 3.812-4.38 10.56 10.56 0 0 0-1.296 4.404.15.15 0 0 1-.15.142h-2.219a.147.147 0 0 1-.147-.166m2.365 1.327c.08 0 .146.062.151.141a10.5 10.5 0 0 0 1.3 4.406 5.32 5.32 0 0 1-3.816-4.381.147.147 0 0 1 .147-.166zm1.308.159a.15.15 0 0 1 .149-.16h2.82c.087 0 .155.074.149.16A9.35 9.35 0 0 1 18.763 24a9.35 9.35 0 0 1-1.559-4.49m3.118-1.48a9.37 9.37 0 0 0-1.559-4.496 9.37 9.37 0 0 0-1.559 4.497.15.15 0 0 0 .149.159h2.82a.15.15 0 0 0 .149-.16"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCloudBadgeGlobe24 extends KbqSvgIcon {}
