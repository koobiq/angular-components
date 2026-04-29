import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-circle-telegram-24,[kbqCircleTelegram24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M12 22.5c5.799 0 10.5-4.701 10.5-10.5S17.799 1.5 12 1.5 1.5 6.201 1.5 12 6.201 22.5 12 22.5M5.446 11.583s5.42-2.225 7.3-3.008a302 302 0 0 1 3.164-1.316s1.127-.438 1.033.627c-.022.317-.16 1.205-.328 2.3l-.204 1.334c-.376 2.35-.783 4.919-.783 4.919s-.063.72-.596.846c-.532.125-1.41-.439-1.566-.564-.027-.02-.153-.103-.342-.227-.682-.445-2.185-1.427-2.822-1.966-.22-.188-.47-.564.03-1.003a120 120 0 0 0 3.29-3.133c.377-.376.752-1.253-.814-.188C10.584 11.74 8.39 13.18 8.39 13.18s-.502.314-1.442.032-2.036-.658-2.036-.658-.752-.47.533-.971"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCircleTelegram24 extends KbqSvgIcon {}
