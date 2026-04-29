import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-telegram-24,[kbqTelegram24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M1.456 11.794q8.527-3.716 11.372-4.898c5.415-2.253 6.54-2.644 7.274-2.657.161-.003.522.037.756.227.197.16.251.376.277.528s.058.497.033.768c-.294 3.083-1.563 10.566-2.21 14.02-.273 1.46-.811 1.95-1.332 1.998-1.133.104-1.992-.748-3.09-1.467-1.715-1.125-2.685-1.825-4.35-2.923-1.926-1.269-.678-1.966.42-3.106.286-.298 5.276-4.836 5.372-5.248.012-.051.024-.243-.09-.345-.115-.101-.283-.066-.404-.039q-.258.059-8.225 5.437-1.168.801-2.115.78c-.696-.014-2.036-.393-3.031-.716C.89 13.756-.08 13.546.005 12.87q.066-.526 1.451-1.077"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqTelegram24 extends KbqSvgIcon {}
