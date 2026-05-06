import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqPinSlash24]',
    template: `
        <svg:g>
            <svg:path
                d="M2.114.838a.3.3 0 0 1 .425 0L8.55 6.85c.92.048 1.8.264 2.57.682l2.863-5.11a1.806 1.806 0 0 1 2.852-.393l5.14 5.14c.845.846.649 2.265-.395 2.85l-5.108 2.864c.419.77.634 1.65.681 2.57l6.01 6.008a.3.3 0 0 1 0 .425l-1.277 1.276a.3.3 0 0 1-.425 0L.838 2.54a.3.3 0 0 1 0-.425zM16.005 20.253a8.6 8.6 0 0 1-1.219 1.724.286.286 0 0 1-.414.006L9.035 16.67l-4.714 4.71a.3.3 0 0 1-.162.084l-1.736.285a.15.15 0 0 1-.17-.172l.283-1.736a.3.3 0 0 1 .083-.162l4.714-4.711-5.316-5.334a.287.287 0 0 1 .007-.414A8.6 8.6 0 0 1 3.751 8z"
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
export class KbqPinSlash24 extends KbqSvgIcon {}
