import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqDatabaseBadgeArrowDown16]',
    template: `
        <svg:path
            d="M8 1c3.314 0 6 1.12 6 2.5v1.01C13.987 5.886 11.306 7 8 7S2.013 5.886 2 4.51V3.5C2 2.12 4.686 1 8 1m3.45 6.79-3.07 3.205a15 15 0 0 1-1.442-.034 13 13 0 0 1-1.028-.117c-1.697-.263-3.03-.836-3.604-1.554-.196-.245-.303-.507-.306-.78V6.65c.382.292.827.531 1.296.726C4.56 7.902 6.224 8.2 8 8.2q.167 0 .332-.003a13.8 13.8 0 0 0 3.119-.407m-4.605 4.367q.198.015.4.025l-.179.185 2.542 2.542Q8.838 15 8 15c-.725 0-1.42-.054-2.063-.152l-.027-.004C3.627 14.491 2 13.574 2 12.5v-1.851a5.8 5.8 0 0 0 1.296.726c.986.411 2.214.683 3.549.782m5.487 3.784-3.326-3.326a.2.2 0 0 1 0-.283l.848-.848a.2.2 0 0 1 .283 0l1.537 1.536V8.7c0-.11.09-.2.2-.2h1.2c.11 0 .2.09.2.2v4.32l1.536-1.536a.2.2 0 0 1 .283 0l.848.848a.2.2 0 0 1 0 .283l-3.326 3.326a.2.2 0 0 1-.283 0"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    }
})
export class KbqDatabaseBadgeArrowDown16 extends KbqSvgIcon {}
