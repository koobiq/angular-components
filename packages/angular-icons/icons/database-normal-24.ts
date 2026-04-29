import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-database-normal-24,[kbqDatabaseNormal24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <g>
                <path
                    d="M21 5.25c0-2.071-4.03-3.75-9-3.75S3 3.179 3 5.25v1.515C3.02 8.83 7.042 10.5 12 10.5s8.98-1.67 9-3.735z"
                />
                <path
                    d="M12.497 12.295c2.476-.052 4.78-.49 6.56-1.232.702-.293 1.37-.652 1.943-1.09v2.792a1.6 1.6 0 0 1-.044.36H13.8a.3.3 0 0 0-.3.3v3.023a21.5 21.5 0 0 1-3.093-.007 20 20 0 0 1-1.542-.175c-2.545-.394-4.546-1.254-5.406-2.33-.294-.369-.455-.762-.459-1.17V9.972c.573.438 1.241.797 1.944 1.09C6.84 11.853 9.337 12.3 12 12.3q.25 0 .497-.005M12 18.3l1.5-.051v4.2a22 22 0 0 1-1.5.051c-1.087 0-2.13-.08-3.094-.227l-.041-.007C5.44 21.736 3 20.362 3 18.75v-2.777c.573.438 1.241.797 1.944 1.09 1.479.616 3.321 1.023 5.324 1.173A23 23 0 0 0 12 18.3"
                />
                <path
                    d="M16.822 24a.3.3 0 0 0 .3-.3V17.92l3.466 5.93a.3.3 0 0 0 .26.149H22.2a.3.3 0 0 0 .3-.3v-8.468a.3.3 0 0 0-.3-.3H20.98a.3.3 0 0 0-.3.3v5.785L17.21 15.08a.3.3 0 0 0-.259-.149H15.6a.3.3 0 0 0-.3.3V23.7a.3.3 0 0 0 .3.3z"
                />
            </g>
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqDatabaseNormal24 extends KbqSvgIcon {}
