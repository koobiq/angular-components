import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-rectangle-ip4-16,[kbqRectangleIp416]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M11.935 6.243v2.623h-1.676v-.048l1.627-2.575zM5.557 7.948V5.887h.881c.755 0 1.12.41 1.12 1.026 0 .613-.365 1.035-1.114 1.035z"
                />
                <path
                    d="M0 3.2A1.2 1.2 0 0 1 1.2 2h13.6A1.2 1.2 0 0 1 16 3.2v9.6a1.2 1.2 0 0 1-1.2 1.2H1.2A1.2 1.2 0 0 1 0 12.8zm8.943 5.684v.83c0 .11.09.2.2.2h2.767v.886c0 .11.09.2.2.2h.85a.2.2 0 0 0 .2-.2v-.887h.567a.2.2 0 0 0 .2-.2v-.647a.2.2 0 0 0-.2-.2h-.567V5.018a.2.2 0 0 0-.2-.2h-1.326a.2.2 0 0 0-.169.093zM4.25 10.8c0 .11.09.2.2.2h.907a.2.2 0 0 0 .2-.2V8.996h1.098c1.422 0 2.25-.849 2.25-2.083 0-1.229-.813-2.095-2.216-2.095h-2.24a.2.2 0 0 0-.2.2zm-1.106.2a.2.2 0 0 0 .2-.2V5.018a.2.2 0 0 0-.2-.2h-.907a.2.2 0 0 0-.2.2V10.8c0 .11.09.2.2.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqRectangleIp416 extends KbqSvgIcon {}
