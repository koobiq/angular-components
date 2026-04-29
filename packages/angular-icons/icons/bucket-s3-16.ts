import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-bucket-s3-16,[kbqBucketS316]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g>
                <path
                    d="M8 1c3.314 0 6 1.12 6 2.5v.012c-.013 1.376-2.694 2.49-6 2.49s-5.987-1.114-6-2.49V3.5C2 2.12 4.686 1 8 1"
                />
                <path
                    d="M2 5.65c.384.294.833.535 1.305.731 1.264.525 2.924.82 4.695.82s3.431-.295 4.695-.82c.472-.196.92-.437 1.305-.73l-1.002 7.326c-.078 1.11-2.238 2.001-4.909 2.02L8 15q-.164 0-.318-.006c-2.506-.065-4.511-.9-4.672-1.944zM7.2 8.4a.2.2 0 0 0-.2.2v1.6c0 .11.09.2.2.2h1.6a.2.2 0 0 0 .2-.2V8.6a.2.2 0 0 0-.2-.2zm-2 2.6a.2.2 0 0 0-.2.2v1.6c0 .11.09.2.2.2h1.6a.2.2 0 0 0 .2-.2v-1.6a.2.2 0 0 0-.2-.2zm4 0a.2.2 0 0 0-.2.2v1.6c0 .11.09.2.2.2h1.6a.2.2 0 0 0 .2-.2v-1.6a.2.2 0 0 0-.2-.2z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqBucketS316 extends KbqSvgIcon {}
