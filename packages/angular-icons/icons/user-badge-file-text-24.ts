import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'kbq-user-badge-file-text-24,[kbqUserBadgeFileText24]',
    template: `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path
                d="M16.5 6.75c0 2.9-2.015 6-4.5 6s-4.5-3.1-4.5-6S9.515 1.5 12 1.5s4.5 2.35 4.5 5.25m-4.5 7.8c.418 0 .819-.053 1.2-.15v8.1H3.24a.3.3 0 0 1-.292-.235L1.78 17.017a1.8 1.8 0 0 1 .831-1.934l4.924-2.955c1.017 1.31 2.552 2.422 4.464 2.422m11.695-1.05h-8.39a.306.306 0 0 0-.305.308v9.884c0 .17.136.308.305.308h8.39a.306.306 0 0 0 .305-.308v-9.884a.306.306 0 0 0-.305-.308m-6.586 3.006a.31.31 0 0 1-.309-.308v-.591c0-.17.138-.308.309-.308h4.783c.171 0 .31.138.31.308v.591c0 .17-.139.308-.31.308zm-.309 2.692v-.584c0-.17.138-.308.309-.308h4.783c.171 0 .31.138.31.308v.584c0 .17-.139.308-.31.308H17.11a.31.31 0 0 1-.309-.308m0 3v-.584c0-.17.138-.308.309-.308h2.979c.17 0 .308.138.308.308v.584c0 .17-.138.308-.308.308h-2.98a.31.31 0 0 1-.308-.308"
            />
        </svg>
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqUserBadgeFileText24 extends KbqSvgIcon {}
