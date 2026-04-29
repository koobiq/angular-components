import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-android-16,[kbqAndroid16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="m12.192 5.867 1.357-2.352a.6.6 0 1 0-1.039-.6L11.116 5.33A8.25 8.25 0 0 0 8 4.733c-1.12 0-2.17.213-3.118.598L3.489 2.92a.6.6 0 1 0-1.039.6l1.356 2.348C1.676 7.142.246 9.375 0 11.972h16c-.245-2.597-1.677-4.831-3.809-6.105M5.1 9.05a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0m6.6.8a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqAndroid16 extends KbqSvgIcon {}
