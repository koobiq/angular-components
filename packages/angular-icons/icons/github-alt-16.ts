import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-github-alt-16,[kbqGithubAlt16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M6.91 16a1.256 1.256 0 0 1-1.254-1.24l-.003-.628c-2.782.6-3.36-1.201-3.36-1.201-.448-1.167-1.11-1.468-1.11-1.468-.91-.617.066-.617.066-.617 1.01.067 1.54 1.034 1.54 1.034.894 1.535 2.334 1.101 2.914.834.082-.65.347-1.1.629-1.35-2.219-.234-4.553-1.101-4.553-4.971 0-1.1.397-2.001 1.026-2.702-.099-.25-.447-1.284.1-2.668 0 0 .844-.267 2.748 1.034a9.6 9.6 0 0 1 2.5-.334c.844 0 1.705.117 2.5.334C12.557.756 13.4 1.023 13.4 1.023c.546 1.384.198 2.418.1 2.668.645.7 1.026 1.601 1.026 2.702 0 3.87-2.334 4.72-4.57 4.97.365.317.68.918.68 1.868 0 .57-.004 1.09-.007 1.529A1.25 1.25 0 0 1 9.38 16z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqGithubAlt16 extends KbqSvgIcon {}
