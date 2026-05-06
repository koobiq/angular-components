import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFolderBadgeArrowRight24]',
    template: `
        <svg:path
            d="M1.5 4.8A1.8 1.8 0 0 1 3.3 3h4.2l2.7 2.7H1.5zm0 2.7v11.7A1.8 1.8 0 0 0 3.296 21H10.2v-3.375a.3.3 0 0 1 .3-.3h5.25v-3.744a.3.3 0 0 1 .455-.258L22.5 17.11V9.3a1.8 1.8 0 0 0-1.8-1.8zm22.356 12.505a.281.281 0 0 1 0 .49l-5.864 3.46c-.205.121-.47-.017-.47-.245v-2.302h-5.215a.3.3 0 0 1-.307-.29v-1.737c0-.16.137-.29.307-.29h5.215v-2.3c0-.228.265-.367.47-.247z"
        />
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
export class KbqFolderBadgeArrowRight24 extends KbqSvgIcon {}
