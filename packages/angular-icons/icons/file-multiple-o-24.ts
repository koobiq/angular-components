import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqFileMultipleO24]',
    template: `
        <svg:g>
            <svg:path
                d="M12.776 24a.3.3 0 0 0 .212-.088L15.3 21.6H5.7a.3.3 0 0 1-.3-.3V4.2h-.6A1.8 1.8 0 0 0 3 6v16.2A1.8 1.8 0 0 0 4.8 24z"
            />
            <svg:path
                d="M22.05 5.074a.3.3 0 0 0-.088-.212L17.188.088A.3.3 0 0 0 16.976 0H9a1.8 1.8 0 0 0-1.8 1.8V18A1.8 1.8 0 0 0 9 19.8h11.25a1.8 1.8 0 0 0 1.8-1.8zM9.6 2.7a.3.3 0 0 1 .3-.3h5.546v4.35a.3.3 0 0 0 .3.3h3.904V17.1a.3.3 0 0 1-.3.3H9.9a.3.3 0 0 1-.3-.3z"
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
export class KbqFileMultipleO24 extends KbqSvgIcon {}
