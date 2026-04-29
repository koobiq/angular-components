import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-android-24,[kbqAndroid24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="m18.287 8.8 2.037-3.527a.9.9 0 1 0-1.559-.9l-2.091 3.623A12.4 12.4 0 0 0 12 7.1c-1.68 0-3.255.319-4.677.897L5.233 4.38a.9.9 0 0 0-1.558.9l2.034 3.522C2.514 10.712.368 14.064 0 17.958h24c-.368-3.895-2.515-7.246-5.713-9.157M7.65 13.576a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0m9.9 1.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqAndroid24 extends KbqSvgIcon {}
