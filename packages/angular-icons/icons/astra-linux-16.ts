import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-astra-linux-16,[kbqAstraLinux16]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <path
                d="m5.425 11.189 1.602.712-1.856 1.016zm2.85.318L5.5 7.5l5.002 3.001.354 2.404-2.272-1.23zm2.183-2.092L9 6.5l2.722 1.555-.97 1.045zm3.2-3.343-.092-.016-3.315-.563A492 492 0 0 1 8.67 2.179l-.062-.132-.152-.32-.162-.349-.102-.22a.2.2 0 0 0-.362-.002l-.105.219-.32.666-.064.134-1.591 3.318-3.333.566-.083.014-.668.114-.3.05a.2.2 0 0 0-.112.334l.207.222.462.496.057.061 2.416 2.593-.543 3.696-.018.118-.104.71-.039.262a.2.2 0 0 0 .294.205l.232-.128.63-.344.105-.057 3.06-1.675 3.062 1.658.103.056.629.34.235.128a.2.2 0 0 0 .293-.205l-.04-.265-.103-.707-.017-.116-.545-3.7c.464-.499 1.74-1.873 2.38-2.57l.058-.063c.178-.193.296-.323.318-.35l.148-.154.203-.21a.2.2 0 0 0-.11-.336l-.288-.049z"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqAstraLinux16 extends KbqSvgIcon {}
