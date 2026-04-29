import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-user-mask-16,[kbqUserMask16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="M11.224 1.958A5.9 5.9 0 0 0 8 1a5.94 5.94 0 0 0-4.243 1.79A6.17 6.17 0 0 0 2 7.115a6.16 6.16 0 0 0 1.403 3.93c-.836.564-1.355 1.284-1.4 2.072a.146.146 0 0 0 .104.144l5.836 1.732a.2.2 0 0 0 .114 0l5.835-1.732a.146.146 0 0 0 .104-.144c-.045-.787-.564-1.507-1.4-2.071a6.17 6.17 0 0 0 1.353-3.132 6.2 6.2 0 0 0-.511-3.383 6.1 6.1 0 0 0-2.214-2.572M4.559 5.766c0-.907 1.6-.28 2.322.25.25.184.442.388.442.58 0 .525-.77.521-1.472.519h-.153c-.736 0-1.14-.786-1.14-1.349m4.622.206c.728-.486 2.278-1.093 2.278-.206 0 .563-.37 1.348-1.107 1.348h-.153c-.71.003-1.543.007-1.543-.517 0-.209.232-.43.525-.625m-.43 3.706c-.22-.03-.477-.066-.751-.066s-.53.035-.75.066c-.441.06-.737.102-.737-.201 0-.455.666-1.045 1.487-1.045s1.487.59 1.487 1.045c0 .303-.296.262-.736.2"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUserMask16 extends KbqSvgIcon {}
