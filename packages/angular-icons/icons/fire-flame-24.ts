import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFireFlame24]',
    template: `
        <svg:path
            d="M20.625 13.962c0-1.2-.18-2.21-.73-3.45-.269-.603-1.182-2.416-1.522-3.088a.15.15 0 0 0-.265-.003l-1.184 2.168c-.518.949-1.084 2.278-2.168 2.278-1.072 0-1.548-1.363-1.9-2.37-.56-1.6-1.51-4.371-2.646-7.891-.038-.117-.19-.145-.262-.046-.834 1.147-4.476 6.2-5.689 8.624a8.5 8.5 0 0 0-.884 3.773c0 1.16.228 2.278.678 3.322a8.604 8.604 0 0 0 4.59 4.548 8.6 8.6 0 0 0 3.357.673c1.16 0 2.29-.225 3.358-.669a8.55 8.55 0 0 0 2.74-1.828 8.45 8.45 0 0 0 1.847-2.714 8.4 8.4 0 0 0 .68-3.327"
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
export class KbqFireFlame24 extends KbqSvgIcon {}
