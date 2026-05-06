import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqBolt24]',
    template: `
        <svg:path
            d="M8.197.213C8.232.086 8.33 0 8.44 0h7.153c.179 0 .303.217.24.42l-2.771 8.916h6.18c.222 0 .34.319.19.52L9 23.895c-.183.245-.513.023-.438-.294l2.264-9.598H4.757c-.175 0-.3-.208-.244-.41z"
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
export class KbqBolt24 extends KbqSvgIcon {}
