import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    selector: 'svg[kbqVk24]',
    template: `
        <svg:path
            d="M12.444 1.5c4.746 0 7.132 0 8.594 1.474S22.5 6.822 22.5 11.556v.888c0 4.735.012 7.108-1.462 8.582S17.19 22.5 12.444 22.5h-.875c-4.747 0-7.12 0-8.595-1.474C1.5 19.552 1.5 17.18 1.5 12.444v-.888c0-4.736 0-7.108 1.474-8.582S6.822 1.5 11.569 1.5zM5.049 7.897c.112 5.459 2.985 8.744 7.72 8.744h.274v-3.123c1.724.174 3.011 1.461 3.536 3.123h2.486c-.674-2.486-2.424-3.86-3.511-4.385 1.087-.649 2.624-2.223 2.987-4.359h-2.262c-.476 1.736-1.887 3.31-3.236 3.46v-3.46h-2.298v6.059c-1.399-.347-3.223-2.049-3.298-6.059z"
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
export class KbqVk24 extends KbqSvgIcon {}
