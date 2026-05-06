import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqLinkedin24]',
    template: `
        <svg:path
            d="M21.3 1.5a1.2 1.2 0 0 1 1.2 1.2v18.6a1.2 1.2 0 0 1-1.2 1.2H2.7a1.2 1.2 0 0 1-1.2-1.2V2.7a1.2 1.2 0 0 1 1.2-1.2zm-16.8 18 3.217.001V9.958H4.5zm11.389-9.766c-1.683 0-2.437.926-2.859 1.576V9.958H9.858c.042.892 0 9.484 0 9.543h3.172v-5.33c0-.284.021-.569.105-.773.229-.57.75-1.16 1.627-1.16 1.147 0 1.607.876 1.607 2.159V19.5h3.171v-5.472c0-2.93-1.565-4.295-3.651-4.295m-2.859 1.609h-.021l.021-.033zM6.151 5.358c-1.084 0-1.794.713-1.794 1.649 0 .916.689 1.648 1.753 1.648h.02c1.107 0 1.795-.732 1.795-1.648-.02-.936-.689-1.649-1.774-1.649"
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
export class KbqLinkedin24 extends KbqSvgIcon {}
