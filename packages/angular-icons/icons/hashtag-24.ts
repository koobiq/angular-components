import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-hashtag-24,[kbqHashtag24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M6.004 21.75a.3.3 0 0 1-.296-.347l.817-5.144H2.55a.3.3 0 0 1-.3-.3v-1.65a.3.3 0 0 1 .3-.3h4.333l.623-3.924H3.465a.3.3 0 0 1-.3-.3V8.12a.3.3 0 0 1 .3-.3h4.4l.846-5.318a.3.3 0 0 1 .296-.253h1.6a.3.3 0 0 1 .297.347l-.83 5.224h5.262l.849-5.318a.3.3 0 0 1 .296-.253h1.6a.3.3 0 0 1 .296.347l-.833 5.224h3.906a.3.3 0 0 1 .3.3v1.664a.3.3 0 0 1-.3.3h-4.267l-.626 3.924h3.966a.3.3 0 0 1 .3.3v1.65a.3.3 0 0 1-.3.3h-4.325l-.835 5.238a.3.3 0 0 1-.297.253h-1.6a.3.3 0 0 1-.296-.347l.82-5.144H8.733L7.9 21.497a.3.3 0 0 1-.297.253zm8.345-7.741.626-3.924H9.714l-.624 3.924z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHashtag24 extends KbqSvgIcon {}
