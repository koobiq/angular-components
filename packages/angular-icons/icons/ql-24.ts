import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-ql-24,[kbqQl24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M11.316 17.848c1.42-1.271 2.3-3.259 2.3-5.85 0-4.756-2.953-7.468-6.808-7.468C2.932 4.53 0 7.242 0 11.998c0 4.735 2.932 7.468 6.808 7.468.909 0 1.768-.149 2.548-.447l1.112 1.367a.2.2 0 0 0 .155.074h2.565a.1.1 0 0 0 .079-.162zm-2.9-3.558a.2.2 0 0 0-.158-.077H5.944a.1.1 0 0 0-.08.16l1.739 2.296a4 4 0 0 1-.795.078c-2.236 0-3.692-1.668-3.692-4.749s1.456-4.75 3.692-4.75c2.229 0 3.691 1.67 3.691 4.75 0 1.583-.39 2.797-1.065 3.6zm6.477-9.561a.2.2 0 0 0-.2.2v14.138c0 .11.09.2.2.2H23.8a.2.2 0 0 0 .2-.2v-2.134a.2.2 0 0 0-.2-.2h-6.033V4.929a.2.2 0 0 0-.2-.2z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqQl24 extends KbqSvgIcon {}
