import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqTextBold24]',
    template: `
        <svg:path
            d="M16.428 11.794q.254-.1.477-.223 1.185-.656 1.69-1.7a5.1 5.1 0 0 0 .506-2.237q0-1.366-.52-2.37a4.44 4.44 0 0 0-1.517-1.688q-.985-.67-2.395-.991-1.411-.335-3.208-.335H4.8a.3.3 0 0 0-.3.3v18.9a.3.3 0 0 0 .3.3h7.42q2.395 0 4.02-.643 1.623-.642 2.435-1.928.825-1.286.825-3.201 0-1.126-.492-2.157-.493-1.03-1.637-1.66a4 4 0 0 0-.943-.367M9.172 13.46h3.234q.892 0 1.424.308.532.294.772.844.253.549.253 1.299 0 .615-.266 1.125-.253.495-.839.803-.572.295-1.53.295H9.172zm2.262-3.08H9.172v-4.5h2.289q1.038 0 1.69.24.666.228.972.737.306.51.306 1.34 0 .722-.306 1.205-.293.482-.945.736-.652.242-1.744.242"
        />
    `,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 24 24',
        width: '24',
        height: '24'
    }
})
export class KbqTextBold24 extends KbqSvgIcon {}
