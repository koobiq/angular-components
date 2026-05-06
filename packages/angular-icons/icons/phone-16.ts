import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPhone16]',
    template: `
        <svg:path
            d="M11.032 10.196a.2.2 0 0 0-.213.075c-.58.806-.849 1.2-1.189 1.675C7.186 10.899 5.1 8.81 4.054 6.37c.475-.34.87-.61 1.674-1.189a.2.2 0 0 0 .077-.212C5.472 3.718 5.122 2.386 4.712 1H2.529C1 1 1 2.233 1 2.804 1 9.222 6.771 15 13.195 15c.571 0 1.804 0 1.804-1.528v-2.035a.2.2 0 0 0-.142-.19c-1.335-.393-2.618-.73-3.825-1.052"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqPhone16 extends KbqSvgIcon {}
