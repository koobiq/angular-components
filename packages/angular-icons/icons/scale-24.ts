import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-scale-24,[kbqScale24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24">
            <path
                d="M18.01 20.414a.3.3 0 0 0-.3-.298h-4.504l.034-13.2 5.074-1.567v3.596h-3.002a.284.284 0 0 0-.29.298 4.46 4.46 0 0 0 1.309 2.863 4.52 4.52 0 0 0 3.184 1.31 4.52 4.52 0 0 0 3.185-1.31 4.46 4.46 0 0 0 1.309-2.863.284.284 0 0 0-.29-.298h-3.003v-6.43a.3.3 0 0 0-.39-.284L13.24 4.42V1.798a.3.3 0 0 0-.3-.298H11.14a.3.3 0 0 0-.3.298V5.16L3.513 7.421a.3.3 0 0 0-.211.285v5.71H.3a.284.284 0 0 0-.29.297 4.46 4.46 0 0 0 1.31 2.863 4.52 4.52 0 0 0 3.184 1.31 4.52 4.52 0 0 0 3.184-1.31 4.46 4.46 0 0 0 1.309-2.863.284.284 0 0 0-.29-.297H5.704V9.46c0-.13.086-.246.211-.284l4.923-1.52-.034 12.459H6.3a.3.3 0 0 0-.3.298v1.788a.3.3 0 0 0 .3.298h11.41a.3.3 0 0 0 .3-.298z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqScale24 extends KbqSvgIcon {}
