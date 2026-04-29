import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-windows-24,[kbqWindows24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 3.271c0-.136.104-.25.24-.262l9.975-.856a.263.263 0 0 1 .285.261v8.311a.263.263 0 0 1-.263.263h-9.975a.26.26 0 0 1-.262-.263zm-10.265.801a.263.263 0 0 0-.235.261v6.392c0 .145.118.263.262.263h8.066a.26.26 0 0 0 .263-.263v-7.24a.263.263 0 0 0-.29-.26zm-.013 14.826a.26.26 0 0 1-.222-.26v-5.42c0-.144.118-.262.262-.262h8.066c.145 0 .263.118.263.263v6.69a.263.263 0 0 1-.303.26zm10.507 1.594a.263.263 0 0 1-.23-.26v-7.013c0-.145.118-.263.263-.263h9.976c.145 0 .262.118.262.263v8.298c0 .159-.14.28-.296.26z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqWindows24 extends KbqSvgIcon {}
