import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-file-badge-arrow-right-o-24,[kbqFileBadgeArrowRightO24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M20.912 5.912a.3.3 0 0 1 .088.212v7.106l-2.093-1.236a2 2 0 0 0-.307-.147V7.5h-4.8a.3.3 0 0 1-.3-.3V2.4H5.7a.3.3 0 0 0-.3.3v18.6a.3.3 0 0 0 .3.3h9.75V24H4.8A1.8 1.8 0 0 1 3 22.2V1.8A1.8 1.8 0 0 1 4.8 0h10.076a.3.3 0 0 1 .212.088zm2.944 11.093a.281.281 0 0 1 0 .49l-5.864 3.46c-.205.121-.47-.017-.47-.245v-2.302h-5.215a.3.3 0 0 1-.307-.29v-1.737c0-.16.137-.29.307-.29h5.215v-2.3c0-.228.265-.367.47-.247z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileBadgeArrowRightO24 extends KbqSvgIcon {}
